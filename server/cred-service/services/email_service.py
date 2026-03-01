"""
Email service for sending generated reports as PDF attachments.
Supports Brevo (production), Resend (deprecated, kept for future), or SMTP (local dev).
Uses reportlab for PDF generation.
"""

import io
import re
import base64
import socket
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from typing import Dict
from datetime import datetime

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak
)

from app.config import settings

logger = logging.getLogger(__name__)

# Report metadata
REPORT_META = {
    "extensive_report": {
        "title": "Comprehensive Technical Report",
        "filename": "CredDev_Comprehensive_Report",
    },
    "developer_insight": {
        "title": "Developer Growth Insight",
        "filename": "CredDev_Developer_Insight",
    },
    "recruiter_insight": {
        "title": "Recruiter Hiring Signal",
        "filename": "CredDev_Recruiter_Report",
    },
}


def _create_pdf_styles() -> dict:
    """Create custom PDF styles matching CredDev branding."""
    base = getSampleStyleSheet()

    styles = {
        "title": ParagraphStyle(
            "CDTitle",
            parent=base["Title"],
            fontSize=22,
            leading=28,
            textColor=HexColor("#7c3aed"),
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "CDSubtitle",
            parent=base["Normal"],
            fontSize=10,
            textColor=HexColor("#6b7280"),
            spaceAfter=24,
        ),
        "heading": ParagraphStyle(
            "CDHeading",
            parent=base["Heading1"],
            fontSize=14,
            leading=18,
            textColor=HexColor("#1f2937"),
            spaceBefore=16,
            spaceAfter=8,
        ),
        "subheading": ParagraphStyle(
            "CDSubheading",
            parent=base["Heading2"],
            fontSize=12,
            leading=15,
            textColor=HexColor("#7c3aed"),
            spaceBefore=12,
            spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "CDBody",
            parent=base["Normal"],
            fontSize=10,
            leading=15,
            textColor=HexColor("#1f2937"),
            spaceAfter=8,
        ),
        "bold_body": ParagraphStyle(
            "CDBoldBody",
            parent=base["Normal"],
            fontSize=10,
            leading=15,
            textColor=HexColor("#111827"),
            spaceAfter=8,
        ),
        "bullet": ParagraphStyle(
            "CDBullet",
            parent=base["Normal"],
            fontSize=10,
            leading=14,
            textColor=HexColor("#374151"),
            leftIndent=20,
            spaceAfter=4,
            bulletIndent=8,
        ),
        "footer": ParagraphStyle(
            "CDFooter",
            parent=base["Normal"],
            fontSize=8,
            textColor=HexColor("#9ca3af"),
            alignment=1,  # center
        ),
    }
    return styles


def _add_header_footer(canvas_obj, doc):
    """Draw page header line and footer on each page."""
    canvas_obj.saveState()

    # Header line
    canvas_obj.setStrokeColor(HexColor("#a855f7"))
    canvas_obj.setLineWidth(1.5)
    canvas_obj.line(
        doc.leftMargin, letter[1] - 45,
        letter[0] - doc.rightMargin, letter[1] - 45
    )

    # Footer
    canvas_obj.setFont("Helvetica", 7)
    canvas_obj.setFillColor(HexColor("#6b7280"))
    canvas_obj.drawCentredString(
        letter[0] / 2, 30,
        f"CredDev — Developer Credibility Report  |  Page {doc.page}"
    )

    canvas_obj.restoreState()


