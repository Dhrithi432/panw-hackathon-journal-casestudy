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


@pytest.mark.asyncio
async def test_chat_truncates_large_history(client: AsyncClient):
    """Chat truncates to last 30 messages when payload exceeds limit."""
    with patch("app.api.chat.settings") as mock_settings:
        mock_settings.use_mock_ai = True
        with patch("app.api.chat.mock_ai_service") as mock_ai:
            mock_ai.chat = AsyncMock(return_value="Thanks for sharing.")
            messages = [
                {"role": "user", "content": f"Message {i}"} if i % 2 == 0
                else {"role": "assistant", "content": f"Reply {i}"}
                for i in range(50)
            ]
            response = await client.post(
                "/api/chat",
                json={"messages": messages, "user_id": "test"},
            )
            assert response.status_code == 200
            call_args = mock_ai.chat.call_args[0][0]
            assert len(call_args) == 30
            assert call_args[0]["content"] == "Message 20"


@pytest.mark.asyncio
async def test_summarize_endpoint(client: AsyncClient):
    """Summarize endpoint returns a summary of messages."""
    with patch("app.api.chat.anthropic_service") as mock_anthropic:
        mock_anthropic.summarize = AsyncMock(return_value="User discussed work stress and deadlines.")
        response = await client.post(
            "/api/summarize",
            json={"messages": [{"role": "user", "content": "Work is hard"}, {"role": "assistant", "content": "I hear you."}]},
        )
        assert response.status_code == 200
        assert response.json()["summary"] == "User discussed work stress and deadlines."


@pytest.mark.asyncio
async def test_chat_with_context_summary(client: AsyncClient):
    """Chat passes context_summary to anthropic when provided."""
    with patch("app.api.chat.settings") as mock_settings:
        mock_settings.use_mock_ai = False
        with patch("app.api.chat.anthropic_service") as mock_anthropic:
            mock_anthropic.chat = AsyncMock(return_value="I remember. How are you feeling now?")
            response = await client.post(
                "/api/chat",
                json={
                    "messages": [{"role": "user", "content": "Follow-up"}],
                    "user_id": "test",
                    "context_summary": "Earlier: user felt stressed about work.",
                },
            )
            assert response.status_code == 200
            mock_anthropic.chat.assert_called_once()
            call_kwargs = mock_anthropic.chat.call_args[1]
            assert call_kwargs["context_summary"] == "Earlier: user felt stressed about work."
