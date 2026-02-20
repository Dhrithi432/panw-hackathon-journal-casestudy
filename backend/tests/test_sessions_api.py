"""Tests for sessions API endpoints."""
import uuid
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient):
    """Create session returns session with id."""
    res = await client.post("/api/sessions", json={"user_id": "user-1", "title": "First entry"})
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert data["title"] == "First entry"
    assert data["messages"] == []


@pytest.mark.asyncio
async def test_list_sessions(client: AsyncClient):
    """List sessions returns user's sessions."""
    await client.post("/api/sessions", json={"user_id": "user-1"})
    await client.post("/api/sessions", json={"user_id": "user-1"})
    res = await client.get("/api/sessions?user_id=user-1")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2


@pytest.mark.asyncio
async def test_save_messages(client: AsyncClient):
    """Save messages to session."""
    create = await client.post("/api/sessions", json={"user_id": "user-1"})
    sid = create.json()["id"]
    m1, m2 = str(uuid.uuid4()), str(uuid.uuid4())
    msgs = [
        {"id": m1, "role": "user", "content": "Hello", "timestamp": "2024-01-15T12:00:00Z"},
        {"id": m2, "role": "assistant", "content": "Hi there", "timestamp": "2024-01-15T12:01:00Z"},
    ]
    res = await client.put(f"/api/sessions/{sid}/messages?user_id=user-1", json={"messages": msgs})
    assert res.status_code == 200
    assert len(res.json()["messages"]) == 2
    assert res.json()["title"] == "Hello"


@pytest.mark.asyncio
async def test_delete_session(client: AsyncClient):
    """Delete session removes it from list."""
    create = await client.post("/api/sessions", json={"user_id": "user-1"})
    sid = create.json()["id"]
    res = await client.delete(f"/api/sessions/{sid}?user_id=user-1")
    assert res.status_code == 200
    list_res = await client.get("/api/sessions?user_id=user-1")
    ids = [s["id"] for s in list_res.json()]
    assert sid not in ids


@pytest.mark.asyncio
async def test_get_session_404_wrong_user(client: AsyncClient):
    """Get session returns 404 for wrong user."""
    create = await client.post("/api/sessions", json={"user_id": "user-a"})
    sid = create.json()["id"]
    res = await client.get(f"/api/sessions/{sid}?user_id=user-b")
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_migrate_imports_sessions(client: AsyncClient):
    """Migrate endpoint imports localStorage-style sessions."""
    mid, sid = str(uuid.uuid4()), str(uuid.uuid4())
    payload = {
        "user_id": "user-1",
        "sessions": [
            {
                "id": sid,
                "title": "First",
                "messages": [
                    {"id": mid, "role": "user", "content": "Hi", "timestamp": "2024-01-15T12:00:00Z"},
                ],
            },
        ],
    }
    res = await client.post("/api/migrate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["imported"] == 1
    assert data["skipped"] == 0
    list_res = await client.get("/api/sessions?user_id=user-1")
    ids = [s["id"] for s in list_res.json()]
    assert sid in ids


@pytest.mark.asyncio
async def test_migrate_skips_existing(client: AsyncClient):
    """Migrate skips sessions that already exist (conflict handling)."""
    mid1, mid2 = str(uuid.uuid4()), str(uuid.uuid4())
    sess_id = str(uuid.uuid4())
    payload = {
        "user_id": "user-1",
        "sessions": [
            {"id": sess_id, "title": "Original", "messages": [{"id": mid1, "role": "user", "content": "A", "timestamp": "2024-01-15T12:00:00Z"}]},
        ],
    }
    res1 = await client.post("/api/migrate", json=payload)
    assert res1.json()["imported"] == 1
    payload["sessions"][0]["messages"][0]["id"] = mid2
    res2 = await client.post("/api/migrate", json=payload)
    assert res2.json()["imported"] == 0
    assert res2.json()["skipped"] == 1
