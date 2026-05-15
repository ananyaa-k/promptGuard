
create table public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  joined_at timestamp with time zone default now()
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist" on public.waitlist
  for insert with check (true);

create policy "Anyone can count waitlist" on public.waitlist
  for select using (true);
