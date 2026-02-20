"""Tests for config/settings."""
import pytest


def test_settings_loads_defaults():
    """Settings have expected values (env may override)."""
    from app.core.config import settings

    assert settings.port >= 0
    assert isinstance(settings.use_mock_ai, bool)
    assert settings.anthropic_api_key is not None


def test_settings_has_required_fields():
    """Settings exposes required configuration fields."""
    from app.core.config import settings

    assert hasattr(settings, "anthropic_api_key")
    assert hasattr(settings, "port")
    assert hasattr(settings, "use_mock_ai")
