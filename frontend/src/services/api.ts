import { truncateMessages, splitForSummarization, MAX_CONTEXT_MESSAGES } from '@/lib/utils';

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

// Sessions (PostgreSQL) interfaces
export interface SessionMessage {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface SessionData {
  id: string;
  title: string;
  messages: SessionMessage[];
  created_at: string;
  updated_at: string;
}

// API Service
export const apiService = {
  async summarize(messages: Message[]): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!response.ok) throw new Error('Failed to summarize');
    const data = await response.json();
    return data.summary;
  },

  async sendMessage(messages: Message[], userId: string): Promise<string> {
    const { old, recent } = splitForSummarization(messages, MAX_CONTEXT_MESSAGES);
    let messagesToSend = recent;
    let contextSummary: string | undefined;

    if (old.length > 0) {
      try {
        contextSummary = await this.summarize(old);
      } catch {
        messagesToSend = truncateMessages(messages);
      }
    } else {
      messagesToSend = truncateMessages(messages);
    }

    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messagesToSend,
        user_id: userId,
        ...(contextSummary && { context_summary: contextSummary }),
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

  // Sessions API (PostgreSQL)
  async listSessions(userId: string): Promise<SessionData[]> {
    const res = await fetch(`${API_BASE_URL}/sessions?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to list sessions');
    return res.json();
  },
  async createSession(userId: string, title = 'New Entry'): Promise<SessionData> {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, title }),
    });
    if (!res.ok) throw new Error('Failed to create session');
    return res.json();
  },
  async getSession(sessionId: string, userId: string): Promise<SessionData> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}?user_id=${encodeURIComponent(userId)}`);
    if (!res.ok) throw new Error('Failed to get session');
    return res.json();
  },
  async saveMessages(sessionId: string, userId: string, messages: { id: string; role: string; content: string; timestamp: Date | string }[]): Promise<SessionData> {
    const payload = messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages?user_id=${encodeURIComponent(userId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: payload }),
    });
    if (!res.ok) throw new Error('Failed to save messages');
    return res.json();
  },
  async deleteSession(sessionId: string, userId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}?user_id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete session');
  },
};