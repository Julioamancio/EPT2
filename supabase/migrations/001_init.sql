-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- QUESTIONS
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  number integer,
  level text not null check (level in ('A1','A2','B1','B2','C1','C2')),
  section text not null check (section in ('GRAMMAR','READING','LISTENING','USE_OF_ENGLISH')),
  text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer integer not null,
  audio_url text,
  sub_questions jsonb,
  created_at timestamptz default now() not null
);

-- USERS
create table if not exists public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  full_name text,
  password text,
  level text not null,
  purchase_date timestamptz default now(),
  exam_completed boolean default false,
  score numeric,
  certificate_code text,
  failure_reason text,
  screenshots jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null
);

-- EXAM ATTEMPTS
create table if not exists public.exam_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade,
  score numeric not null,
  breakdown jsonb,
  answers jsonb,
  passed boolean default false,
  completed_at timestamptz default now() not null
);

-- SETTINGS
create table if not exists public.settings (
  id integer primary key default 1,
  cert_template_url text,
  next_question_number integer default 1,
  check (id = 1)
);

insert into public.settings (id, cert_template_url)
values (1, 'https://raw.githubusercontent.com/Julioamancio/certificado/main/static/img/certificado_modelo.png')
on conflict (id) do nothing;

-- RLS
alter table public.questions enable row level security;
alter table public.users enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.settings enable row level security;

-- Policies (demo permissive)
create policy "questions_select" on public.questions for select using (true);
create policy "questions_insert" on public.questions for insert with check (true);
create policy "questions_update" on public.questions for update using (true);
create policy "questions_delete" on public.questions for delete using (true);

create policy "users_all" on public.users for all using (true);
create policy "attempts_all" on public.exam_attempts for all using (true);
create policy "settings_all" on public.settings for all using (true);
