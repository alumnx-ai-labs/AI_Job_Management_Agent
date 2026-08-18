# Quickstart Validation Guide

## Prerequisites

- Python 3.11+
- Node.js 20+
- A local SQLite database file is available through the backend configuration
- Google Gemini API credentials are configured in the backend environment

## Start the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Expected result: the FastAPI app starts and exposes the jobs API endpoints.

## Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Expected result: the Vite app starts and loads the Jobs Tab and Chat Interface in the browser.

## Validate the core user flow

1. Open the app in the browser.
2. Go to the Chat Interface.
3. Paste a complete job description with all required fields.
4. Confirm the response contains a structured job payload and that the created job appears in the Jobs Tab.

Expected outcome: a new job is stored in SQLite and immediately shown in the Jobs Tab.

## Validate missing-field prompting

1. Open the Chat Interface.
2. Paste a job description missing one or more required fields.
3. Observe the response and identify the missing field names.
4. Send the missing information in a follow-up turn.
5. Confirm that the prior job data is retained and the system validates again.

Expected outcome: the system asks only for the missing values and preserves the partially completed job draft.

## Validate non-guessing behavior

1. Submit a job description with a missing required field.
2. Confirm the system does not invent a value.
3. Check that the response clearly states which fields are missing.

Expected outcome: no fabricated job data is persisted.

## Validation summary

This guide verifies the key MVP behaviors: multi-turn job completion, structured extraction, prompting for missing data, validation before persistence, database write through backend services, and immediate display in the Jobs Tab.
