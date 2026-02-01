import random
from typing import List, Dict

class MockAIService:
    """Mock AI service that returns predefined responses"""
    
    def __init__(self):
        self.responses = [
            "I hear you. That sounds really challenging. What aspect of this is affecting you the most?",
            "Thank you for sharing that with me. How long have you been feeling this way?",
            "That's completely understandable. It's okay to feel this way. What would help you feel better right now?",
            "I appreciate you opening up about this. What do you think triggered these feelings?",
            "That must be difficult to deal with. Have you noticed any patterns in when you feel this way?",
            "It sounds like you're going through a lot. What's been your biggest source of support lately?",
            "I'm here to listen. Is there something specific you'd like to talk through?",
            "That's a valid feeling. What would you say to a friend going through the same thing?",
            "Thanks for trusting me with this. What's one small thing that made you smile today?",
            "I understand. Sometimes just expressing these thoughts can help. How are you taking care of yourself?",
        ]
    
    async def chat(self, messages: List[Dict[str, str]]) -> str:
        """Return a random empathetic response"""
        return random.choice(self.responses)

# Global instance
mock_ai_service = MockAIService()