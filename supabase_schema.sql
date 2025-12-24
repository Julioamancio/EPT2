-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. QUESTIONS TABLE
create table public.questions (
  id uuid default uuid_generate_v4() primary key,
  number serial, -- Auto-incrementing number for easy ordering
  level text not null check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  section text not null check (section in ('GRAMMAR', 'READING', 'LISTENING', 'USE_OF_ENGLISH')),
  text text not null,
  options jsonb not null default '[]'::jsonb, -- Array of strings
  correct_answer integer not null, -- Index 0-3
  audio_url text,
  sub_questions jsonb, -- For matching questions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. USERS TABLE (Candidates)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  full_name text,
  password text, -- Simple storage for this demo app (hashing recommended for prod)
  level text not null,
  purchase_date timestamp with time zone default timezone('utc'::text, now()),
  exam_completed boolean default false,
  score numeric,
  certificate_code text,
  failure_reason text,
  screenshots jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. EXAM HISTORY
create table public.exam_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  score numeric not null,
  breakdown jsonb, -- { reading: 80, listening: 90, ... }
  answers jsonb, -- Store user answers for review
  passed boolean default false,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SETTINGS TABLE (Singleton)
create table public.settings (
  id integer primary key default 1,
  cert_template_url text,
  next_question_number integer default 1,
  check (id = 1) -- Ensure only one row exists
);

insert into public.settings (id, cert_template_url) 
values (1, 'https://raw.githubusercontent.com/Julioamancio/certificado/main/static/img/certificado_modelo.png')
on conflict do nothing;

-- SECURITY POLICIES (RLS)
alter table public.questions enable row level security;
alter table public.users enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.settings enable row level security;

-- Public Read Access (Anyone can read questions to take the exam)
create policy "Public questions read" on public.questions for select using (true);

-- Admin Full Access (In a real app, you would restrict this to admin users)
-- For this demo, we allow full access via the client if they have the key, 
-- BUT ideally you should use Supabase Auth for admins.
create policy "Public questions insert" on public.questions for insert with check (true);
create policy "Public questions update" on public.questions for update using (true);
create policy "Public questions delete" on public.questions for delete using (true);

create policy "Public users all" on public.users for all using (true);
create policy "Public attempts all" on public.exam_attempts for all using (true);
create policy "Public settings all" on public.settings for all using (true);
