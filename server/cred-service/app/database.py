from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from .config import settings

db_url = settings.get_database_url()

# SQLite needs connect_args for thread safety
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(String, primary_key=True)
    candidate_name = Column(String, nullable=True, default="Anonymous Candidate")
    candidate_email = Column(String, nullable=True)
    user_id = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    error_message = Column(Text, nullable=True)

    # Inputs
    resume_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)
    leetcode_url = Column(String, nullable=True)
    linkedin_url = Column(String, nullable=True)

    # Relations
    raw_data = relationship("RawData", back_populates="job")
    reports = relationship("Report", back_populates="job")


class RawData(Base):
    __tablename__ = "raw_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("analysis_jobs.id"))
    data_type = Column(String)  # github, leetcode, resume, linkedin
    data = Column(JSON)
    fetched_at = Column(DateTime)

    job = relationship("AnalysisJob", back_populates="raw_data")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String, ForeignKey("analysis_jobs.id"))
    layer = Column(String)  # signal_summary, extensive_report, developer_insight, recruiter_insight
    content = Column(Text)
    created_at = Column(DateTime)

    job = relationship("AnalysisJob", back_populates="reports")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables. Call on startup."""
    Base.metadata.create_all(bind=engine)
