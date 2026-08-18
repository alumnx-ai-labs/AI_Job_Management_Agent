from __future__ import annotations

from typing import Any

from langgraph.graph import END, START, StateGraph

from app.agents.state import JobDraftState
from app.agents.tools import (
    REQUIRED_FIELDS,
    build_missing_fields_message,
    extract_job_fields,
    validate_job_data,
)
from app.db.database import SessionLocal
from app.db.services import create_job
from app.schemas.job import JobCreate


def _extract_and_merge(message: str, state: JobDraftState) -> tuple[JobDraftState, dict[str, Any]]:
    state.add_message("user", message)
    extracted = extract_job_fields(message, current_draft=state.job)
    state.merge_job_fields(extracted)
    state.update_missing_fields(REQUIRED_FIELDS)
    return state, extracted


def _needs_more_info(state: JobDraftState) -> bool:
    valid, _ = validate_job_data(state.job)
    return not valid


def _persist_job(state: JobDraftState) -> dict[str, Any]:
    payload = JobCreate(**state.job)
    db = SessionLocal()
    try:
        job_record = create_job(db, payload)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

    return {
        "id": job_record.id,
        "title": job_record.title,
        "company": job_record.company,
        "location": job_record.location,
        "work_type": job_record.work_type,
        "salary": job_record.salary,
        "description": job_record.description,
        "created_at": job_record.created_at.isoformat() if hasattr(job_record, "created_at") and job_record.created_at else None,
    }


def _build_response_for_missing(state: JobDraftState, extracted: dict[str, Any] | None = None) -> dict[str, Any]:
    _, missing = validate_job_data(state.job)
    state.missing_fields = missing
    message = build_missing_fields_message(missing)
    state.add_message("assistant", message)
    return {
        "status": "needs_more_info",
        "message": message,
        "job": None,
        "draft": state.job,
        "extracted_fields": extracted or {},
        "missing_fields": state.missing_fields,
        "conversation": state.conversation,
    }


def _build_response_for_success(state: JobDraftState, extracted: dict[str, Any] | None = None) -> dict[str, Any]:
    job_payload = _persist_job(state)
    message = f"Success! Job '{job_payload['title']}' at {job_payload['company']} has been automatically created and added to the database."
    state.add_message("assistant", message)
    return {
        "status": "job_created",
        "message": message,
        "job": job_payload,
        "draft": state.job,
        "extracted_fields": extracted or {},
        "missing_fields": [],
        "conversation": state.conversation,
    }


def build_job_graph():
    graph = StateGraph(dict)

    def receive_user_message(state: dict[str, Any]) -> dict[str, Any]:
        message = state.get("message")
        if not message:
            raise ValueError("Message is required")
        draft = state.get("draft") or JobDraftState()
        draft, extracted = _extract_and_merge(message, draft)
        return {**state, "draft": draft, "extracted": extracted}

    def decide_next_step(state: dict[str, Any]) -> str:
        draft = state.get("draft")
        return "ask_user" if draft is not None and _needs_more_info(draft) else "create_job"

    def ask_user(state: dict[str, Any]) -> dict[str, Any]:
        draft = state.get("draft")
        extracted = state.get("extracted", {})
        if draft is None:
            raise ValueError("Missing draft state")
        response = _build_response_for_missing(draft, extracted)
        response["user_message"] = state.get("message")
        return response

    def create_job_step(state: dict[str, Any]) -> dict[str, Any]:
        draft = state.get("draft")
        extracted = state.get("extracted", {})
        if draft is None:
            raise ValueError("Missing draft state")
        response = _build_response_for_success(draft, extracted)
        response["user_message"] = state.get("message")
        return response

    graph.add_node("receive_user_message", receive_user_message)
    graph.add_node("ask_user", ask_user)
    graph.add_node("create_job", create_job_step)
    graph.add_edge(START, "receive_user_message")
    graph.add_conditional_edges(
        "receive_user_message",
        decide_next_step,
        {"ask_user": "ask_user", "create_job": "create_job"},
    )
    graph.add_edge("ask_user", END)
    graph.add_edge("create_job", END)
    return graph.compile()


JOB_GRAPH = build_job_graph()


def process_user_message(message: str, existing_state: JobDraftState | None = None) -> dict[str, Any]:
    draft = existing_state or JobDraftState()
    draft, extracted = _extract_and_merge(message, draft)
    if _needs_more_info(draft):
        return _build_response_for_missing(draft, extracted)
    return _build_response_for_success(draft, extracted)
