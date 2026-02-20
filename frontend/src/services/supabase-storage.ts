/**
 * Supabase-backed storage for sessions and messages.
 * Used when VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.
 */
import type { ChatMessage } from '@/types';
import type { JournalSession } from '@/types';
import { supabase } from '@/lib/supabase';
import { generateId } from '@/lib/utils';

function mapRowToSession(row: { id: string; title: string; created_at: string; updated_at: string }, messages: ChatMessage[]): JournalSession {
  return {
    id: row.id,
    title: row.title,
    messages,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapRowToMessage(row: { id: string; role: string; content: string; timestamp: string }): ChatMessage {
  return {
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: new Date(row.timestamp),
  };
}

export const supabaseStorage = {
  async getSessions(userId: string): Promise<JournalSession[]> {
    const { data: rows, error } = await supabase!
      .from('sessions')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    if (!rows?.length) return [];

    const sessions: JournalSession[] = [];
    for (const row of rows) {
      const messages = await this.getMessagesForSession(row.id);
      sessions.push(mapRowToSession(row, messages));
    }
    return sessions;
  },

  async getMessagesForSession(sessionId: string): Promise<ChatMessage[]> {
    const { data: rows, error } = await supabase!
      .from('messages')
      .select('id, role, content, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return (rows || []).map(mapRowToMessage);
  },

  async createSession(userId: string, title = 'New Entry', existingId?: string): Promise<string> {
    const id = existingId ?? generateId();
    const { error } = await supabase!.from('sessions').insert({
      id,
      user_id: userId,
      title,
    });
    if (error) throw error;
    return id;
  },

  async getSession(sessionId: string, _userId: string): Promise<ChatMessage[] | null> {
    const { data: session } = await supabase!.from('sessions').select('id').eq('id', sessionId).single();
    if (!session) return null;
    return this.getMessagesForSession(sessionId);
  },

  async saveMessages(sessionId: string, _userId: string, messages: ChatMessage[]): Promise<void> {
    const { error: delErr } = await supabase!.from('messages').delete().eq('session_id', sessionId);
    if (delErr) throw delErr;

    if (messages.length === 0) return;

    const rows = messages.map((m) => ({
      id: m.id,
      session_id: sessionId,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    }));
    const { error } = await supabase!.from('messages').insert(rows);
    if (error) throw error;

    // bump session updated_at
    await supabase!.from('sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
  },

  async deleteSession(sessionId: string, _userId: string): Promise<void> {
    const { error } = await supabase!.from('sessions').delete().eq('id', sessionId);
    if (error) throw error;
  },
};
