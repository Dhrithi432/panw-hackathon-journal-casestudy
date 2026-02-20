# safespace — System Design & Deployments

> Diagrams use Mermaid. GitHub renders Mermaid blocks in markdown; the repo also includes a GitHub Actions workflow to render diagrams to SVG into docs/diagrams/.

## 1. High-level architecture

System overview

```mermaid
flowchart TB
    User["User (Browser)"]
    FE["Frontend SPA — React 19 + TS + Vite"]
    BE["Backend API — FastAPI"]
    DB[(PostgreSQL / SQLite)]
    AI["AI Layer — Anthropic Claude or Mock"]
    Supa["Supabase (optional)"]

    User -->|HTTP| FE
    FE -->|/api/chat, /api/opening-prompt, /api/insights/unified, /api/sessions, /api/migrate, /api/summarize| BE
    FE -.->|optional auth & storage| Supa
    BE -->|SDK call| AI
    BE -->|persist sessions & messages| DB
    AI -->|reply| BE
    BE -->|JSON| FE
```

Key properties

- **Hybrid storage** — Supabase (optional) → PostgreSQL via API → localStorage fallback
- Backend persists sessions and messages when using the sessions API
- AI is a replaceable implementation detail (Claude or mock)

---

## 2. Component breakdown

Component responsibilities

```mermaid
flowchart LR
    subgraph Frontend
        Auth[AuthContext]
        Theme[ThemeContext]
        Pages[Pages<br/>Login / Chat / Entries / Insights]
        Storage[Storage Chain]
        LS[localStorage]
        SupaClient[Supabase Client]
    end

    subgraph Backend
        API[FastAPI App]
        Routes[Routes]
        DB[(SQLite / PostgreSQL)]
    end

    subgraph AI
        Claude[Anthropic Claude]
        Mock[Mock AI]
    end

    Pages --> Auth
    Pages --> Theme
    Storage --> SupaClient
    Storage --> Routes
    Storage --> LS

    Pages -->|HTTP| API
    API --> Routes
    Routes --> Claude
    Routes --> Mock
    Routes --> DB
```

Storage chain (order): Supabase (if configured) → Sessions API (PostgreSQL) → localStorage

---

## 3. Data flow (end-to-end)

### Login flow

**Demo mode** (no Supabase):

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant LS as localStorage

    U->>FE: Enter username/email
    FE->>LS: Save mindspace-user
    FE->>FE: Update AuthContext
```

**Supabase mode** (when configured): Sign in / sign up via Supabase; AuthContext updates with session.

### New session (opening prompt)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant AI as AI Layer
    participant Storage as Storage (Supabase/API/LS)

    FE->>BE: GET /api/opening-prompt
    BE->>AI: Generate greeting (SDK)
    AI-->>BE: Greeting text
    BE-->>FE: { message }
    FE->>Storage: Save session (POST /api/sessions or LS)
```

### Chat message round-trip

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend API
    participant AI as AI Layer
    participant Storage as Storage

    U->>FE: Send message
    FE->>Storage: Append user message
    FE->>BE: POST /api/chat (history + optional context_summary from /api/summarize)
    BE->>AI: Generate reply (SDK)
    AI-->>BE: Reply
    BE-->>FE: { message, timestamp }
    FE->>Storage: Append AI reply
```

Key design choices:
- Backend receives full history from frontend (history-agnostic).
- Older messages are summarized via `/api/summarize`; recent messages (up to 30) sent as-is.

---

## 4. API surface

API contract map

```mermaid
flowchart LR
    FE[Frontend]
    BE[Backend API]

    FE -->|GET /| BE
    FE -->|GET /health| BE
    FE -->|GET /api/opening-prompt| BE
    FE -->|POST /api/chat| BE
    FE -->|POST /api/summarize| BE
    FE -->|POST /api/insights/unified| BE
    FE -->|GET /api/sessions| BE
    FE -->|POST /api/sessions| BE
    FE -->|GET /api/sessions/{id}| BE
    FE -->|PUT /api/sessions/{id}/messages| BE
    FE -->|DELETE /api/sessions/{id}| BE
    FE -->|POST /api/migrate| BE
```

API examples (add to README or API reference):

- GET /api/opening-prompt
  - Response 200:
  ```json
  {
    "message": "Hi — welcome to your safe space. What would you like to talk about today?",
    "session_hint": "suggested-session-title"
  }
  ```

- POST /api/chat
  - Request:
  ```json
  {
    "session_id": "optional-session-id",
    "history": [
      {"role": "user", "text": "Hello", "ts": 1670000000},
      {"role": "assistant", "text": "Hi there!", "ts": 1670000001}
    ]
  }
  ```
  - Response 200:
  ```json
  {
    "message": "Thanks for sharing — here's a supportive reply...",
    "timestamp": 1670000002
  }
  ```

---

## 4.1 Storage & migration

### Storage chain

```mermaid
flowchart LR
    FE[Frontend]
    S1[Supabase]
    S2[Sessions API]
    S3[localStorage]

    FE -->|1. if configured| S1
    FE -->|2. else| S2
    FE -->|3. fallback| S3
```

localStorage keys (fallback): `mindspace-user`, `mindspace-session-{id}`, `mindspace-current-session`, `mindspace-theme`, `mindspace-migrated`

### Migration flow

On first auth, the frontend detects `mindspace-session-*` in localStorage and migrates to Supabase or `POST /api/migrate`. After migration, `mindspace-migrated` is set and local sessions may be cleared.

---

## 5. Scaling & security model

### Scaling characteristics

```mermaid
flowchart LR
    API[API + DB]
    Horizontal[Horizontal Scaling]
    Bottleneck[AI Latency / Rate Limits]

    API --> Horizontal
    Horizontal --> Bottleneck
```

Notes:
- Scale frontend via CDN/edge.
- Backend stores sessions in PostgreSQL (or SQLite in dev); sessions API enables sync across devices.
- AI provider rate limits and latency remain the main bottleneck.

### Security boundaries

```mermaid
flowchart TB
    FE[Frontend]
    BE[Backend]
    Secret[ANTHROPIC_API_KEY]

    FE -.->|never| Secret
    Secret --> BE
```

Security measures:
- **API key** — Only in backend env; never sent to frontend.
- **Rate limiting** — Per-IP limits (e.g. 60/min) via slowapi.
- **Body limit** — Request body size capped (e.g. 1MB) before CORS.
