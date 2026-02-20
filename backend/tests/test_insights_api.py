"""Tests for insights API endpoint."""
import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_insights_unified_returns_503_when_no_api_key(client: AsyncClient):
    """Insights endpoint returns 503 when Anthropic client is not configured."""
    from unittest.mock import MagicMock
    mock_svc = MagicMock()
    mock_svc.client = None  # Falsy - triggers 503
    with patch("app.api.insights.anthropic_service", mock_svc):
        response = await client.post(
            "/api/insights/unified",
            json={
                "entries": [
                    {"date": "2024-01-15", "message_count": 3, "sample_messages": ["Hello", "Feeling good", "Work stress"]},
                ],
                "total_days_active": 1,
                "total_messages": 3,
            },
        )
        assert response.status_code == 503
        assert "API key" in response.json()["detail"]


@pytest.mark.asyncio
async def test_insights_unified_success_with_mocked_anthropic(client: AsyncClient):
    """Insights endpoint returns unified insights when Anthropic is mocked."""
    mock_response = """
    {
      "central_theme": "Work Stress",
      "central_emoji": "💼",
      "theme_description": "Work-related stress dominates your reflections.",
      "theme_color": "#9333ea",
      "related_words": [
        {"word": "work", "size": 5},
        {"word": "stress", "size": 4},
        {"word": "deadline", "size": 3}
      ],
      "core_themes": [
        {"theme": "Work Stress", "emoji": "💼", "frequency": 3, "sentiment": "negative", "dates": ["Jan 15"]}
      ],
      "connections": [
        {"from_theme": "Work Stress", "to_theme": "Anxiety", "strength": 4}
      ],
      "narrative": "Your journal reveals patterns of work-related stress.",
      "hidden_pattern": "You tend to journal more on Mondays.",
      "future_prompt": "What would it look like if work felt less overwhelming?"
    }
    """
    with patch("app.api.insights.anthropic_service") as mock_anthropic:
        mock_anthropic.client = object()  # Pretend client exists
        mock_anthropic.chat = AsyncMock(return_value=mock_response)

        response = await client.post(
            "/api/insights/unified",
            json={
                "entries": [
                    {"date": "2024-01-15", "message_count": 2, "sample_messages": ["Work is hard", "Deadline tomorrow"]},
                ],
                "total_days_active": 1,
                "total_messages": 2,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["central_theme"] == "Work Stress"
        assert data["central_emoji"] == "💼"
        assert len(data["related_words"]) == 3
        assert len(data["core_themes"]) == 1
        assert len(data["connections"]) == 1


@pytest.mark.asyncio
async def test_insights_unified_json_in_markdown(client: AsyncClient):
    """Insights parses JSON when wrapped in ```json code block."""
    mock_response = """```json
    {"central_theme":"Test","central_emoji":"🎯","theme_description":"Desc","theme_color":"#000","related_words":[{"word":"a","size":1}],"core_themes":[{"theme":"T","emoji":"🎯","frequency":1,"sentiment":"neutral","dates":[]}],"connections":[],"narrative":"N","hidden_pattern":"P","future_prompt":"Q"}
    ```"""
    with patch("app.api.insights.anthropic_service") as mock_anthropic:
        mock_anthropic.client = object()
        mock_anthropic.chat = AsyncMock(return_value=mock_response)

        response = await client.post(
            "/api/insights/unified",
            json={
                "entries": [{"date": "2024-01-15", "message_count": 1, "sample_messages": ["Hi"]}],
                "total_days_active": 1,
                "total_messages": 1,
            },
        )
        assert response.status_code == 200
        assert response.json()["central_theme"] == "Test"


@pytest.mark.asyncio
async def test_insights_invalid_payload(client: AsyncClient):
    """Insights returns 422 for invalid payload."""
    response = await client.post(
        "/api/insights/unified",
        json={"entries": "not-a-list", "total_days_active": 1, "total_messages": 0},
    )
    assert response.status_code == 422
