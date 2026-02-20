from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse, SummarizeRequest, SummarizeResponse
from app.core.config import settings
from datetime import datetime

# Import both services
from app.core.anthropic_service import anthropic_service
from app.core.mock_ai_service import mock_ai_service

router = APIRouter()

MAX_CONTEXT_MESSAGES = 30

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat messages and return AI response
    """
    try:
        # Convert and truncate to avoid context overflow
        raw = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        messages = raw[-MAX_CONTEXT_MESSAGES:] if len(raw) > MAX_CONTEXT_MESSAGES else raw
        
        context_summary = request.context_summary

        # Choose service based on config
        if settings.use_mock_ai:
            response_text = await mock_ai_service.chat(messages)
        else:
            response_text = await anthropic_service.chat(messages, context_summary=context_summary)
        
        return ChatResponse(
            message=response_text,
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(request: SummarizeRequest):
    """Compress older messages into a brief summary for context retention."""
    if not request.messages:
        return SummarizeResponse(summary="")
    raw = [{"role": msg.role, "content": msg.content} for msg in request.messages]
    summary = await anthropic_service.summarize(raw)
    return SummarizeResponse(summary=summary)


@router.get("/opening-prompt")
async def get_opening_prompt():
    """
    Get a friendly opening message from the AI
    """
    return {
        "message": "Hi! I'm Mira, your journaling companion. I'm here to listen and help you reflect. What's on your mind today?"
    }