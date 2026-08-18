# Feature Specification: AI Job Creation

**Feature Branch**: `001-ai-job-creation`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "Build a simple AI-powered job creation application. The application has two interfaces: 1. Jobs Tab 2. Chat Interface. The Jobs Tab displays all jobs stored in the database. The Chat Interface allows the user to paste a complete job description and request that a job be created. The AI agent must extract the following fields from the provided job description: title, company, location, work_type, salary, description. The agent must return structured job information. After extraction, the agent must check whether any required fields are missing. If one or more fields are missing, the agent must ask the user specifically for the missing information. The conversation must maintain the partially completed job information. When the user provides the missing information, the agent must update the job information and validate it again. Once all required fields are available and valid, the agent must automatically create the job in the database without requiring another confirmation step. The newly created job must immediately be available in the Jobs Tab. The agent must never invent missing job information. The application should provide clear responses showing which information is missing. The system should support multi-turn conversations while completing a job. The initial MVP should remain simple and should not implement unnecessary job-management capabilities such as job search, complex filtering, application tracking, candidate management, or external job-board integrations."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a job from pasted description (Priority: P1)
A user can open the Chat Interface, paste a complete job description, and receive a structured job record with all required fields extracted. If the description is missing any required value, the system clearly identifies the missing information and requests only that information before creating the job.

**Why this priority**: This is the core value of the product. Without successful extraction and validation, the user cannot create a valid job record through the AI workflow.

**Independent Test**: A user can paste a full job description, review the extracted data, and confirm that a valid job is stored and appears in the Jobs Tab without extra confirmation.

**Acceptance Scenarios**:

1. **Given** the user is in the Chat Interface, **When** they paste a complete job description with all required fields, **Then** the system extracts the structured data and creates the job in the database.
2. **Given** the user is in the Chat Interface, **When** they paste a description missing one or more required fields, **Then** the system identifies the missing values and asks for just those missing details.
3. **Given** the system has an incomplete draft job, **When** the user provides the missing field values in a later message, **Then** the system updates the draft and validates again until the job is complete.

---

### User Story 2 - Maintain multi-turn job completion flow (Priority: P1)
A user can continue a conversation across multiple messages while the system keeps the partially completed job information intact. The system does not restart the job creation process or forget earlier answers from the same conversation.

**Why this priority**: Multi-turn completion is essential for realistic job entry using natural-language descriptions, especially when a single pasted description is incomplete or ambiguous.

**Independent Test**: A user can provide partial job information over several turns, and the system remembers the previously collected values while asking only for the missing ones.

**Acceptance Scenarios**:

1. **Given** the user has already supplied a title and company, **When** they provide the remaining missing location and salary in a follow-up message, **Then** the system updates the in-progress job and preserves the previously filled fields.
2. **Given** the system is holding an incomplete job draft, **When** the user sends a new message with additional details, **Then** the system merges the new information into the draft without inventing or overwriting valid prior information.

---

### User Story 3 - View created jobs in the Jobs Tab (Priority: P2)
A user can open the Jobs Tab and immediately see all jobs currently stored in the database, including the newly created job from the chat workflow.

**Why this priority**: This ensures the created job is visible and confirms the system's persistence behavior for the user.

**Independent Test**: A user can create a job in the chat flow and then navigate to the Jobs Tab to confirm it is immediately displayed.

**Acceptance Scenarios**:

1. **Given** the user has created a valid job, **When** they open the Jobs Tab, **Then** the new job appears in the list of stored jobs.
2. **Given** no jobs exist in the database, **When** the user creates a job through chat, **Then** the Jobs Tab displays the new record without any extra action required.

---

### Edge Cases

- What happens when the user provides a description that includes multiple jobs or unrelated information?
- How does the system handle a pasted description that omits required values but includes extra optional details?
- What happens when the user provides invalid or empty values for required fields such as a blank company or title?
- How does the system respond when the user sends a follow-up message that contradicts earlier valid information?
- What happens when the user attempts to submit a job with missing or untrusted information that cannot be validated?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide two primary user interfaces: a Jobs Tab that displays jobs stored in the database and a Chat Interface for job creation.
- **FR-002**: The system MUST allow a user to paste a complete job description into the Chat Interface and request creation of a job.
- **FR-003**: The AI agent MUST extract the structured fields title, company, location, work_type, salary, and description from the provided job description.
- **FR-004**: The AI agent MUST return the extracted job information in a structured format that clearly identifies each field.
- **FR-005**: The system MUST validate the extracted job data against the required field list before persisting a job.
- **FR-006**: If one or more required fields are missing, the system MUST tell the user exactly which fields are missing and ask only for the missing information.
- **FR-007**: The system MUST preserve partially completed job information across multiple turns in the same conversation.
- **FR-008**: When the user provides additional information for a partially completed job, the system MUST update the draft and validate the job again.
- **FR-009**: The system MUST never invent missing job information and MUST avoid guessing values that are not supplied by the user.
- **FR-010**: Once all required fields are available and valid, the system MUST create the job in the database automatically without requiring an additional confirmation step.
- **FR-011**: A newly created job MUST be visible in the Jobs Tab immediately after creation.
- **FR-012**: The system MUST support multi-turn conversations while completing a job draft.
- **FR-013**: The system MUST provide clear, understandable responses that identify missing information and the next required action.
- **FR-014**: The initial MVP MUST remain intentionally simple and MUST NOT include job search, complex filtering, application tracking, candidate management, or external job-board integrations.
- **FR-015**: The system MUST keep the job creation flow bounded to the required fields and the existing database-backed Jobs Tab.

### Key Entities *(include if feature involves data)*

- **Job**: Represents a job opportunity created from a user-provided description. It includes a title, company, location, work_type, salary, and description, and it must be stored only when the required data is complete and valid.
- **Job Draft**: Represents the in-progress job being assembled across a conversation. It tracks known fields, missing fields, and validation status while the user supplies information over multiple turns.
- **User Conversation**: Represents the ongoing chat exchange that carries the job draft from one message to the next and determines the current state of job collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a valid job from a pasted description in a single conversation flow without needing a separate confirmation step after data validation succeeds.
- **SC-002**: For incomplete job descriptions, the system identifies the missing fields and requests only the missing information within the same conversation thread.
- **SC-003**: The system preserves job-progress state across multiple turns, with at least 95% of completed drafts retaining previously supplied correct values when new information is added.
- **SC-004**: Newly created jobs appear in the Jobs Tab immediately after successful creation, without requiring a refresh or additional user action.
- **SC-005**: Users receive clear guidance when required information is missing, reducing avoidable failed job creations and preventing fabricated data.
- **SC-006**: The MVP stays focused on job creation and listing, with no additional job-management features beyond the required Jobs Tab and Chat Interface.

## Assumptions

- Users are interacting with a single application that contains both a Jobs Tab and a Chat Interface.
- The system has a database capable of storing job records and returning them for display in the Jobs Tab.
- Required fields are limited to the fields explicitly listed in the product requirement: title, company, location, work_type, salary, and description.
- A job can be created only when all required fields are present and valid; missing data is handled through conversation rather than inferred defaults.
- The MVP does not include advanced job lifecycle features, admin management, or external integrations beyond storing and listing the created jobs.
