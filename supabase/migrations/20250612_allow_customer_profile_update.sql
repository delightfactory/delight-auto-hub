-- Migration: Allow authenticated users to manage their own customer record

-- Enable RLS on customers table
alter table public.customers
  enable row level security;

-- Policy: allow users to select their own profile
create policy "Allow authenticated users to select own profile"
  on public.customers
  for select
  to authenticated
  using (id = auth.uid());

-- Policy: allow users to update their own profile
create policy "Allow authenticated users to update own profile"
  on public.customers
  for update
  to authenticated
  using (id = auth.uid());
