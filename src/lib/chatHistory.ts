/**
 * chatHistory.ts
 * ─────────────
 * Persistent chat session management via localStorage.
 * Each session stores its full UIMessage[] so we can restore the exact
 * conversation — including rendered tool results — when the user returns.
 */

import type { UIMessage } from "ai";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number; // epoch ms
  updatedAt: number;
  messages: UIMessage[];
}

export type DateGroup = "Today" | "Yesterday" | "This week" | "Older";

export interface GroupedSessions {
  group: DateGroup;
  sessions: ChatSession[];
}

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "sonic_chat_sessions";

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function getSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function getSession(id: string): ChatSession | undefined {
  return getSessions().find((s) => s.id === id);
}

export function saveSession(session: ChatSession): void {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session); // newest first
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a human-readable title from the first user message text.
 * Falls back to "New conversation" for tool-only or empty messages.
 */
export function generateSessionTitle(messages: UIMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "New conversation";

  for (const part of firstUser.parts) {
    if (part.type === "text" && part.text.trim()) {
      const t = part.text.trim();
      return t.length > 52 ? t.slice(0, 52) + "…" : t;
    }
  }
  return "New conversation";
}

/**
 * Group sessions by recency — mirrors the Claude sidebar pattern.
 */
export function groupSessionsByDate(sessions: ChatSession[]): GroupedSessions[] {
  const now = Date.now();
  const DAY = 86_400_000;

  const groups: Record<DateGroup, ChatSession[]> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Older: [],
  };

  for (const session of sessions) {
    const age = now - session.updatedAt;
    if (age < DAY) {
      groups["Today"].push(session);
    } else if (age < 2 * DAY) {
      groups["Yesterday"].push(session);
    } else if (age < 7 * DAY) {
      groups["This week"].push(session);
    } else {
      groups["Older"].push(session);
    }
  }

  return (["Today", "Yesterday", "This week", "Older"] as DateGroup[])
    .filter((g) => groups[g].length > 0)
    .map((g) => ({ group: g, sessions: groups[g] }));
}

/**
 * Generate a random session ID (no external dependency needed).
 */
export function newSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
