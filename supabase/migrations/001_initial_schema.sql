create table if not exists scans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  system_prompt_preview text,
  total_attacks int,
  attacks_succeeded int,
  risk_score int,
  model_used text
);

create table if not exists scan_results (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references scans(id) on delete cascade,
  attack_id text,
  category text,
  severity text,
  payload text,
  raw_output text,
  success boolean,
  confidence float,
  reason text
);

create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);