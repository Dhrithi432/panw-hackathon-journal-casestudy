"""Tests for MockAIService."""
import pytest
from app.core.mock_ai_service import MockAIService


@pytest.mark.asyncio
async def test_mock_ai_returns_string():
    """Mock AI chat returns a non-empty string."""
    service = MockAIService()
    response = await service.chat([{"role": "user", "content": "Hello"}])
    assert isinstance(response, str)
    assert len(response) > 0


@pytest.mark.asyncio
async def test_mock_ai_response_from_predefined_list():
    """Mock AI response is one of the predefined empathetic responses."""
    service = MockAIService()
    responses = set()
    for _ in range(50):  # Multiple calls to increase chance of variety
        r = await service.chat([{"role": "user", "content": "test"}])
        responses.add(r)
    assert all(r in service.responses for r in responses)
    assert len(responses) >= 1


@pytest.mark.asyncio
async def test_mock_ai_accepts_various_message_formats():
    """Mock AI handles different message structures."""
    service = MockAIService()
    r1 = await service.chat([{"role": "user", "content": "Short"}])
    r2 = await service.chat([{"role": "user", "content": "Long message with many words"}])
    assert isinstance(r1, str) and isinstance(r2, str)
