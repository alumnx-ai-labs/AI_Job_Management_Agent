# Data Model: AI Job Creation

## Core entities

### Job

Represents a persisted job record created from a valid, complete job description.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | integer | Yes | Database-generated primary key |
| title | string | Yes | Should be non-empty and human-readable |
| company | string | Yes | Employer name for the position |
| location | string | Yes | City, region, or remote designation |
| work_type | string | Yes | Example values: full-time, part-time, contract, remote |
| salary | string | Yes | Stored as a string to preserve user-provided formatting or text |
| description | string | Yes | Full job description or summary |
| created_at | datetime | Yes | Timestamp for creation |

Validation rules:
- All required fields must be present before persistence.
- Empty or whitespace-only values are invalid.
- The schema must reject unknown fields and malformed values before they reach SQLite.
- The `salary` field is treated as a user-provided string unless a later product decision standardizes it to numeric or currency-specific types.

### JobDraft

Represents an in-progress job that has been extracted from a chat message but is not yet complete enough to persist.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| job | object | Yes | Partial `Job` data with known fields only |
| missing_fields | array[string] | Yes | Ordered list of required fields still absent or invalid |
| conversation/messages | array[message] | Yes | Prior chat events used to maintain multi-turn context |

Rules:
- The draft can be updated across multiple turns without resetting earlier valid fields.
- Missing fields are recalculated after each message.
- The agent must never invent values when a field is missing.

### Message

Represents a single chat turn used to maintain conversational context.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| role | string | Yes | `user` or `assistant` |
| content | string | Yes | Raw message content |
| timestamp | datetime | Yes | When the message was recorded |

## Relationships

- One `JobDraft` is associated with one active user conversation.
- A `JobDraft` may evolve over multiple turns before becoming a `Job`.
- A `Job` is a terminal persisted object with no active draft state.
- The frontend reads jobs from the job list API and displays them in the Jobs Tab.

## State transitions

1. User sends a job description.
2. Agent extracts fields into a draft state.
3. Validation identifies missing fields.
4. Agent asks the user for the missing values.
5. User provides additional details.
6. Agent merges new values into the draft.
7. Validation passes.
8. Backend service creates persisted `Job`.
9. Frontend loads the list of jobs and updates the Jobs Tab.

## Data ownership

- The frontend owns the display and chat interaction flow.
- The backend owns validation and persistence rules.
- The LangGraph agent owns extraction and state progression but does not own the database.
