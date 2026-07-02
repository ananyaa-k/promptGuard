-- Migration to create scans and scan_results tables for PromptGuard scan persistence

CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_prompt TEXT NOT NULL,
    risk_score INT NOT NULL DEFAULT 0,
    total_attacks INT NOT NULL DEFAULT 0,
    succeeded_attacks INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scan_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES public.scans(id) ON DELETE CASCADE,
    attack_id TEXT NOT NULL,
    category TEXT NOT NULL,
    payload TEXT NOT NULL,
    severity TEXT NOT NULL,
    raw_output TEXT,
    provider TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    confidence REAL NOT NULL DEFAULT 0.0,
    reason TEXT,
    severity_override TEXT DEFAULT 'none',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_results ENABLE ROW LEVEL SECURITY;

-- Enable public read/write policies for local development
CREATE POLICY "Enable read access for all users" ON public.scans
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.scans
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON public.scan_results
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.scan_results
    FOR INSERT WITH CHECK (true);
