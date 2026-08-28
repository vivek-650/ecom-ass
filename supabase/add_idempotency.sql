-- Run this once against your already-provisioned database to add
-- idempotency support for the checkout endpoint. See supabase/schema.sql
-- for the canonical version (section 7) if you're setting up a fresh DB.
create table idempotency_keys (
  id                uuid primary key default gen_random_uuid(),
  idempotency_key   text not null,
  user_id           uuid not null references profiles (id) on delete cascade,
  method            text not null,
  path              text not null,
  request_hash      text not null,
  status            text not null default 'processing' check (status in ('processing', 'completed')),
  response_status   integer,
  response_body     jsonb,
  created_at        timestamptz not null default now(),
  unique (idempotency_key, user_id, method, path)
);

create index idx_idempotency_lookup on idempotency_keys (idempotency_key, user_id, method, path);

alter table idempotency_keys enable row level security;
-- No policies added on purpose: only the backend's service_role key (which
-- bypasses RLS) ever touches this table.
