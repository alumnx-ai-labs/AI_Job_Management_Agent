from app.agents.graph import process_user_message
from app.agents.state import JobDraftState


def test_process_user_message_requests_missing_fields():
    state = JobDraftState()
    response = process_user_message("Senior Engineer at Google in New York full-time", state)

    assert response["status"] == "needs_more_info"
    assert isinstance(response["missing_fields"], list)
    assert len(response["missing_fields"]) > 0


def test_process_user_message_creates_job_when_all_fields_present():
    state = JobDraftState()
    response = process_user_message(
        "title: Senior Engineer\ncompany: Google\nlocation: New York\nwork_type: full-time\nsalary: $150000\ndescription: Build software products.",
        state,
    )

    assert response["status"] == "job_created"
    assert response["job"]["title"] == "Senior Engineer"
    assert response["job"]["company"] == "Google"


def test_process_user_message_multi_turn_flow():
    # Turn 1: Provide title, company, location, work_type
    state1 = JobDraftState()
    res1 = process_user_message(
        "title: Staff Backend Engineer\ncompany: Netflix\nlocation: Remote\nwork_type: Full-time",
        state1,
    )
    assert res1["status"] == "needs_more_info"
    assert "salary" in res1["missing_fields"]
    assert "description" in res1["missing_fields"]

    # Turn 2: Supply missing salary and description while keeping prior draft
    state2 = JobDraftState(job=res1["draft"])
    res2 = process_user_message(
        "salary: $220,000\ndescription: Design high-throughput streaming microservices.",
        state2,
    )
    assert res2["status"] == "job_created"
    assert res2["job"]["title"] == "Staff Backend Engineer"
    assert res2["job"]["company"] == "Netflix"
    assert res2["job"]["location"] == "Remote"
    assert res2["job"]["salary"] == "$220,000"
