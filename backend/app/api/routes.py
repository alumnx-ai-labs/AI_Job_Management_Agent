from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.services import create_job, delete_job, list_jobs
from app.schemas.job import JobCreate, JobRead

router = APIRouter()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/jobs", response_model=list[JobRead])
def read_jobs(db: Session = Depends(get_db)):
    jobs = list_jobs(db)
    return jobs


@router.post("/jobs", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job_route(payload: JobCreate, db: Session = Depends(get_db)):
    try:
        job = create_job(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return job


@router.delete("/jobs/{job_id}", status_code=status.HTTP_200_OK)
def delete_job_route(job_id: int, db: Session = Depends(get_db)):
    success = delete_job(db, job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully", "id": job_id}
