-- Chat history table for AI chatbot
create table if not exists chat_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  role        text check (role in ('user', 'assistant')) not null,
  content     text not null,
  created_at  timestamptz default now()
);

-- Index for fast per-user history retrieval
create index if not exists chat_history_user_id_idx on chat_history(user_id, created_at desc);

-- Row Level Security: users can only see their own messages
alter table chat_history enable row level security;

create policy "Users can read own chat history"
  on chat_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own chat history"
  on chat_history for insert
  with check (auth.uid() = user_id);

-- Service role can insert on behalf of users (used by API route)
create policy "Service role can insert chat history"
  on chat_history for insert
  to service_role
  with check (true);
