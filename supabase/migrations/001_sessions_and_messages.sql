-- Sessions table: one per journal entry, owned by auth user
-- id is text to support migration from localStorage (custom ids)
create table if not exists public.sessions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Entry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages table: chat messages within a session
-- id is text to support migration from localStorage (custom ids)
create table if not exists public.messages (
  id text primary key,
  session_id text not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  timestamp timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on public.sessions(user_id);
create index if not exists idx_messages_session_id on public.messages(session_id);

-- RLS: users can only access their own sessions and messages
alter table public.sessions enable row level security;
alter table public.messages enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

create policy "Users can view messages of own sessions"
  on public.messages for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into own sessions"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update messages in own sessions"
  on public.messages for update
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in own sessions"
  on public.messages for delete
  using (
    exists (
      select 1 from public.sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
