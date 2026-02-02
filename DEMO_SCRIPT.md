# safespace — Demo Script

A script to read aloud while demonstrating the product. Includes product explanation, page walkthroughs, core functionalities, and where the logic lives in the codebase.

---

## Opening (30 seconds)

"**safespace** is a personal AI journal where you chat with an empathetic companion named Mira. You write thoughts, she responds with reflection and follow-ups. All your entries are stored locally in your browser, and you can revisit them anytime or see AI-generated insights about your journaling patterns. Let me walk you through it."

---

## 1. Login Page

**[Show: Login screen]**

"This is the entry point. You enter a username and email—both are validated: username must be at least 3 characters, email must be a valid format. On Sign In, the app creates a user object and saves it to localStorage. There’s no backend auth here—it’s a lightweight demo flow so we can focus on the journaling experience."

**Demo action:** Enter username and email → click Sign In.

**Core logic:** `LoginPage.tsx` — `validateForm()` and `handleSubmit()`; `AuthContext.tsx` — `login()` stores user in state and `localStorage` under `mindspace-user`.

---

## 2. New Entry (Chat Page)

**[Show: Main app with New Entry selected]**

"This is where the journaling happens. The app loads or creates a session. If there’s a saved current session in localStorage, it loads that thread. Otherwise it creates a new session id, fetches Mira’s opening greeting from the backend, and displays it as the first message. Everything is saved under `mindspace-session-{id}` in localStorage."

"When you type and hit Send, your message is added immediately, then the full conversation is sent to our backend. The backend calls Anthropic’s Claude—or a mock AI if no API key is set—and returns Mira’s reply. That reply is appended and saved. The New Entry button starts a fresh session with a new greeting."

**Demo action:** Type a short message (e.g. "I had a busy week") → Send → wait for reply. Optionally click New Entry to start a second session.

**Core logic:**
- `ChatPage.tsx` — `loadSession()` in useEffect (reads `mindspace-current-session` and `mindspace-session-*`); `saveMessages()` (writes to localStorage); `handleSend()` (adds user msg, calls `apiService.sendMessage()`, appends reply).
- `services/api.ts` — `getOpeningPrompt()` → GET `/api/opening-prompt`; `sendMessage()` → POST `/api/chat`.
- Backend: `api/chat.py` — `/chat` and `/opening-prompt`; `core/anthropic_service.py` or `core/mock_ai_service.py` for AI replies.

---

## 3. My Entries

**[Click: My Entries in sidebar]**

"This page lists all your journal sessions. It scans localStorage for every key starting with `mindspace-session-`, parses the messages, and builds a list. Each card shows a title—derived from the first user message, truncated to 50 characters—plus the creation date and message count. Entries are sorted by most recent first."

"View Entry sets that session as the current one and reloads the app, so when you land on Chat it loads that thread. Delete removes the session from localStorage and from the list."

**Demo action:** Click View Entry on one session → confirm Chat shows that thread → go back to My Entries → Delete one entry.

**Core logic:** `EntriesPage.tsx` — `loadSessions()` in useEffect (iterates localStorage, builds `JournalSession` objects); `viewSession()` (sets `mindspace-current-session`, reloads); `deleteSession()` (removes key from localStorage).

---

## 4. Insights

**[Click: Insights in sidebar]**

"Insights combines local computation and AI. First, it loads all sessions from localStorage and computes basic stats—total entries, total messages, active days, most active weekday, longest conversation. Those numbers appear in the three stat cards."

"Then it sends a summary to the backend—dates, message counts, and sample user messages—and calls our unified insights endpoint. Claude analyzes the content and returns a central theme, related words for the word cloud, core themes with sentiment, connections between themes, a narrative summary, a hidden pattern, and a reflection question. All of that is rendered in the dashboard."

**Demo action:** Scroll through stats cards, word cloud, theme constellation, AI narrative, hidden pattern, and reflection question.

**Core logic:**
- `InsightsPage.tsx` — `loadDataAndGenerateInsights()` (loads sessions, computes stats, builds `entries` payload, calls `apiService.generateUnifiedInsights()`).
- `services/api.ts` — `generateUnifiedInsights()` → POST `/api/insights/unified`.
- `WordCloud.tsx` — renders central theme and orbiting words from `related_words`.
- Backend: `api/insights.py` — `/insights/unified` uses Claude to generate the structured insight response.

---

## 5. Theme & Logout

**[Show: Sidebar]**

"The theme toggle switches between light and dark. The choice is stored in localStorage as `mindspace-theme` and applied to the document root. Logout clears the user from AuthContext and localStorage and returns you to the login screen."

**Demo action:** Toggle theme → Logout.

**Core logic:** `ThemeContext.tsx` — `toggleTheme()`, `useEffect` for applying class and saving to localStorage; `AuthContext.tsx` — `logout()` clears user.

---

## 6. Architecture Summary (optional, if time)

"The app is a React SPA with three main pages—New Entry, My Entries, Insights. All user data lives in localStorage; the backend is used only for AI: the chat endpoint for Mira’s replies and the unified insights endpoint for analyzing your journal. The frontend is in `frontend/src`—pages in `pages/`, API calls in `services/api.ts`, contexts in `context/`. The backend is FastAPI in `backend/app`—routers in `api/`, AI services in `core/`. That’s the full picture."

---

## Quick Demo Flow (5–7 minutes)

| Step | Action |
|------|--------|
| 1 | Login (username + email) |
| 2 | New Entry → send 1–2 messages → see replies |
| 3 | New Entry again (start second session) |
| 4 | My Entries → View one → back → Delete one |
| 5 | Insights → scroll through stats, word cloud, themes, narrative, reflection question |
| 6 | Toggle theme → Logout |

---

## Core Logic Quick Reference

| Feature | File(s) |
|---------|---------|
| Auth (login/logout) | `AuthContext.tsx`, `LoginPage.tsx` |
| Session load/save | `ChatPage.tsx` — `loadSession`, `saveMessages` |
| Chat with AI | `ChatPage.tsx` → `api.ts` → `api/chat.py` → `anthropic_service.py` |
| Entries list | `EntriesPage.tsx` — `loadSessions` |
| View/Delete entry | `EntriesPage.tsx` — `viewSession`, `deleteSession` |
| Stats + AI insights | `InsightsPage.tsx` → `api.ts` → `api/insights.py` |
| Theme | `ThemeContext.tsx` |
| Navigation | `App.tsx` — `currentPage` state, `renderPage()` |
