import anthropic
from app.core.config import settings
from typing import List, Dict

class AnthropicService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    
    async def chat(self, messages: List[Dict[str, str]]) -> str:
        """
        Send messages to Claude and get a response
        """
        # System prompt for journaling companion
        system_prompt = """You are Mira, an empathetic AI journaling companion. Your role is to:
- Listen actively and respond with genuine understanding
- Ask thoughtful follow-up questions (one at a time)
- Help users reflect on their thoughts and feelings
- Maintain a warm, supportive, non-judgmental tone
- Keep responses concise (2-3 sentences typically)
- Never provide medical or therapeutic advice
- If someone expresses crisis thoughts, gently suggest professional help

Remember: You're a reflective companion, not a therapist."""

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                system=system_prompt,
                messages=messages
            )
            
            return response.content[0].text
        
        except Exception as e:
            print(f"Error calling Anthropic API: {e}")
            raise

# Global instance
anthropic_service = AnthropicService()