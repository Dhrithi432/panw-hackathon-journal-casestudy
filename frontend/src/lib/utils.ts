import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/** Max messages to send to AI (avoids context overflow). Keep last N for conversation continuity. */
export const MAX_CONTEXT_MESSAGES = 30;

export function truncateMessages<T extends { role: string; content: string }>(
  messages: T[],
  maxMessages: number = MAX_CONTEXT_MESSAGES
): T[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(-maxMessages);
}

/** Split messages for summarization: old (to summarize) + recent (to send). Recent count = maxMessages - 1 (reserve 1 for summary slot). */
export function splitForSummarization<T extends { role: string; content: string }>(
  messages: T[],
  maxMessages: number = MAX_CONTEXT_MESSAGES
): { old: T[]; recent: T[] } {
  const recentCount = maxMessages - 1;
  if (messages.length <= maxMessages) return { old: [], recent: messages };
  return {
    old: messages.slice(0, -(recentCount)),
    recent: messages.slice(-(recentCount)),
  };
}