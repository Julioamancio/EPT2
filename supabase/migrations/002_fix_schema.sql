-- Fix Schema to match frontend CamelCase properties
-- We use CASCADE to handle dependencies like exam_attempts from previous migrations

DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.exam_attempts CASCADE; -- Drop legacy table

-- 1. QUESTIONS TABLE
CREATE TABLE public.questions (
    id text PRIMARY KEY,
    number integer,
    level text,
    section text,
    text text,
    "audioUrl" text,
    options text, -- JSON string as sent by storageService
    "correctAnswer" integer,
    sub_questions text, -- Mapped manually in storageService
    "subQuestions" jsonb, -- Included in ...q spread
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

-- 2. USERS TABLE
CREATE TABLE public.users (
    id text PRIMARY KEY,
    email text,
    "fullName" text,
    password text,
    cpf text,
    "purchasedLevel" text,
    "examCompleted" boolean,
    score integer,
    "rawScore" integer,
    "totalQuestions" integer,
    "failureReason" text,
    "certificateCode" text,
    "lastExamDate" bigint,
    "purchaseDate" bigint,
    screenshots text[],
    "examHistory" jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- 3. SETTINGS TABLE
CREATE TABLE public.settings (
    id integer PRIMARY KEY DEFAULT 1,
    "certTemplateUrl" text,
    "nextQuestionNumber" integer,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
