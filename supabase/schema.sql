-- Out Take Studio data store for Supabase (Postgres).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- "records" holds one row per order / product / enquiry etc. (the whole record as JSON in `data`),
-- "settings" holds the single-value items (site settings, payment settings, categories...).
-- Row Level Security is switched on with no policies, so only the server (service-role key) can read or write.

create table if not exists public.records (
  collection text not null,
  id         text not null,
  position   integer not null default 0,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (collection, id)
);
create index if not exists records_collection_position_idx on public.records (collection, position);

create table if not exists public.settings (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.records enable row level security;
alter table public.settings enable row level security;

-- File storage: public bucket for catalogue images, private bucket for customers' payment slips.
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('payment-slips', 'payment-slips', false)
  on conflict (id) do nothing;