def _markdown_to_flowables(text: str, styles: dict) -> list:
    """Convert markdown-ish report text to reportlab flowables."""
    flowables = []
    lines = text.split("\n")
    buffer = []

    def flush_buffer():
        if buffer:
            paragraph_text = " ".join(buffer).strip()
            if paragraph_text:
                # Convert **bold** to <b>bold</b>
                paragraph_text = re.sub(
                    r"\*\*(.+?)\*\*", r"<b>\1</b>", paragraph_text
                )
                flowables.append(Paragraph(paragraph_text, styles["body"]))
            buffer.clear()

    for line in lines:
        stripped = line.strip()

        if not stripped:
            flush_buffer()
            continue

        # Headings
        if stripped.startswith("### "):
            flush_buffer()
            heading_text = stripped[4:]
            heading_text = re.sub(r"\*\*(.+?)\*\*", r"\1", heading_text)
            flowables.append(Paragraph(heading_text, styles["subheading"]))
            continue

        if stripped.startswith("## "):
            flush_buffer()
            heading_text = stripped[3:]
            heading_text = re.sub(r"\*\*(.+?)\*\*", r"\1", heading_text)
            flowables.append(Paragraph(heading_text, styles["heading"]))
            continue

        if stripped.startswith("# "):
            flush_buffer()
            heading_text = stripped[2:]
            heading_text = re.sub(r"\*\*(.+?)\*\*", r"\1", heading_text)
            flowables.append(Paragraph(heading_text, styles["heading"]))
            continue

        # Horizontal rules
        if stripped in ("---", "***", "___"):
            flush_buffer()
            flowables.append(Spacer(1, 6))
            flowables.append(
                HRFlowable(
                    width="100%", thickness=0.5,
                    color=HexColor("#374151"), spaceAfter=6
                )
            )
            continue

        # Bullet points
        if stripped.startswith("- ") or stripped.startswith("* "):
            flush_buffer()
            bullet_text = stripped[2:]
            bullet_text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", bullet_text)
            flowables.append(
                Paragraph(f"&bull; {bullet_text}", styles["bullet"])
            )
            continue

        # Numbered lists
        num_match = re.match(r"^(\d+)\.\s+(.+)", stripped)
        if num_match:
            flush_buffer()
            num, item_text = num_match.group(1), num_match.group(2)
            item_text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", item_text)
            flowables.append(
                Paragraph(f"{num}. {item_text}", styles["bullet"])
            )
            continue

        # Regular text — accumulate into paragraph
        buffer.append(stripped)

    flush_buffer()
    return flowables


def generate_report_pdf(
    candidate_name: str,
    report_key: str,
    report_content: str,
) -> bytes:
    """Generate a styled PDF for a single report. Returns PDF bytes."""

    meta = REPORT_META.get(report_key, {})
    title = meta.get("title", report_key.replace("_", " ").title())
    styles = _create_pdf_styles()
    today = datetime.utcnow().strftime("%B %d, %Y")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        topMargin=60,
        bottomMargin=50,
        leftMargin=55,
        rightMargin=55,
    )

    story = []

    # Title block
    story.append(Paragraph("CredDev", styles["title"]))
    story.append(Paragraph(title, styles["heading"]))
    story.append(
        Paragraph(f"Candidate: {candidate_name}  |  Generated: {today}", styles["subtitle"])
    )
    story.append(
        HRFlowable(
            width="100%", thickness=1,
            color=HexColor("#a855f7"), spaceAfter=16
        )
    )

    # Report content
    content_flowables = _markdown_to_flowables(report_content, styles)
    story.extend(content_flowables)

    # Footer disclaimer
    story.append(Spacer(1, 30))
    story.append(
        HRFlowable(
            width="100%", thickness=0.5,
            color=HexColor("#374151"), spaceAfter=8
        )
    )
    story.append(
        Paragraph(
            "This report was generated by CredDev using AI analysis of publicly available data. "
            "Verify all claims independently before making decisions.",
            styles["footer"],
        )
    )

    doc.build(story, onFirstPage=_add_header_footer, onLaterPages=_add_header_footer)
    return buf.getvalue()


