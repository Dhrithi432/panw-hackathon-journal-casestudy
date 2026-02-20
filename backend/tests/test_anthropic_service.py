"""Tests for AnthropicService."""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock


@pytest.mark.asyncio
async def test_anthropic_service_returns_message_when_no_client():
    """When API key is mock-key, chat returns fallback message."""
    from app.core.anthropic_service import AnthropicService

    with patch("app.core.anthropic_service.settings") as mock_settings:
        mock_settings.anthropic_api_key = "mock-key"
        service = AnthropicService()
        service.client = None

        response = await service.chat([{"role": "user", "content": "Hello"}])
        assert "API not configured" in response


@pytest.mark.asyncio
async def test_anthropic_service_calls_api_when_client_exists():
    """When client exists, chat calls Anthropic API and returns text."""
    with patch("app.core.anthropic_service.settings") as mock_settings:
        mock_settings.anthropic_api_key = "real-key"
        mock_settings.use_mock_ai = False

        mock_msg = MagicMock()
        mock_msg.content = [MagicMock(text="AI says hi")]
        mock_client = MagicMock()
        mock_client.messages.create = MagicMock(return_value=mock_msg)

        with patch("anthropic.Anthropic", return_value=mock_client):
            from app.core.anthropic_service import AnthropicService

            service = AnthropicService()
            response = await service.chat([{"role": "user", "content": "Hi"}])

        assert response == "AI says hi"
        mock_client.messages.create.assert_called_once()
