# AI-Powered Job Creation Application

A simple full-stack job management MVP with:

- React + Vite frontend
- FastAPI backend
- SQLite database
- SQLAlchemy ORM
- LangGraph-based conversational job creation flow
- Google Gemini-powered extraction for structured job information

## Features

- Jobs Tab to view all stored jobs
- Chat Interface to paste a full job description
- Extraction of:
  - title
  - company
  - location
  - work_type
  - salary
  - description
- Missing-field detection and multi-turn follow-up prompts
- Automatic job creation once all required fields are valid
- Immediate visibility of the new job in the Jobs Tab
- No extra job-management capabilities in the MVP

## Project Structure

```text
job_parser/
├── README.md
├── .gitignore
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── db/
│   │   ├── schemas/
│   │   ├── config.py
│   │   └── main.py
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
└── specs/
    └── 001-ai-job-creation/
```

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- Google Gemini API key (set as `GEMINI_API_KEY` in the backend environment)

## Backend Setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will run at:

- http://localhost:8000

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at:

- http://localhost:5173

## Environment Variables

Set the following in your backend environment:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=sqlite:///jobs.db
```

## Core API

- GET /jobs
- POST /jobs
- POST /jobs/chat

## Notes

- The LLM is used for extraction and conversation flow, but it does not directly access SQLite.
- Database writes are handled through backend-controlled services.
- The MVP intentionally focuses on job creation and listing only.
