# Research: AI Job Creation MVP

## Decision: Use a deterministic LangGraph state machine with explicit validation gates

**Decision**: The graph will manage a single state object with `job`, `missing_fields`, and `conversation/messages`. The state will be updated by a deterministic merge step before validation, and only after validation passes will the backend create a job record in SQLite.

**Rationale**: This matches the product requirement that the system preserves incomplete job drafts across multi-turn conversations, asks only for missing values, and never invents information. It also keeps the LLM focused on extraction and structured output while enforcing persistence through a controlled backend service.

**Alternatives considered**:
- Keeping all state in the frontend only: rejected because it weakens separation of concerns and leaves API validation outside the backend boundary.
- Letting the LLM call SQLite directly: rejected because it violates the constitutions and project requirement that database access must be controlled by backend tools/services.
- Allowing automatic guessing for missing values: rejected because the requirement explicitly forbids inventing job data.

## Decision: Job validation is a domain gate, not a prompt-only concern

**Decision**: The extracted job payload will be validated against required fields and a schema before persistence. Missing fields are surfaced as a list of field names and the user is asked only for those values.

**Rationale**: The user requirement states that the agent must check whether required fields are missing, ask for them specifically, and validate again after each update. Putting the validation logic in backend services ensures consistent, testable behavior and avoids multiple inconsistent interpretations across UI or agent layers.

**Alternatives considered**:
- Validating only in the UI: rejected because it creates a bypass risk and weakens the API contract.
- Allowing partial storage with placeholder values: rejected because the constitution requires safe job creation and no fabricated data.

## Decision: Use explicit backend services for all SQLite operations

**Decision**: The LLM and LangGraph graph will never open a database connection or issue direct ORM calls. Instead, the backend exposes controlled tools such as `create_job_record`, `list_jobs`, and `validate_job_payload`, which enforce schema checks and use SQLAlchemy to persist data.

**Rationale**: This keeps the LLM untrusted, reduces security risk, and cleanly separates orchestration from persistence. It also makes the job lifecycle easier to unit test and audit.

**Alternatives considered**:
- Using a shared service function directly from the agent module: rejected as a hidden coupling that violates separation of concerns.
- Exposing raw database access via agent tool wrappers: rejected because it would allow implicit persistence without domain validation.

## Decision: Keep the shared job schema narrow and explicit

**Decision**: The supported job fields are exactly `title`, `company`, `location`, `work_type`, `salary`, and `description`. The schema will declare required versus optional fields and reject unknown or malformed values early.

**Rationale**: The project explicitly requires only these fields for the MVP. A narrow schema is easier to validate, explain, and test without adding unnecessary complexity.

**Alternatives considered**:
- Allowing free-form metadata: rejected because it increases ambiguity and creates validation drift.
- Supporting advanced job lifecycle fields immediately: rejected because the MVP explicitly excludes search, tracking, filters, and external integrations.

## Decision: Use a simple conversation state and merge model

**Decision**: Each user message is processed as a conversation turn. The graph merges newly extracted fields into the existing `job` object, updates `missing_fields`, and stores the interaction history in `conversation/messages` for traceability.

**Rationale**: This ensures multi-turn completion while preventing the system from forgetting earlier collected data or fabricating values. It also supports clear communication about which information is still missing.

**Alternatives considered**:
- Resetting state after every message: rejected because it breaks multi-turn continuity.
- Storing conversation state only in the frontend: rejected because the application requires server-side orchestration and durable backend validation.

## Decision: Keep the MVP limited to creation and display

**Decision**: The application will expose only two interfaces: the Jobs Tab and the Chat Interface. There will be no job search, filters, candidate management, applications, or external integrations in this iteration.

**Rationale**: The feature definition explicitly scopes the MVP away from these capabilities and the constitution values simplicity and maintainability.

**Alternatives considered**:
- Adding dashboard filters or analytics: rejected because they are outside the MVP scope.
- Supporting job board syncing or application tracking: rejected as unneeded complexity.

## Open issues resolved

- Field extraction is constrained to the required schema.
- Missing information is requested explicitly rather than guessed.
- SQLite access is mediated through backend services only.
- The app remains within a minimal MVP boundary.
