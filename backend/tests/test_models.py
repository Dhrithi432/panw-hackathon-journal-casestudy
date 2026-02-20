"""Tests for Pydantic models."""
import pytest
from datetime import datetime
from pydantic import ValidationError

from app.models.chat import ChatMessage, ChatRequest, ChatResponse


def test_chat_message_validation():
    """ChatMessage validates role and content."""
    msg = ChatMessage(role="user", content="Hello")
    assert msg.role == "user"
    assert msg.content == "Hello"

    msg2 = ChatMessage(role="assistant", content="Hi back")
    assert msg2.role == "assistant"


def test_chat_message_invalid_role():
    """ChatMessage rejects invalid role."""
    with pytest.raises(ValidationError):
        ChatMessage(role="system", content="Hi")


def test_chat_request_validation():
    """ChatRequest accepts valid structure."""
    req = ChatRequest(
        messages=[ChatMessage(role="user", content="Hi")],
        user_id="user-123",
    )
    assert len(req.messages) == 1
    assert req.user_id == "user-123"


def test_chat_response_validation():
    """ChatResponse accepts message and timestamp."""
    now = datetime.now()
    resp = ChatResponse(message="Hello", timestamp=now)
    assert resp.message == "Hello"
    assert resp.timestamp == now
