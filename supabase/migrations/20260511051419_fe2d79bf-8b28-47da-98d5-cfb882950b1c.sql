
-- Roles enum
create type public.app_role as enum ('admin','driver','coordinator','recipient','volunteer');

-- Profiles (linked to auth users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- People (not necessarily auth users; e.g. recipients, external drivers)
create table public.people (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  full_name text not null,
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);

-- People roles (for non-auth people, e.g. recipients)
create table public.people_roles (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  role app_role not null,
  unique (person_id, role)
);

-- Recipient households
create table public.recipient_households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  notes text,
  active boolean not null default true,
  size int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.recipient_households(id) on delete cascade,
  person_id uuid references public.people(id) on delete set null,
  full_name text not null,
  notes text
);

-- Ministry years (Sep 1 - Aug 31)
create table public.ministry_years (
  id uuid primary key default gen_random_uuid(),
  start_year int not null unique, -- e.g. 2025 means 2025-09-01 to 2026-08-31
  label text not null,             -- e.g. "2025/2026"
  created_at timestamptz not null default now()
);

-- Locations
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Recurring schedule rules
create table public.recurring_schedule_rules (
  id uuid primary key default gen_random_uuid(),
  weekday int not null check (weekday between 0 and 6), -- 0=Sun ... 6=Sat
  frequency text not null default 'weekly' check (frequency in ('weekly','biweekly')),
  location_id uuid references public.locations(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Schedule dates (one per date+location)
create table public.schedule_dates (
  id uuid primary key default gen_random_uuid(),
  ministry_year_id uuid not null references public.ministry_years(id) on delete cascade,
  date date not null,
  location_id uuid references public.locations(id) on delete set null,
  driver_id uuid references public.people(id) on delete set null,
  coordinator_id uuid references public.people(id) on delete set null,
  notes text,
  status text not null default 'pending' check (status in ('pending','complete','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, location_id)
);

-- Recipient assignments per date
create table public.date_recipients (
  id uuid primary key default gen_random_uuid(),
  schedule_date_id uuid not null references public.schedule_dates(id) on delete cascade,
  household_id uuid references public.recipient_households(id) on delete set null,
  person_id uuid references public.people(id) on delete set null,
  manual_name text, -- for ad-hoc, not yet registered
  notes text,
  created_at timestamptz not null default now()
);

-- has_role security definer
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select public.has_role(_user_id,'admin') $$;

-- updated_at trigger helper
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger trg_people_updated before update on public.people
for each row execute function public.touch_updated_at();
create trigger trg_recipient_households_updated before update on public.recipient_households
for each row execute function public.touch_updated_at();
create trigger trg_schedule_dates_updated before update on public.schedule_dates
for each row execute function public.touch_updated_at();

-- Auto profile + first-user-becomes-admin trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  user_count int;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email)
  on conflict (id) do nothing;

  select count(*) into user_count from public.user_roles;
  if user_count = 0 then
    insert into public.user_roles(user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Generate a ministry year's schedule from active recurring rules
create or replace function public.generate_ministry_year(_start_year int)
returns uuid language plpgsql security definer set search_path = public
as $$
declare
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  weeks_since int;
begin
  insert into public.ministry_years(start_year, label)
  values (_start_year, _start_year || '/' || (_start_year + 1))
  on conflict (start_year) do update set label = excluded.label
  returning id into my_id;

  for rule in select * from public.recurring_schedule_rules where active loop
    d := start_date;
    -- advance to first matching weekday (extract dow: 0=Sun..6=Sat)
    while extract(dow from d)::int <> rule.weekday loop
      d := d + 1;
    end loop;
    weeks_since := 0;
    while d <= end_date loop
      if rule.frequency = 'weekly' or (rule.frequency = 'biweekly' and weeks_since % 2 = 0) then
        insert into public.schedule_dates(ministry_year_id, date, location_id)
        values (my_id, d, rule.location_id)
        on conflict (date, location_id) do nothing;
      end if;
      d := d + 7;
      weeks_since := weeks_since + 1;
    end loop;
  end loop;
  return my_id;
end;
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.people enable row level security;
alter table public.user_roles enable row level security;
alter table public.people_roles enable row level security;
alter table public.recipient_households enable row level security;
alter table public.household_members enable row level security;
alter table public.ministry_years enable row level security;
alter table public.locations enable row level security;
alter table public.recurring_schedule_rules enable row level security;
alter table public.schedule_dates enable row level security;
alter table public.date_recipients enable row level security;

-- Policies: signed-in users can read everything; admins can write everything
-- profiles: users can read all, edit own; admins can edit any
create policy "profiles_read" on public.profiles for select to authenticated using (true);
create policy "profiles_self_update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "people_read" on public.people for select to authenticated using (true);
create policy "people_admin_write" on public.people for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "user_roles_read" on public.user_roles for select to authenticated using (true);
create policy "user_roles_admin_write" on public.user_roles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "people_roles_read" on public.people_roles for select to authenticated using (true);
create policy "people_roles_admin_write" on public.people_roles for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "households_read" on public.recipient_households for select to authenticated using (true);
create policy "households_admin_write" on public.recipient_households for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "members_read" on public.household_members for select to authenticated using (true);
create policy "members_admin_write" on public.household_members for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "years_read" on public.ministry_years for select to authenticated using (true);
create policy "years_admin_write" on public.ministry_years for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "locations_read" on public.locations for select to authenticated using (true);
create policy "locations_admin_write" on public.locations for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "rules_read" on public.recurring_schedule_rules for select to authenticated using (true);
create policy "rules_admin_write" on public.recurring_schedule_rules for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create policy "schedule_read" on public.schedule_dates for select to authenticated using (true);
create policy "schedule_admin_write" on public.schedule_dates for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "schedule_assigned_update" on public.schedule_dates for update to authenticated
  using (
    public.has_role(auth.uid(),'driver') or public.has_role(auth.uid(),'coordinator')
  ) with check (
    public.has_role(auth.uid(),'driver') or public.has_role(auth.uid(),'coordinator')
  );

create policy "date_recipients_read" on public.date_recipients for select to authenticated using (true);
create policy "date_recipients_admin_write" on public.date_recipients for all to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "date_recipients_coord_write" on public.date_recipients for all to authenticated
  using (public.has_role(auth.uid(),'coordinator'))
  with check (public.has_role(auth.uid(),'coordinator'));

-- Seed: default locations + recurring rules
insert into public.locations(name) values ('Main'), ('Location A'), ('Location B');

insert into public.recurring_schedule_rules(weekday, frequency, location_id)
select 1, 'weekly', id from public.locations where name='Main' limit 1;
insert into public.recurring_schedule_rules(weekday, frequency, location_id)
select 4, 'weekly', id from public.locations where name='Location A' limit 1;
insert into public.recurring_schedule_rules(weekday, frequency, location_id)
select 4, 'weekly', id from public.locations where name='Location B' limit 1;
