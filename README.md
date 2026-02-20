# **safespace** 🌱💜 

**safespace** is a personal AI journal companion where you can reflect in conversation with a supportive listener.  
It helps you capture thoughts, revisit past entries, and see gentle insights about your journaling journey—all in one calm place.

---

> *"Every thought is a seed. Give it a little light, a little care, and watch what grows."* 🌱

---

- **Website** — https://panw-hackathon-journal-casestudy.vercel.app/
- **Demo** — https://www.loom.com/share/e242d41c39e847489db86699d2ede06b

## Features

- 🤖 **AI Chat Companion** — Journal through natural conversation with **Mira** (Claude Sonnet)
- 💭 **Smart Insights** — AI analyzes your entries to find patterns, themes, and hidden connections
- 🌸 **Word Cloud** — See your central theme with related words orbiting around it
- 🌟 **Theme Constellation** — Discover core themes with sentiment, frequency, and connections
- 🌓 **Dark Mode** — Toggle between light and dark themes
- 💾 **Hybrid Storage** — Supabase (optional) → PostgreSQL via API → localStorage fallback
- 🔐 **Auth Options** — Demo login (username/email) or Supabase sign-in/sign-up when configured
- 📥 **Migration** — Automatically migrates localStorage entries to backend or Supabase on first use

## 📸 Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Chat Interface
![Chat Interface](screenshots/chatbot.png)

### Journal Entries
![Entries List](screenshots/entries.png)

### AI Insights Dashboard
![Insights Dashboard](screenshots/dashboard.png)

### Wordcloud
![Theme Constellation](screenshots/wordcloud.png)

### theme constellation
![Theme Constellation](screenshots/theme-constellation.png)

### ai-powered
![AI Powered Analysis of Entries](screenshots/analysis.png)


## What It Does

- **New Entry** — Start a chat-style journal session with **Mira**, an empathetic AI companion. She greets you, asks follow-ups, and keeps the tone warm and non-judgmental. Each conversation is saved as a journal entry.
- **My Entries** — Browse all past journal sessions. Open any entry to continue or reread, or remove entries you no longer need. Entries are listed by date with a short preview.
- **Insights** — See a dashboard of your journaling habits: total reflections, active days, longest conversation, and most active day. **Word Cloud** shows your central theme with related words orbiting around it (driven by Claude’s analysis of your entries). **Theme Constellation** displays core themes with sentiment, frequency, and connections between themes. You also get an AI narrative, a hidden pattern, and a reflection question to keep the practice going.
- **Theme & identity** — Toggle between light and dark mode. Sign in with a username and email (stored locally) so the app can greet you and keep your data tied to your session.

---

## Design Overview

The app is built to be **simple, fast, and easy to understand**. The frontend focuses on a small set of screens and clear actions; the backend exposes a thin API with optional database persistence; and the AI layer is isolated so you can switch between Claude and a mock without changing the rest of the app.

**Design choices**

- **Conversations that flow** — Journal entries are chat threads with **Mira**, so writing feels like talking to someone who listens and reflects back.
- **Storage chain** — Journal sessions use: (1) **Supabase** when configured, (2) **PostgreSQL** via the backend sessions API (SQLite in dev), or (3) **localStorage** as fallback. Auth is demo (client-side) or Supabase when configured.
- **Single AI persona** — One companion (Mira) with a fixed, supportive personality keeps the experience consistent and safe (no medical advice, gentle signposting if someone is in distress).
- **Context-aware chat** — Older messages are summarized via `/api/summarize` so the AI keeps context without exceeding token limits; recent messages (up to 30) are sent as-is.
- **Unified insights** — The Insights page sends a summary of entries to Claude and receives in one call: **Word Cloud** (central theme + related words), **Theme Constellation** (core themes + connections), plus narrative, hidden pattern, and reflection question.

---

## Tech Stack

| Layer   | Choices |
|--------|---------|
| **Frontend** | React 19, TypeScript, Vite 7. Tailwind CSS 4, Radix Slot, Lucide icons. Supabase client (optional). React context for auth and theme. React Router for navigation. |
| **Backend**  | FastAPI with CORS, rate limiting (slowapi), body limit middleware. SQLAlchemy 2.0 async (SQLite dev, PostgreSQL prod). Pydantic for request/response models. |
| **AI**       | Anthropic Claude Sonnet via the official SDK, with a dedicated system prompt for Mira. Optional **mock AI** returns predefined empathetic replies when `USE_MOCK_AI=True`. |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root message |
| GET | `/health` | Health check |
| GET | `/api/opening-prompt` | Initial greeting when starting a new entry |
| POST | `/api/chat` | Chat completion; returns Mira's reply and timestamp |
| POST | `/api/summarize` | Summarizes older messages for context compression |
| POST | `/api/insights/unified` | Word cloud + constellation + narrative + hidden pattern + reflection question |
| GET | `/api/sessions?user_id=` | List sessions for a user |
| POST | `/api/sessions` | Create a new session |
| GET | `/api/sessions/{id}?user_id=` | Get session and messages |
| PUT | `/api/sessions/{id}/messages?user_id=` | Replace messages in a session |
| DELETE | `/api/sessions/{id}?user_id=` | Delete a session |
| POST | `/api/migrate` | Import sessions from frontend (e.g. localStorage) into the database |

---

## Running Tests

### Backend (pytest)
```bash
cd backend
pip install pytest pytest-asyncio  # if not already installed
python -m pytest tests/ -v
```

### Frontend (Vitest)
```bash
cd frontend
npm install
npm run test:run
```

Tests cover:
- **Backend**: API endpoints (chat, opening prompt, insights, sessions), Pydantic models, mock AI service, config, and Anthropic service behavior
- **Frontend**: Utils, API service, storage, migration, Auth/Theme contexts, Login/Chat/Entries/Insights pages, UI components (Button, Input, Card, WordCloud, ThemeToggle)

---

## Configuration

### Backend (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | `mock-key` | Anthropic API key for live AI; use mock when not set |
| `USE_MOCK_AI` | `True` | Use mock AI instead of Anthropic |
| `DATABASE_URL` | `sqlite+aiosqlite:///./mindspace.db` | SQLAlchemy URL (PostgreSQL for production) |
| `PORT` | `8000` | Server port |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_SUPABASE_URL` | Optional Supabase URL for auth/storage |
| `VITE_SUPABASE_ANON_KEY` | Optional Supabase anon key |

---

## Security

- **API key** — `ANTHROPIC_API_KEY` stays in the backend; never exposed to the frontend.
- **Rate limiting** — Per-IP rate limits (e.g. 60/min) via slowapi.
- **Body limit** — Request body size capped (e.g. 1MB) to prevent abuse.
- **CORS** — Configured for frontend origins; credentials allowed.

---

## Future Enhancements

- **Auth** — Supabase auth is optional; expand to email magic link or OAuth for production.
- **Richer insights** — Sentiment over time, mood tags, weekly summaries.
- **Export** — Download entries as PDF or Markdown for backup.
- **Safety** — Stronger content guidelines, audit logging for production.

---

## Summary

**safespace** is a minimal, feature-driven journaling app: chat with an AI companion, keep all entries in one place, and get light insights and encouragement—all wrapped in a calm, readable UI with theme support and a clear path from “new entry” to “insights.” The stack is chosen for clarity and maintainability, and the AI is designed to stay supportive and bounded. 🌱



