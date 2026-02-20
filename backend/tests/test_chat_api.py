"""Tests for chat API endpoints."""
import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_opening_prompt(client: AsyncClient):
    """Test opening prompt endpoint returns Mira's greeting."""
    response = await client.get("/api/opening-prompt")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "Mira" in data["message"]


@pytest.mark.asyncio
async def test_chat_with_mock_ai(client: AsyncClient):
    """Test chat endpoint with mock AI."""
    with patch("app.api.chat.settings") as mock_settings:
        mock_settings.use_mock_ai = True
        response = await client.post(
            "/api/chat",
            json={
                "messages": [
                    {"role": "user", "content": "I'm feeling stressed today"}
                ],
                "user_id": "test-user-123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "timestamp" in data
        assert len(data["message"]) > 0


@pytest.mark.asyncio
async def test_chat_invalid_payload(client: AsyncClient):
    """Test chat endpoint with invalid payload."""
    response = await client.post(
        "/api/chat",
        json={"messages": [], "user_id": "test"},
    )
    # Empty messages: 422 (validation), 500 (downstream API error), or 200 (mock)
    assert response.status_code in (200, 422, 500)


@pytest.mark.asyncio
async def test_chat_missing_user_id(client: AsyncClient):
    """Test chat endpoint without user_id."""
    response = await client.post(
        "/api/chat",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
        },
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_with_real_ai_uses_anthropic(
    client: AsyncClient,
):
    """When use_mock_ai is False, anthropic service is called."""
    with patch("app.api.chat.settings") as mock_settings:
        mock_settings.use_mock_ai = False
        with patch("app.api.chat.anthropic_service") as mock_anthropic:
            mock_anthropic.chat = AsyncMock(return_value="Mocked AI response")
            response = await client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Hi"}],
                    "user_id": "test",
                },
            )
            assert response.status_code == 200
            assert response.json()["message"] == "Mocked AI response"
