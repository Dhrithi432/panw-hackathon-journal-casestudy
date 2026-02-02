const API_BASE_URL = 'https://panw-hackathon-journal-casestudy-production.up.railway.app/api';

//  const API_BASE_URL = 'http://localhost:8000/api';

// Chat interfaces
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  user_id: string;
}

export interface ChatResponse {
  message: string;
  timestamp: string;
}

// Insights interfaces
export interface JournalEntry {
  date: string;
  message_count: number;
  sample_messages: string[];
}

export interface InsightsRequest {
  entries: JournalEntry[];
  total_days_active: number;
  total_messages: number;
}

export interface WordCloudWord {
  word: string;
  size: number;
}

export interface ThemeNode {
  theme: string;
  emoji: string;
  frequency: number;
  sentiment: string;
  dates: string[];
}

export interface ThoughtConnection {
  from_theme: string;
  to_theme: string;
  strength: number;
}

export interface UnifiedInsights {
  // Word Cloud
  central_theme: string;
  central_emoji: string;
  theme_description: string;
  theme_color: string;
  related_words: WordCloudWord[];
  
  // Constellation
  core_themes: ThemeNode[];
  connections: ThoughtConnection[];
  narrative: string;
  hidden_pattern: string;
  future_prompt: string;
}

// API Service
export const apiService = {
  // Chat methods
  async sendMessage(messages: Message[], userId: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        user_id: userId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data: ChatResponse = await response.json();
    return data.message;
  },

  async getOpeningPrompt(): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/opening-prompt`);
    
    if (!response.ok) {
      throw new Error('Failed to get opening prompt');
    }

    const data = await response.json();
    return data.message;
  },

  // Insights methods
  async generateUnifiedInsights(request: InsightsRequest): Promise<UnifiedInsights> {
    const response = await fetch(`${API_BASE_URL}/insights/unified`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to generate insights');
    }

    return await response.json();
  },
};