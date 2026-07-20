-- Waitlist signups: stores the name + email collected by the landing page's
-- waitlist forms (EmailCapture section, EmailCapture ui variant, WaitlistModal).
-- This is a record store alongside the existing ConvertKit integration in
-- netlify/functions/subscribe.ts, which remains the system of record for
-- email delivery/confirmation.
-- `email` is unique on the raw column value rather than lower(email): the
-- Netlify function (netlify/functions/subscribe.ts) and every client form
-- already normalise email to lowercase before it's sent, so a plain unique
-- constraint is sufficient and lets supabase-js upsert() target it via
-- onConflict: 'email' (an expression index on lower(email) can't be used
-- that way — ON CONFLICT needs an arbiter matching the literal column list).
create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.waitlist_signups enable row level security;

-- Intentionally no policies: this table is written to and read from only via
-- the Netlify function's Supabase service role key, which bypasses RLS. The
-- anon/authenticated roles (what a browser client would use) get zero access.
