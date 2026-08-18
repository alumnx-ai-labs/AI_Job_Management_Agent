from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class JobDraftState:
    job: dict[str, Any] = field(default_factory=dict)
    missing_fields: list[str] = field(default_factory=list)
    conversation: list[dict[str, str]] = field(default_factory=list)

    def merge_job_fields(self, extracted: dict[str, Any]) -> None:
        for key, value in extracted.items():
            if value is not None and str(value).strip():
                self.job[key] = str(value).strip()

    def update_missing_fields(self, required_fields: list[str]) -> None:
        self.missing_fields = [
            field_name
            for field_name in required_fields
            if not self.job.get(field_name) or not str(self.job.get(field_name)).strip()
        ]

    def add_message(self, role: str, content: str) -> None:
        self.conversation.append({"role": role, "content": content})
