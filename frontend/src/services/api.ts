const API_BASE_URL = 'http://localhost:8000/api';

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

export const apiService = {
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
};