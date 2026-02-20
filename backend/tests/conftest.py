"""Pytest fixtures for backend tests."""
import pytest
from unittest.mock import patch, MagicMock
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    """Async HTTP client for testing FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


@pytest.fixture
def mock_settings():
    """Patch settings for testing."""
    with patch("app.core.config.settings") as mock:
        mock.anthropic_api_key = "mock-key"
        mock.use_mock_ai = True
        mock.port = 8000
        yield mock


@pytest.fixture
def mock_anthropic_client():
    """Mock Anthropic client for testing."""
    with patch("app.core.anthropic_service.anthropic.Anthropic") as mock:
        instance = MagicMock()
        mock.return_value = instance
        yield instance
