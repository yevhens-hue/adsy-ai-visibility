-- ====================================================================
-- ADSY AI VISIBILITY — SUPABASE SCHEMA MIGRATION
-- Generated from Functional Specification: Adsy AI Visibility MVP
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sites table
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    domain TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    description TEXT,
    aliases TEXT[] DEFAULT '{}',
    country TEXT NOT NULL DEFAULT 'US',
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sites_domain ON public.sites(domain);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.sites(user_id);

-- 2. Check Runs (Public & Full)
CREATE TABLE IF NOT EXISTS public.check_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    domain TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    guest_session_id TEXT, -- 24-hour guest cookie/storage key
    mode TEXT NOT NULL CHECK (mode IN ('public', 'full')),
    status TEXT NOT NULL CHECK (status IN ('draft', 'queued', 'running', 'completed', 'partial', 'failed')),
    visibility_score NUMERIC(5,2),
    prompt_coverage NUMERIC(5,2),
    brand_mention_share NUMERIC(5,2),
    data_coverage NUMERIC(5,2) DEFAULT 100.0,
    platforms TEXT[] DEFAULT '{"ChatGPT", "Perplexity", "Claude"}',
    prompts_count INT NOT NULL DEFAULT 5,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_runs_guest_session ON public.check_runs(guest_session_id);
CREATE INDEX IF NOT EXISTS idx_check_runs_domain ON public.check_runs(domain);
CREATE INDEX IF NOT EXISTS idx_check_runs_created_at ON public.check_runs(created_at DESC);

-- 3. Check Prompts
CREATE TABLE IF NOT EXISTS public.check_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.check_runs(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    topic TEXT NOT NULL,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('category', 'comparison', 'alternative', 'problem', 'brand')),
    is_custom BOOLEAN DEFAULT false,
    has_brand_mention BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_prompts_run_id ON public.check_prompts(run_id);

-- 4. AI Answers
CREATE TABLE IF NOT EXISTS public.ai_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_id UUID NOT NULL REFERENCES public.check_prompts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    brand_mentioned BOOLEAN DEFAULT false,
    mentioned_competitors TEXT[] DEFAULT '{}',
    collected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_answers_prompt_id ON public.ai_answers(prompt_id);

-- 5. Sources (Citations matched against catalog)
CREATE TABLE IF NOT EXISTS public.check_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.check_runs(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    frequency INT DEFAULT 1,
    is_in_adsy_catalog BOOLEAN DEFAULT false,
    adsy_publisher_id TEXT,
    adsy_price NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_check_sources_run_id ON public.check_sources(run_id);
CREATE INDEX IF NOT EXISTS idx_check_sources_domain ON public.check_sources(domain);

-- 6. Competitors
CREATE TABLE IF NOT EXISTS public.check_competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.check_runs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    visibility_score NUMERIC(5,2),
    prompt_coverage NUMERIC(5,2),
    mentions_count INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_check_competitors_run_id ON public.check_competitors(run_id);

-- 7. Gaps & Opportunities
CREATE TABLE IF NOT EXISTS public.check_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.check_runs(id) ON DELETE CASCADE,
    topic TEXT NOT NULL,
    gap_type TEXT NOT NULL CHECK (gap_type IN ('missing_with_competitors', 'weak_presence', 'external_sources_opportunity')),
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    rationale TEXT NOT NULL,
    prompts_list TEXT[] DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_check_gaps_run_id ON public.check_gaps(run_id);

-- 8. Placement Briefs for Adsy CP Task handoff
CREATE TABLE IF NOT EXISTS public.placement_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES public.check_runs(id) ON DELETE CASCADE,
    gap_id UUID REFERENCES public.check_gaps(id) ON DELETE SET NULL,
    publisher_id TEXT,
    publisher_domain TEXT,
    brief_data JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_briefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Public / Authenticated Access
-- Public read & insert for guest runs
CREATE POLICY "Public read for own guest session or user" ON public.check_runs
    FOR SELECT USING (true);

CREATE POLICY "Public insert for guest runs" ON public.check_runs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read prompts" ON public.check_prompts FOR SELECT USING (true);
CREATE POLICY "Public insert prompts" ON public.check_prompts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read answers" ON public.ai_answers FOR SELECT USING (true);
CREATE POLICY "Public insert answers" ON public.ai_answers FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read sources" ON public.check_sources FOR SELECT USING (true);
CREATE POLICY "Public insert sources" ON public.check_sources FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read competitors" ON public.check_competitors FOR SELECT USING (true);
CREATE POLICY "Public insert competitors" ON public.check_competitors FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read gaps" ON public.check_gaps FOR SELECT USING (true);
CREATE POLICY "Public insert gaps" ON public.check_gaps FOR INSERT WITH CHECK (true);

CREATE POLICY "Public briefs access" ON public.placement_briefs FOR ALL USING (true);