def _build_email_html(candidate_name: str, report_names: list) -> str:
    """Build a short HTML email body (reports are in attachments, not inline)."""

    report_bullets = "".join(
        f'<li style="color:#d1d5db;font-size:14px;margin-bottom:6px;">{name}</li>'
        for name in report_names
    )

    return f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
        <div style="max-width:580px;margin:0 auto;padding:40px 24px;">
            <div style="text-align:center;margin-bottom:32px;">
                <h1 style="font-size:26px;font-weight:bold;margin:0;">
                    <span style="color:#a855f7;">CredDev</span>
                </h1>
                <p style="color:#9ca3af;font-size:13px;margin-top:6px;">Developer Credibility Report</p>
            </div>

            <div style="color:#e5e7eb;font-size:15px;line-height:1.6;">
                <p>Hi {candidate_name},</p>
                <p>Your credibility reports have been generated and are attached as PDFs:</p>
                <ul style="padding-left:20px;margin:16px 0;">{report_bullets}</ul>
                <p style="color:#9ca3af;font-size:13px;">
                    Each report provides a different lens on your developer profile —
                    from a comprehensive technical deep-dive to actionable growth insights
                    and a recruiter-ready hiring signal.
                </p>
            </div>

            <div style="margin-top:36px;padding-top:20px;border-top:1px solid #333;text-align:center;">
                <p style="color:#6b7280;font-size:11px;">
                    Generated by CredDev &mdash; The credibility layer for developers
                </p>
            </div>
        </div>
    </body>
    </html>
    """


# ---------------------------------------------------------------------------
# SMTP Email Service (local dev)
# ---------------------------------------------------------------------------

class SMTPEmailService:
    """SMTP-based email service for local development."""

    def __init__(self):
        self.host = settings.smtp_host
        self.port = settings.smtp_port
        self.user = settings.smtp_user
        self.password = settings.smtp_password
        self.from_email = settings.smtp_from_email or settings.smtp_user
        self.from_name = settings.smtp_from_name

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.user and self.password)

    def send_reports(self, to_email: str, candidate_name: str, reports: Dict[str, str]):
        if not to_email:
            logger.info(f"No email provided for {candidate_name} — skipping")
            return

        if not self.is_configured:
            logger.warning(
                f"[EMAIL] SMTP not configured — would have sent reports to {to_email}. "
                f"Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env to enable."
            )
            return

        # Generate PDFs
        attachments, report_names = _generate_pdf_attachments(candidate_name, reports)
        if not attachments:
            return

        # Build email
        subject = f"Your CredDev Credibility Reports — {candidate_name}"
        html_body = _build_email_html(candidate_name, report_names)

        msg = MIMEMultipart("mixed")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email

        # HTML body
        body_part = MIMEMultipart("alternative")
        plain_text = (
            f"Hi {candidate_name},\n\n"
            f"Your CredDev credibility reports are attached as PDFs.\n\n"
            f"Reports included: {', '.join(report_names)}\n\n"
            f"— CredDev"
        )
        body_part.attach(MIMEText(plain_text, "plain"))
        body_part.attach(MIMEText(html_body, "html"))
        msg.attach(body_part)

        # Attach PDFs
        for filename, pdf_bytes in attachments:
            attachment = MIMEApplication(pdf_bytes, _subtype="pdf")
            attachment.add_header("Content-Disposition", "attachment", filename=filename)
            msg.attach(attachment)

        # Send
        try:
            with smtplib.SMTP(self.host, self.port) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(self.user, self.password)
                server.sendmail(self.from_email, to_email, msg.as_string())

            logger.info(
                f"[EMAIL] SMTP sent {len(attachments)} PDF reports to {to_email} for {candidate_name}"
            )

        except Exception as e:
            logger.error(f"[EMAIL] SMTP failed to send to {to_email}: {e}")
            raise


# ---------------------------------------------------------------------------
# Resend Email Service (production)
# ---------------------------------------------------------------------------

class ResendEmailService:
    """Resend API-based email service for production (works over HTTPS)."""

    def __init__(self):
        import resend
        resend.api_key = settings.resend_api_key
        self.resend = resend
        self.from_email = settings.resend_from_email

    @property
    def is_configured(self) -> bool:
        return bool(settings.resend_api_key)

    def send_reports(self, to_email: str, candidate_name: str, reports: Dict[str, str]):
        if not to_email:
            logger.info(f"No email provided for {candidate_name} — skipping")
            return

        if not self.is_configured:
            logger.warning(
                f"[EMAIL] Resend not configured — would have sent reports to {to_email}. "
                f"Set RESEND_API_KEY in env to enable."
            )
            return

        # Generate PDFs
        attachments, report_names = _generate_pdf_attachments(candidate_name, reports)
        if not attachments:
            return

        # Build email
        subject = f"Your CredDev Credibility Reports — {candidate_name}"
        html_body = _build_email_html(candidate_name, report_names)

        # Resend attachments format: list of dicts with filename + base64 content
        resend_attachments = [
            {
                "filename": filename,
                "content": base64.b64encode(pdf_bytes).decode("utf-8"),
            }
            for filename, pdf_bytes in attachments
        ]

        try:
            params = {
                "from": self.from_email,
                "to": [to_email],
                "subject": subject,
                "html": html_body,
                "attachments": resend_attachments,
            }
            result = self.resend.Emails.send(params)
            logger.info(
                f"[EMAIL] Resend sent {len(attachments)} PDF reports to {to_email} "
                f"for {candidate_name} (id={result.get('id', 'unknown')})"
            )

        except Exception as e:
            logger.error(f"[EMAIL] Resend failed to send to {to_email}: {e}")
            raise


# ---------------------------------------------------------------------------
# Brevo Email Service (production — recommended)
# ---------------------------------------------------------------------------

class BrevoEmailService:
    """Brevo (formerly Sendinblue) API-based email service.
    Uses the REST API via httpx — no extra SDK dependency needed.
    Free tier: 300 emails/day, no custom domain required.
    """

    API_URL = "https://api.brevo.com/v3/smtp/email"

    def __init__(self):
        self.api_key = settings.brevo_api_key
        self.from_email = settings.brevo_from_email
        self.from_name = settings.brevo_from_name

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def send_reports(self, to_email: str, candidate_name: str, reports: Dict[str, str]):
        import httpx

        if not to_email:
            logger.info(f"No email provided for {candidate_name} — skipping")
            return

        if not self.is_configured:
            logger.warning(
                f"[EMAIL] Brevo not configured — would have sent reports to {to_email}. "
                f"Set BREVO_API_KEY in env to enable."
            )
            return

        # Generate PDFs
        attachments, report_names = _generate_pdf_attachments(candidate_name, reports)
        if not attachments:
            return

        # Build email
        subject = f"Your CredDev Credibility Reports — {candidate_name}"
        html_body = _build_email_html(candidate_name, report_names)

        # Brevo attachment format: list of dicts with "name" + "content" (base64)
        brevo_attachments = [
            {
                "name": filename,
                "content": base64.b64encode(pdf_bytes).decode("utf-8"),
            }
            for filename, pdf_bytes in attachments
        ]

        payload = {
            "sender": {"name": self.from_name, "email": self.from_email},
            "to": [{"email": to_email, "name": candidate_name}],
            "subject": subject,
            "htmlContent": html_body,
            "attachment": brevo_attachments,
        }

        headers = {
            "api-key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        try:
            response = httpx.post(self.API_URL, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            result = response.json()
            logger.info(
                f"[EMAIL] Brevo sent {len(attachments)} PDF reports to {to_email} "
                f"for {candidate_name} (messageId={result.get('messageId', 'unknown')})"
            )

        except Exception as e:
            logger.error(f"[EMAIL] Brevo failed to send to {to_email}: {e}")
            raise


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def _generate_pdf_attachments(candidate_name: str, reports: Dict[str, str]):
    """Generate PDF files for all reports. Returns (attachments, report_names)."""
    attachments = []
    report_names = []
    safe_name = re.sub(r"[^a-zA-Z0-9_]", "_", candidate_name)

    for report_key, content in reports.items():
        if not content:
            continue

        meta = REPORT_META.get(report_key, {})
        filename = f"{meta.get('filename', report_key)}_{safe_name}.pdf"
        title = meta.get("title", report_key.replace("_", " ").title())

        try:
            pdf_bytes = generate_report_pdf(candidate_name, report_key, content)
            attachments.append((filename, pdf_bytes))
            report_names.append(title)
            logger.info(f"[EMAIL] Generated PDF: {filename} ({len(pdf_bytes)} bytes)")
        except Exception as e:
            logger.error(f"[EMAIL] Failed to generate PDF for {report_key}: {e}")
            continue

    if not attachments:
        logger.error(f"[EMAIL] No PDFs generated for {candidate_name} — skipping email")

    return attachments, report_names


# ---------------------------------------------------------------------------
# Factory — auto-selects: Brevo (prod) > Resend (deprecated) > SMTP (dev)
# ---------------------------------------------------------------------------

def get_email_service():
    """Return the appropriate email service based on config.
    Priority: Brevo (production) > Resend (deprecated, kept for future) > SMTP (local dev).
    """
    if settings.brevo_api_key:
        logger.info("[EMAIL] Using Brevo email service")
        return BrevoEmailService()
    elif settings.resend_api_key:
        logger.info("[EMAIL] Using Resend email service (deprecated)")
        return ResendEmailService()
    else:
        logger.info("[EMAIL] Using SMTP email service (local dev)")
        return SMTPEmailService()
