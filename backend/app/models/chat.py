from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: str

class ChatResponse(BaseModel):
    message: str
    timestamp: datetime