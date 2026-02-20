/**
 * Data migration: localStorage → database (Supabase or sessions API).
 */
import type { JournalSession } from '@/types';
import { storageService } from './storage';
import { apiService } from './api';
import { supabaseStorage } from './supabase-storage';
import { isSupabaseConfigured } from '@/lib/supabase';

const BATCH_SIZE = 5;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export interface MigrationResult {
  imported: number;
  skipped: number;
  done: boolean;
  error?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function migrateBatchToApi(
  userId: string,
  batch: JournalSession[],
  attempt = 0
): Promise<{ imported: number; skipped: number }> {
  try {
    const payload = batch.map((s) => ({
      id: s.id,
      title: s.title,
      messages: s.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : (m.timestamp as unknown as string),
      })),
    }));
    return await apiService.migrateSessions(userId, payload);
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
      return migrateBatchToApi(userId, batch, attempt + 1);
    }
    throw err;
  }
}

async function migrateToSupabase(userId: string, sessions: JournalSession[]): Promise<{ imported: number; skipped: number }> {
  let imported = 0;
  let skipped = 0;
  for (const s of sessions) {
    try {
      await supabaseStorage.createSession(userId, s.title, s.id);
      await supabaseStorage.saveMessages(s.id, userId, s.messages);
      imported += 1;
    } catch {
      skipped += 1;
    }
  }
  return { imported, skipped };
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function hasLocalSessionsToMigrate(): boolean {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('mindspace-session-')) return true;
  }
  return false;
}

export function isMigrationComplete(): boolean {
  return localStorage.getItem('mindspace-migrated') === 'true';
}

export function clearMigrationFlag(): void {
  localStorage.removeItem('mindspace-migrated');
}

export async function runMigration(userId: string): Promise<MigrationResult> {
  if (isMigrationComplete() || !hasLocalSessionsToMigrate()) {
    return { imported: 0, skipped: 0, done: true };
  }

  const sessions = storageService.getSessionsFromStorage();
  if (sessions.length === 0) return { imported: 0, skipped: 0, done: true };

  let totalImported = 0;
  let totalSkipped = 0;

  try {
    if (isSupabaseConfigured()) {
      const result = await migrateToSupabase(userId, sessions);
      totalImported = result.imported;
      totalSkipped = result.skipped;
    } else {
      const batches = chunk(sessions, BATCH_SIZE);
      for (const batch of batches) {
        const { imported, skipped } = await migrateBatchToApi(userId, batch);
        totalImported += imported;
        totalSkipped += skipped;
      }
    }

    localStorage.setItem('mindspace-migrated', 'true');
    for (const s of sessions) {
      localStorage.removeItem(`mindspace-session-${s.id}`);
    }

    return { imported: totalImported, skipped: totalSkipped, done: true };
  } catch (err) {
    return {
      imported: totalImported,
      skipped: totalSkipped,
      done: false,
      error: err instanceof Error ? err.message : 'Migration failed',
    };
  }
}
