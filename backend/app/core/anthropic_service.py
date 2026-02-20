import anthropic
from app.core.config import settings
from typing import List, Dict

class AnthropicService:
    def __init__(self):
        if settings.anthropic_api_key and settings.anthropic_api_key != "mock-key":
            self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        else:
            self.client = None
    
    async def chat(self, messages: List[Dict[str, str]], max_tokens: int = 500, context_summary: str | None = None) -> str:
        """
        Send messages to Claude and get a response
        """
        if not self.client:
            return "API not configured. Please add your Anthropic API key to use real AI insights."
        
        context_block = f"\n\nEarlier in this conversation:\n{context_summary}" if context_summary else ""
        system_prompt = """You are Mira, an empathetic AI journaling companion. Your role is to:
- Listen actively and respond with genuine understanding
- Ask thoughtful follow-up questions (one at a time)
- Help users reflect on their thoughts and feelings
- Maintain a warm, supportive, non-judgmental tone
- Keep responses concise (2-3 sentences typically)
- Never provide medical or therapeutic advice
- If someone expresses crisis thoughts, gently suggest professional help

Remember: You're a reflective companion, not a therapist.""" + context_block

        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,  # Now configurable
                system=system_prompt,
                messages=messages
            )
            
            return response.content[0].text
        
        except Exception as e:
            print(f"Error calling Anthropic API: {e}")
            raise

    async def summarize(self, messages: List[Dict[str, str]], max_tokens: int = 150) -> str:
        """Summarize conversation history into 2-3 sentences."""
        if not self.client:
            return self._fallback_summary(messages)
        prompt = """Summarize this journal conversation in 2-3 concise sentences. Capture themes, feelings, and key points. Output only the summary."""
        text = "\n".join(f"{m['role']}: {m['content']}" for m in messages)
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,
                messages=[{"role": "user", "content": f"{prompt}\n\n{text}"}],
            )
            return response.content[0].text.strip()
        except Exception as e:
            print(f"Error summarizing: {e}")
            return self._fallback_summary(messages)

    def _fallback_summary(self, messages: List[Dict[str, str]]) -> str:
        """Heuristic fallback when no API client."""
        user_msgs = [m["content"][:80] for m in messages if m["role"] == "user"][:5]
        return "User shared thoughts including: " + "; ".join(user_msgs) + ("..." if len(messages) > 5 else "")

# Global instance
anthropic_service = AnthropicService()