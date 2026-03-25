-- supabase/migrations/001_create_donations.sql
-- Run in Supabase SQL Editor or via: supabase db push

create table if not exists public.donations (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz default now(),
  name              text not null,
  email             text not null,
  amount_usd        numeric(10,2) not null,
  payment_intent_id text unique not null,
  status            text not null default 'pending',
  currency          text not null default 'usd'
);

-- Index for quick lookups by email or payment intent
create index donations_email_idx on public.donations (email);
create index donations_payment_intent_idx on public.donations (payment_intent_id);

-- Row Level Security: only service role can read/write (Edge Function uses service role)
alter table public.donations enable row level security;

-- Allow the Edge Function (service_role) to insert
create policy "service_role_insert" on public.donations
  for insert to service_role with check (true);

-- Allow the Edge Function (service_role) to select
create policy "service_role_select" on public.donations
  for select to service_role using (true);

-- Optional: allow authenticated users to see their own donations
create policy "users_see_own" on public.donations
  for select to authenticated
  using (email = auth.jwt() ->> 'email');
