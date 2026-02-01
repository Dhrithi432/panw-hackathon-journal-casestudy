from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.core.config import settings
from datetime import datetime

# Import both services
from app.core.anthropic_service import anthropic_service
from app.core.mock_ai_service import mock_ai_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Handle chat messages and return AI response
    """
    try:
        # Convert messages to format
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        # Choose service based on config
        if settings.use_mock_ai:
            response_text = await mock_ai_service.chat(messages)
        else:
            response_text = await anthropic_service.chat(messages)
        
        return ChatResponse(
            message=response_text,
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opening-prompt")
async def get_opening_prompt():
    """
    Get a friendly opening message from the AI
    """
    return {
        "message": "Hi! I'm Mira, your journaling companion. I'm here to listen and help you reflect. What's on your mind today?"
    }