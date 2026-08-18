from __future__ import annotations

from typing import Iterable

from sqlalchemy.orm import Session

from app.db.models import JobModel
from app.schemas.job import JobCreate


def get_db_session() -> Session:
    from app.db.database import SessionLocal

    db = SessionLocal()
    try:
        return db
    finally:
        pass


def create_job(db: Session, payload: JobCreate) -> JobModel:
    job = JobModel(
        title=payload.title,
        company=payload.company,
        location=payload.location,
        work_type=payload.work_type,
        salary=payload.salary,
        description=payload.description,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def list_jobs(db: Session) -> Iterable[JobModel]:
    return db.query(JobModel).order_by(JobModel.created_at.desc()).all()


def delete_job(db: Session, job_id: int) -> bool:
    job = db.query(JobModel).filter(JobModel.id == job_id).first()
    if not job:
        return False
    db.delete(job)
    db.commit()
    return True
