from pydantic import BaseModel, Field
from typing import List, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(..., max_length=10000)

class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., max_length=50)
    user_id: str = Field(..., max_length=128)
    context_summary: str | None = Field(None, max_length=5000)


class SummarizeRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., max_length=50)


class SummarizeResponse(BaseModel):
    summary: str

class ChatResponse(BaseModel):
    message: str
    timestamp: datetime