/**
 * Storage abstraction: tries API (PostgreSQL) first, falls back to localStorage.
 * Allows gradual migration and works when sessions API is not yet deployed.
 */
import type { ChatMessage } from '@/types';
import type { JournalSession } from '@/types';
import { apiService } from './api';
import { generateId } from '@/lib/utils';

export const storageService = {
  async getSessions(userId: string): Promise<JournalSession[]> {
    try {
      const data = await apiService.listSessions(userId);
      return data.map((s) => ({
        id: s.id,
        title: s.title,
        messages: s.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.timestamp),
        })),
        createdAt: new Date(s.created_at),
        updatedAt: new Date(s.updated_at),
      }));
    } catch {
      return this.getSessionsFromStorage();
    }
  },

  getSessionsFromStorage(): JournalSession[] {
    const all: JournalSession[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('mindspace-session-')) {
        const data = localStorage.getItem(key);
        if (data) {
          const messages = JSON.parse(data, (k, v) => (k === 'timestamp' ? new Date(v) : v));
          const sessionId = key.replace('mindspace-session-', '');
          const firstUser = messages.find((m: ChatMessage) => m.role === 'user');
          const title = firstUser ? firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '...' : '') : 'New Entry';
          all.push({
            id: sessionId,
            title,
            messages,
            createdAt: messages[0]?.timestamp || new Date(),
            updatedAt: messages[messages.length - 1]?.timestamp || new Date(),
          });
        }
      }
    }
    all.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return all;
  },

  async createSession(userId: string, title = 'New Entry'): Promise<string> {
    try {
      const s = await apiService.createSession(userId, title);
      return s.id;
    } catch {
      const id = generateId();
      localStorage.setItem('mindspace-current-session', id);
      return id;
    }
  },

  async getSession(sessionId: string, userId: string): Promise<ChatMessage[] | null> {
    try {
      const s = await apiService.getSession(sessionId, userId);
      return s.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));
    } catch {
      const data = localStorage.getItem(`mindspace-session-${sessionId}`);
      return data ? JSON.parse(data, (k, v) => (k === 'timestamp' ? new Date(v) : v)) : null;
    }
  },

  async saveMessages(sessionId: string, userId: string, messages: ChatMessage[]): Promise<void> {
    try {
      await apiService.saveMessages(sessionId, userId, messages);
    } catch {
      localStorage.setItem(`mindspace-session-${sessionId}`, JSON.stringify(messages));
    }
  },

  saveMessagesToStorage(sessionId: string, messages: ChatMessage[]): void {
    localStorage.setItem(`mindspace-session-${sessionId}`, JSON.stringify(messages));
  },

  async deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
      await apiService.deleteSession(sessionId, userId);
    } catch {
      localStorage.removeItem(`mindspace-session-${sessionId}`);
    }
  },

  deleteSessionFromStorage(sessionId: string): void {
    localStorage.removeItem(`mindspace-session-${sessionId}`);
  },

  getCurrentSessionId(): string | null {
    return localStorage.getItem('mindspace-current-session');
  },

  setCurrentSessionId(sessionId: string): void {
    localStorage.setItem('mindspace-current-session', sessionId);
  },
};
