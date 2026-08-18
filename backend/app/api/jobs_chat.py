from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.agents.graph import process_user_message
from app.agents.state import JobDraftState

router = APIRouter()


class ChatCreateRequest(BaseModel):
    message: str
    draft: dict[str, Any] | None = None
    conversation: list[dict[str, str]] | None = None
    session_id: str | None = None


@router.post("/jobs/chat")
def create_job_from_chat(payload: ChatCreateRequest):
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message is required")

    state = JobDraftState(
        job=dict(payload.draft) if payload.draft else {},
        conversation=list(payload.conversation) if payload.conversation else [],
    )
    result = process_user_message(payload.message, state)

    return {
        "status": result["status"],
        "message": result["message"],
        "missing_fields": result.get("missing_fields", []),
        "draft": result.get("draft", state.job),
        "extracted_fields": result.get("extracted_fields", {}),
        "job": result.get("job"),
        "conversation": result.get("conversation", state.conversation),
    }
