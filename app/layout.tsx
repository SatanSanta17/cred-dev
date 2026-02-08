import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CredDev - The Credibility Layer for Developers",
  description: "Verify skills. Build trust. Get discovered. Join the waitlist for early access.",
  keywords: ["developer", "credibility", "skills", "github", "leetcode", "hiring"],
  authors: [{ name: "CredDev Team" }],
  openGraph: {
    title: "CredDev - The Credibility Layer for Developers",
    description: "Verify skills. Build trust. Get discovered.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}