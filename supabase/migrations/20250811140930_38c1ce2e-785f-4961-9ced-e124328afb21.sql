-- Create photo_repair_reports table for logging broken/missing photos
create table if not exists public.photo_repair_reports (
  id uuid primary key default gen_random_uuid(),
  car_park_id uuid null,
  space_id uuid null,
  failing_url text not null,
  error_type text not null default 'broken_url',
  user_agent text null,
  page_path text null,
  created_at timestamptz not null default now()
);

alter table public.photo_repair_reports enable row level security;

-- Allow anyone (even anonymous) to insert logs; no select for public
create policy if not exists "Anyone can insert photo repair logs"
  on public.photo_repair_reports
  for insert
  to public
  with check (true);

create policy if not exists "Admins can view photo repair logs"
  on public.photo_repair_reports
  for select
  using (is_admin(auth.uid()));

-- Optional: admins can delete old logs
create policy if not exists "Admins can delete photo repair logs"
  on public.photo_repair_reports
  for delete
  using (is_admin(auth.uid()));