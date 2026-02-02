# safespace — System Design & Deployments

> Diagrams use Mermaid. GitHub renders Mermaid blocks in markdown; the repo also includes a GitHub Actions workflow to render diagrams to SVG into docs/diagrams/.

## 1. High-level architecture

System overview

```mermaid
flowchart TB
    User["User(Browser)"]
    FE["Frontend SPA-React + TS + Vite"]
    BE["Backend API-FastAPI on Railway"]
    AI["AI Layer-Anthropic Claude or Mock"]

    User -->|HTTP| FE
    FE -->|HTTPS- /api/chat /api/opening-prompt| BE
    BE -->|SDK call / HTTPS| AI
    AI -->|reply| BE
    BE -->|JSON| FE
```

Key properties

- Frontend owns all persistence
- Backend is stateless
- AI is a replaceable implementation detail

---

## 2. Component breakdown

Component responsibilities

```mermaid
flowchart LR
    subgraph Frontend
        Auth[AuthContext]
        Theme[ThemeContext]
        Pages[Pages<br/>Login / Chat / Entries / Insights]
        LS[localStorage]
    end

    subgraph Backend
        API[FastAPI App]
        Routes[Routes: /api/chat, /api/opening-prompt, /health]
    end

    subgraph AI
        Claude[Anthropic Claude]
        Mock[Mock AI]
    end

    Pages --> Auth
    Pages --> Theme
    Pages --> LS

    Pages -->|HTTP| API
    API --> Routes
    Routes --> Claude
    Routes --> Mock
```

---

## 3. Data flow (end-to-end)

### Login flow (no backend)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant LS as localStorage

    U->>FE: Enter username/email
    FE->>LS: Save mindspace-user
    FE->>FE: Update AuthContext
```

Invariant:
No backend authentication, no tokens, no network calls.

### New session (opening prompt)

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend API
    participant AI as AI Layer
    participant LS as localStorage

    FE->>BE: GET /api/opening-prompt
    BE->>AI: Generate greeting (SDK)
    AI-->>BE: Greeting text
    BE-->>FE: { message }
    FE->>LS: Save as safespace-session-{id}
```

### Chat message round-trip

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend API
    participant AI as AI Layer
    participant LS as localStorage

    U->>FE: Send message
    FE->>LS: Append user message (local)
    FE->>BE: POST /api/chat (full history payload)
    BE->>AI: Generate reply (SDK)
    AI-->>BE: Reply
    BE-->>FE: { message, timestamp }
    FE->>LS: Append AI reply
```

Key design choice:
The backend is history-agnostic — it only echoes what the frontend sends.

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
```

API examples (add to README or API reference):

- GET /api/opening-prompt
  - Response 200:
  ```json
  {
    "message": "Hi ��� welcome to your safe space. What would you like to talk about today?",
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

Notes:
- The backend does not persist history; it returns responses based solely on the payload provided.
  
## 5. Scaling & security model

### Scaling characteristics

```mermaid
flowchart LR
    Stateless[Stateless API]
    Horizontal[Horizontal Scaling]
    Bottleneck[AI Latency / Rate Limits]

    Stateless --> Horizontal
    Horizontal --> Bottleneck
```

Notes:
- Scale frontend via CDN/edge.
- Backend scales horizontally, but AI provider rate limits and latency are the main bottleneck.
- Consider caching repeated identical prompts if appropriate and safe.

### Security boundaries

```mermaid
flowchart TB
    FE[Frontend]
    BE[Backend]
    Secret[anthropic_api_key]

    FE -.->|never| Secret
    Secret --> BE
```
