from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_list_jobs():
    response = client.get("/jobs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_and_delete_job_success():
    payload = {
        "title": "Senior Engineer",
        "company": "Google",
        "location": "New York",
        "work_type": "Full-time",
        "salary": "$150,000",
        "description": "Build software products.",
    }
    response = client.post("/jobs", json=payload)
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Senior Engineer"
    assert body["company"] == "Google"
    job_id = body["id"]

    # Delete job
    del_res = client.delete(f"/jobs/{job_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == job_id


def test_chat_multi_turn_api():
    # Turn 1
    t1_res = client.post(
        "/jobs/chat",
        json={"message": "title: DevOps Lead\ncompany: CloudFlare\nlocation: Austin, TX\nwork_type: Hybrid"},
    )
    assert t1_res.status_code == 200
    t1_data = t1_res.json()
    assert t1_data["status"] == "needs_more_info"
    assert "salary" in t1_data["missing_fields"]
    assert "description" in t1_data["missing_fields"]

    # Turn 2 with draft
    t2_res = client.post(
        "/jobs/chat",
        json={
            "message": "salary: $165,000\ndescription: Manage Kubernetes clusters and global edge routing.",
            "draft": t1_data["draft"],
        },
    )
    assert t2_res.status_code == 200
    t2_data = t2_res.json()
    assert t2_data["status"] == "job_created"
    assert t2_data["job"]["title"] == "DevOps Lead"
    assert t2_data["job"]["company"] == "CloudFlare"
    assert t2_data["job"]["salary"] == "$165,000"
