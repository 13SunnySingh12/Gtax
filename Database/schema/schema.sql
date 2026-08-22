-- ============================================================================
-- G-TAX — Full database schema (Supabase Postgres)
-- Mirrors TRD §4 ER diagram exactly + adds pgvector, RLS, indexes, triggers.
-- Run this once against a fresh Supabase project (SQL editor or `psql`).
-- Migrations in ../migrations/ apply the same objects incrementally.
-- ============================================================================

-- ---- Extensions -----------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "vector";      -- pgvector for RAG embeddings

-- ============================================================================
-- profiles : 1:1 extension of auth.users (TRD §4: profiles.id = auth.users.id)
-- ============================================================================
create table if not exists public.profiles (
    id                 uuid primary key references auth.users (id) on delete cascade,
    full_name          text,
    gig_type           text,
    onboarded          boolean     not null default false,
    terms_accepted_at  timestamptz,
    created_at         timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, full_name, gig_type)
    values (new.id,
            coalesce(new.raw_user_meta_data ->> 'full_name', ''),
            coalesce(new.raw_user_meta_data ->> 'gig_type', ''))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- It's a trigger, not a public RPC — keep it off the REST surface.
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- ============================================================================
-- incomes
-- ============================================================================
create table if not exists public.incomes (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.profiles (id) on delete cascade,
    source      text not null,
    amount      numeric(14, 2) not null check (amount >= 0),
    income_date date not null,
    notes       text,
    created_at  timestamptz not null default now()
);
create index if not exists idx_incomes_user_id  on public.incomes (user_id);
create index if not exists idx_incomes_date      on public.incomes (user_id, income_date);

-- ============================================================================
-- expenses
-- ============================================================================
create table if not exists public.expenses (
    id                     uuid primary key default gen_random_uuid(),
    user_id                uuid not null references public.profiles (id) on delete cascade,
    amount                 numeric(14, 2) not null check (amount >= 0),
    vendor                 text,
    expense_date           date not null,
    category               text,
    ai_suggested_category  text,
    is_deductible          boolean not null default false,
    deduction_reason       text,
    created_at             timestamptz not null default now()
);
create index if not exists idx_expenses_user_id     on public.expenses (user_id);
create index if not exists idx_expenses_date         on public.expenses (user_id, expense_date);
create index if not exists idx_expenses_deductible   on public.expenses (user_id, is_deductible);

-- ============================================================================
-- receipts : one optional receipt per expense (EXPENSES ||--o| RECEIPTS)
-- ============================================================================
create table if not exists public.receipts (
    id            uuid primary key default gen_random_uuid(),
    expense_id    uuid unique references public.expenses (id) on delete cascade,
    user_id       uuid not null references public.profiles (id) on delete cascade,
    file_url      text not null,
    ocr_raw_text  text,
    ocr_status    text not null default 'pending'
                  check (ocr_status in ('pending', 'processing', 'done', 'failed')),
    created_at    timestamptz not null default now()
);
create index if not exists idx_receipts_expense_id on public.receipts (expense_id);
create index if not exists idx_receipts_user_id     on public.receipts (user_id);

-- ============================================================================
-- tax_rule_documents : pre-embedded RAG corpus (TRD §7). Not user-owned.
-- Vector dim 768 = Gemini text-embedding-004 (keep EMBEDDING_DIM in sync).
-- ============================================================================
create table if not exists public.tax_rule_documents (
    id          uuid primary key default gen_random_uuid(),
    title       text not null unique,   -- one row per rule title (idempotent seed/loader)
    content     text not null,
    source      text,
    embedding   vector(768),
    created_at  timestamptz not null default now()
);

-- Approximate nearest-neighbour index for cosine similarity search.
create index if not exists idx_tax_rule_documents_embedding
    on public.tax_rule_documents
    using ivfflat (embedding vector_cosine_ops)
    with (lists = 100);

-- RPC used by the AI service for similarity search (keeps SQL out of app code).
create or replace function public.match_tax_rule_documents(
    query_embedding vector(768),
    match_count     int default 4
)
returns table (
    id         uuid,
    title      text,
    content    text,
    source     text,
    similarity float
)
language sql stable
set search_path = public
as $$
    select d.id, d.title, d.content, d.source,
           1 - (d.embedding <=> query_embedding) as similarity
    from public.tax_rule_documents d
    where d.embedding is not null
    order by d.embedding <=> query_embedding
    limit match_count;
$$;

-- ============================================================================
-- tax_deadlines : static seed data (TRD §4). Not user-owned.
-- ============================================================================
create table if not exists public.tax_deadlines (
    id             uuid primary key default gen_random_uuid(),
    title          text not null,
    description    text,
    due_date       date not null,
    applicable_to  text
);
create index if not exists idx_tax_deadlines_due_date on public.tax_deadlines (due_date);

-- ============================================================================
-- chat_messages
-- ============================================================================
create table if not exists public.chat_messages (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references public.profiles (id) on delete cascade,
    question    text not null,
    answer      text,
    created_at  timestamptz not null default now()
);
create index if not exists idx_chat_messages_user_id on public.chat_messages (user_id, created_at);

-- ============================================================================
-- Row Level Security (TRD §10 — defence in depth, second layer after Spring Boot)
-- Every user-owned table: a row is visible/writable only when user_id = auth.uid().
-- profiles: id = auth.uid(). Reference tables: readable by any authenticated user.
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.incomes            enable row level security;
alter table public.expenses           enable row level security;
alter table public.receipts           enable row level security;
alter table public.chat_messages      enable row level security;
alter table public.tax_rule_documents enable row level security;
alter table public.tax_deadlines      enable row level security;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
    for select using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- generic owner policy applied to each user-owned table
do $$
declare t text;
begin
    foreach t in array array['incomes', 'expenses', 'receipts', 'chat_messages']
    loop
        execute format('drop policy if exists %I_owner on public.%I;', t, t);
        execute format(
            'create policy %I_owner on public.%I
               for all using (auth.uid() = user_id)
               with check (auth.uid() = user_id);', t, t);
    end loop;
end $$;

-- reference tables: any authenticated user may read; no client writes.
drop policy if exists tax_rules_read on public.tax_rule_documents;
create policy tax_rules_read on public.tax_rule_documents
    for select using (auth.role() = 'authenticated');
drop policy if exists tax_deadlines_read on public.tax_deadlines;
create policy tax_deadlines_read on public.tax_deadlines
    for select using (auth.role() = 'authenticated');

-- ============================================================================
-- Storage bucket for receipts (run once; safe to re-run).
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Users may only touch their own receipt files (path prefixed with their uid).
drop policy if exists receipts_storage_owner on storage.objects;
create policy receipts_storage_owner on storage.objects
    for all to authenticated
    using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
    with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
