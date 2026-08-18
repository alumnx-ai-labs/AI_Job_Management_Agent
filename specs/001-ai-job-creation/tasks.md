# Tasks: AI Job Creation

**Input**: Design documents from `/specs/001-ai-job-creation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend and frontend project structure in backend/ and frontend/
- [ ] T002 Initialize Python FastAPI app dependencies in backend/requirements.txt
- [ ] T003 [P] Initialize React + Vite app in frontend/package.json, frontend/vite.config.js, and frontend/index.html
- [ ] T004 Configure SQLite database bootstrap in backend/app/db/database.py
- [ ] T005 [P] Define shared job schema and validation model in backend/app/schemas/job.py
- [ ] T006 Create application entrypoint in backend/app/main.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before any user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Implement SQLAlchemy job model and persistence layer in backend/app/db/models.py
- [ ] T008 Implement controlled database service methods in backend/app/db/services.py
- [ ] T009 [P] Wire API routing structure in backend/app/api/routes.py
- [ ] T010 [P] Build LangGraph state model and message tracking in backend/app/agents/state.py
- [ ] T011 Create backend agent orchestration shell in backend/app/agents/graph.py
- [ ] T012 Configure environment and secret handling for Gemini credentials in backend/app/config.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a job from a pasted description (Priority: P1) 🎯 MVP

**Goal**: Allow a user to paste a job description, extract a structured job record, and persist it only when all required fields are valid.

**Independent Test**: A user can paste a full job description, receive structured extraction, and see the created job in the Jobs Tab without any extra confirmation.

### Implementation for User Story 1

- [ ] T013 [P] [US1] Implement extraction and merge logic for job fields in backend/app/agents/graph.py
- [ ] T014 [US1] Implement missing-field detection and validation flow in backend/app/agents/tools.py
- [ ] T015 [US1] Add backend job creation endpoint and validation response handling in backend/app/api/routes.py
- [ ] T016 [P] [US1] Create frontend chat submission service in frontend/src/services/jobsApi.js
- [ ] T017 [US1] Build chat UI for sending job descriptions and showing missing-field prompts in frontend/src/components/ChatInterface.jsx
- [ ] T018 [US1] Add Jobs Tab list rendering for stored jobs in frontend/src/components/JobsTab.jsx
- [ ] T019 [US1] Connect the main app shell and tab switching flow in frontend/src/App.jsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Maintain multi-turn incomplete job completion (Priority: P1)

**Goal**: Preserve partial job state across conversation turns and request only the missing information until the job becomes valid.

**Independent Test**: A user can continue a conversation over multiple turns and the agent keeps prior values while asking only for missing fields.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Preserve job draft state across turns in backend/app/agents/state.py
- [ ] T021 [US2] Update LangGraph transition logic to merge new extraction results without overwriting known valid values in backend/app/agents/graph.py
- [ ] T022 [US2] Add user-facing missing-field prompting and re-validation workflow in backend/app/agents/tools.py
- [ ] T023 [P] [US2] Update frontend chat state handling to keep partial drafts and display missing-field requests in frontend/src/components/ChatInterface.jsx
- [ ] T024 [US2] Ensure follow-up responses update the in-progress draft without inventing values in frontend/src/services/jobsApi.js

**Checkpoint**: At this point, User Story 2 should work independently and maintain draft continuity across turns

---

## Phase 5: User Story 3 - Display persisted jobs in the Jobs Tab (Priority: P2)

**Goal**: Ensure the user can immediately view newly created jobs from the database in the Jobs Tab.

**Independent Test**: After a valid job is created through the chat workflow, the Jobs Tab refreshes and displays the created record.

### Implementation for User Story 3

- [ ] T025 [P] [US3] Implement list-jobs backend retrieval in backend/app/api/routes.py
- [ ] T026 [US3] Add service methods for reading persisted jobs from SQLite in backend/app/db/services.py
- [ ] T027 [US3] Fetch and render jobs from the API in frontend/src/components/JobsTab.jsx
- [ ] T028 [P] [US3] Refresh job list automatically after successful creation in frontend/src/services/jobsApi.js

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements that affect the shared job-creation flow

- [ ] T029 [P] Add defensive validation and sanitization for untrusted user-provided content in backend/app/agents/tools.py and backend/app/api/routes.py
- [ ] T030 [P] Add user-friendly error handling and explicit missing-field messaging across backend and frontend responses
- [ ] T031 [P] Run the quickstart validation scenarios from specs/001-ai-job-creation/quickstart.md
- [ ] T032 Validate the MVP stays within the intended scope: no job search, complex filtering, candidate management, or external integrations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - User Story 1 can start after Phase 2 and delivers the MVP
  - User Story 2 depends on the same foundational flow and should retain partial state
  - User Story 3 depends on read/write job persistence established in the earlier phases
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational and uses the same state model as US1
- **User Story 3 (P2)**: Can start after the backend job creation flow and listing API are in place

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Once Foundational completes, User Story 1 and User Story 2 can proceed in parallel if multiple developers are available
- Frontend service and UI tasks within the same story can be developed in parallel when they do not share the same file

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for the chat flow and backend creation flow
Task: "Implement extraction and merge logic in backend/app/agents/graph.py"
Task: "Create frontend chat submission service in frontend/src/services/jobsApi.js"
Task: "Build chat UI in frontend/src/components/ChatInterface.jsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate the job creation flow independently
5. Stop and confirm the MVP path before expanding to dialogue continuity and display polish

### Incremental Delivery

1. Setup + Foundational -> base architecture ready
2. User Story 1 -> complete job creation flow
3. User Story 2 -> multi-turn missing-field handling
4. User Story 3 -> persistent listing in Jobs Tab
5. Final polish and validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Developer A: User Story 1
3. Developer B: User Story 2
4. Developer C: User Story 3
5. Final polish after all stories pass validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map each task to the spec story for traceability
- Each user story should be independently testable
- Keep the job schema narrow and explicit to match the MVP scope
- Do not add job search, complex filtering, application tracking, or external integrations in this backlog
