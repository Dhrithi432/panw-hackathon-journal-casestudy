from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
from app.core.anthropic_service import anthropic_service

router = APIRouter()

class JournalEntry(BaseModel):
    date: str = Field(..., max_length=20)
    message_count: int = Field(..., ge=0, le=10000)
    sample_messages: List[str] = Field(..., max_length=100)

class InsightsRequest(BaseModel):
    entries: List[JournalEntry] = Field(..., max_length=500)
    total_days_active: int = Field(..., ge=0, le=10000)
    total_messages: int = Field(..., ge=0, le=100000)

class ThemeNode(BaseModel):
    theme: str
    emoji: str
    frequency: int
    sentiment: str
    dates: List[str]

class ThoughtConnection(BaseModel):
    from_theme: str
    to_theme: str
    strength: int

class WordCloudWord(BaseModel):
    word: str
    size: int

class UnifiedInsights(BaseModel):
    # Word Cloud Data
    central_theme: str
    central_emoji: str
    theme_description: str
    theme_color: str
    related_words: List[WordCloudWord]
    
    # Constellation Data
    core_themes: List[ThemeNode]
    connections: List[ThoughtConnection]
    narrative: str
    hidden_pattern: str
    future_prompt: str

@router.post("/insights/unified", response_model=UnifiedInsights)
async def generate_unified_insights(request: InsightsRequest):
    """
    Generate comprehensive insights: word cloud + constellation in one call
    """
    try:
        if not anthropic_service.client:
            raise HTTPException(
                status_code=503,
                detail="AI service not available. Please configure Anthropic API key."
            )
        
        # Collect all user messages
        all_messages = []
        entries_context = []
        
        for idx, entry in enumerate(request.entries[-15:]):
            all_messages.extend(entry.sample_messages)
            messages_text = "\n  ".join([f'- "{msg}"' for msg in entry.sample_messages[:5]])
            entries_context.append(
                f"Entry {idx+1} ({entry.date}, {entry.message_count} messages):\n  {messages_text}"
            )
        
        full_text = " ".join(all_messages)
        entries_summary = "\n\n".join(entries_context)
        
        prompt = f"""Analyze this person's journal entries to create a comprehensive insight dashboard with BOTH a word cloud and theme constellation.

JOURNAL ENTRIES ({len(request.entries)} total, over {request.total_days_active} days):

{entries_summary}

FULL TEXT FOR WORD ANALYSIS:
{full_text[:2500]}

Provide TWO types of analysis in one JSON response:

1. WORD CLOUD (Central Theme Focus):
   - Identify the SINGLE most dominant theme
   - Name it specifically (2-4 words)
   - Choose perfect emoji
   - Write 1-sentence description
   - Extract 12-15 related words from their actual text
   - Assign sizes (1-5) based on frequency
   - Pick a theme color (hex) matching the mood

2. CONSTELLATION (Multiple Themes & Connections):
   - Identify 3-5 core themes (can include the central theme)
   - For each: name, emoji, frequency, sentiment, dates
   - Map 3-5 connections between themes (strength 1-5)
   - Write narrative (3-4 sentences)
   - Identify hidden pattern (2-3 sentences)
   - Provide thoughtful future prompt question

IMPORTANT:
- Use their ACTUAL words
- Be specific and personal to their content
- If work stress appears 2+ times: make it prominent
- Connect themes meaningfully

Respond with ONLY valid JSON:
{{
  "central_theme": "Most Dominant Theme",
  "central_emoji": "🎯",
  "theme_description": "This theme recurs because...",
  "theme_color": "#9333ea",
  "related_words": [
    {{"word": "actual-word", "size": 5}},
    {{"word": "another", "size": 4}}
  ],
  "core_themes": [
    {{"theme": "Theme Name", "emoji": "⏰", "frequency": 3, "sentiment": "negative", "dates": ["Jan 15", "Jan 17"]}}
  ],
  "connections": [
    {{"from_theme": "Theme1", "to_theme": "Theme2", "strength": 5}}
  ],
  "narrative": "Your journal reveals...",
  "hidden_pattern": "You might not have noticed...",
  "future_prompt": "What would it look like if...?"
}}"""

        messages = [{"role": "user", "content": prompt}]
        # response_text = await anthropic_service.chat(messages)
        response_text = await anthropic_service.chat(messages, max_tokens=2000)

        
        import json
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()
        if response_text.startswith("```"):
            response_text = response_text.replace("```", "").strip()
        
        insights = json.loads(response_text)
        return UnifiedInsights(**insights)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))