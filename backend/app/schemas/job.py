from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


def _nonempty(value: str | None) -> str:
    if value is None or not value.strip():
        raise ValueError("This field is required")
    return value.strip()


class JobBase(BaseModel):
    title: str = Field(..., min_length=1)
    company: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    work_type: str = Field(..., min_length=1)
    salary: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)

    @field_validator("title", "company", "location", "work_type", "salary", "description")
    @classmethod
    def validate_nonempty_fields(cls, value: str) -> str:
        return _nonempty(value)


class JobCreate(JobBase):
    pass


class JobRead(JobBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
