# Implementation Plan: AI Job Creation

**Branch**: `001-ai-job-creation` | **Date**: 2026-08-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-ai-job-creation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

This feature delivers a simple web application that combines a Jobs Tab and a chat-driven job creation flow. Users can paste a job description into a chat interface, allow a LangGraph agent to extract structured job data, and complete missing required fields through multi-turn conversation. Once all required fields are present and valid, the backend creates the job record in SQLite through controlled database services. The frontend immediately reflects the newly stored job in the Jobs Tab without extra confirmation or advanced job workflow features.

## Technical Context

**Language/Version**: Python 3.11, Node.js 20 LTS, React 18, Vite 5

**Primary Dependencies**: FastAPI, SQLAlchemy, SQLite, LangGraph, Google Generative AI Python SDK, React, Vite

**Storage**: SQLite with SQLAlchemy ORM

**Testing**: pytest for backend services and API behavior; Vitest/React Testing Library for frontend interactions

**Target Platform**: Local web application running in a browser with a Python API backend

**Project Type**: Web application

**Performance Goals**: Job creation and listing should feel instant for typical single-user testing; primary chat flow should complete within a few seconds under normal use

**Constraints**: LLM cannot directly access SQLite; job creation must require complete valid data before persistence; state must survive multi-turn dialog; no job search, filtering, candidate workflow, or external board integrations in MVP

**Scale/Scope**: Single-user or small-team MVP with a simple job list and a single chat-driven creation flow

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The design satisfies the project constitution as written in [.specify/memory/constitution.md](../../.specify/memory/constitution.md):

- User Intent First: the application asks for missing information and never invents values.
- Safe Job Creation: jobs are persisted only when required fields are complete and valid.
- Human-in-the-Loop: missing critical fields are requested from the user rather than guessed.
- Structured Data: the job schema is explicit and validated before writing to SQLite.
- Agent State Management: LangGraph state tracks job data, missing fields, and conversation messages across turns.
- Separation of Concerns: frontend, agent orchestration, domain validation, and persistence are separated by service boundaries.
- Testability: behavior will be enforced through backend + frontend tests.
- Security: LLM output is treated as untrusted and database access is mediated through backend services.
- Explainable Agent Behavior: missing field responses are explicit and user-facing.
- Simplicity: the MVP stays limited to creation and listing, with no extra job-management features.

Result: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-job-creation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── spec.md              # source feature spec
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── routes.py
│   ├── agents/
│   │   ├── graph.py
│   │   ├── state.py
│   │   └── tools.py
│   ├── db/
│   │   ├── database.py
│   │   ├── models.py
│   │   └── services.py
│   ├── schemas/
│   │   └── job.py
│   ├── config.py
│   └── main.py
├── tests/
│   ├── test_jobs_api.py
│   └── test_agent_flow.py
└── requirements.txt

frontend/
├── src/
│   ├── components/
│   │   ├── JobsTab.jsx
│   │   └── ChatInterface.jsx
│   ├── services/
│   │   └── jobsApi.js
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   └── app.test.jsx
├── package.json
├── vite.config.js
└── index.html
```

**Structure Decision**: A two-tier web application is the right fit for the MVP: a React frontend for the Jobs Tab and chat interface, and a Python FastAPI service for API, validation, SQLite persistence, and LangGraph orchestration. This division keeps agent logic, database access, and UI responsibilities explicitly separate.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations identified. No complexity exceptions required.
