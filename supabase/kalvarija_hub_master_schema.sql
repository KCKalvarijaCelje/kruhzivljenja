-- =============================================================================
-- KALVARIJA HUB - CENTRALIZED MULTI-APP SUPABASE MASTER SCHEMA
-- Serves: kalvarija.si (Main), ucenja.kalvarija.si, kruhzivljenja.kalvarija.si,
--         nedelje.kalvarija.si, zivavera.kalvarija.si, admin.kalvarija.si
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- 1. CORE SHARED AUTH, PROFILES & MULTI-APP PERMISSIONS
-- =============================================================================

-- App identifiers
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_name') then
    create type public.app_name as enum (
      'main',
      'kruh',
      'ucenja',
      'nedelje',
      'zivavera',
      'admin'
    );
  end if;
end $$;

-- Role hierarchy
do $$ begin
  if not exists (select 1 from pg_type where typname = 'church_role') then
    create type public.church_role as enum (
      'superadmin',
      'pastor',
      'leader',
      'volunteer',
      'member'
    );
  end if;
end $$;

-- Shared Profiles Table (Linked 1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  bio text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Central User Roles Table (Controls which app a user can access and with what permissions)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app public.app_name not null,
  role public.church_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, app, role)
);

-- Indexes
create index if not exists idx_user_roles_user_app on public.user_roles(user_id, app);

-- Automatic Profile Creation Trigger on Sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  -- Assign default 'member' role to the main app
  insert into public.user_roles (user_id, app, role)
  values (new.id, 'main', 'member')
  on conflict (user_id, app, role) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Attach Trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Security Helper Functions
create or replace function public.has_app_role(_user_id uuid, _app public.app_name, _role public.church_role)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and (
        (app = _app and role = _role) or
        (app = 'admin' and role in ('superadmin', 'pastor')) or
        (role = 'superadmin')
      )
  );
end;
$$ language plpgsql security definer;

create or replace function public.is_admin(_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('superadmin', 'pastor')
  );
end;
$$ language plpgsql security definer;

-- Enable RLS on core tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Profiles RLS Policies
create policy "Public profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- User Roles RLS Policies
create policy "Users can view their own roles"
  on public.user_roles for select
  to authenticated using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Only admins can manage roles"
  on public.user_roles for all
  to authenticated using (public.is_admin(auth.uid()));

-- =============================================================================
-- 2. UČENJA (Teachings & Sermons Archive)
-- =============================================================================

create table if not exists public.ucenja_teachers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text unique not null,
  short_bio_sl text,
  short_bio_en text,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ucenja_series (
  id uuid primary key default gen_random_uuid(),
  title_sl text not null,
  title_en text,
  slug text unique not null,
  description_sl text,
  description_en text,
  cover_image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.ucenja_teachings (
  id uuid primary key default gen_random_uuid(),
  title_sl text not null,
  title_en text,
  slug text unique not null,
  teaching_date date not null default current_date,
  teacher_id uuid references public.ucenja_teachers(id) on delete set null,
  series_id uuid references public.ucenja_series(id) on delete set null,
  summary_sl text,
  summary_en text,
  notes_sl text,
  notes_en text,
  transcript_sl text,
  transcript_en text,
  bible_book_code text,
  chapter_start int,
  chapter_end int,
  verse_start int,
  verse_end int,
  media_type text not null check (media_type in ('audio', 'video', 'audio_video')),
  youtube_url text,
  youtube_video_id text,
  audio_url text,
  google_drive_file_id text,
  duration_text text,
  thumbnail_url text,
  published boolean not null default true,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ucenja_imports (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('google_drive', 'youtube')),
  title text not null,
  media_url text not null,
  file_id_or_video_id text not null,
  thumbnail_url text,
  duration_text text,
  status text not null default 'unreviewed' check (status in ('unreviewed', 'linked', 'new_teaching_created', 'ignored')),
  confidence_score numeric not null default 0,
  teaching_id uuid references public.ucenja_teachings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ucenja_teachings_date on public.ucenja_teachings(teaching_date desc);
create index if not exists idx_ucenja_teachings_teacher on public.ucenja_teachings(teacher_id);
create index if not exists idx_ucenja_teachings_series on public.ucenja_teachings(series_id);

alter table public.ucenja_teachers enable row level security;
alter table public.ucenja_series enable row level security;
alter table public.ucenja_teachings enable row level security;
alter table public.ucenja_imports enable row level security;

create policy "Teachings are viewable by everyone" on public.ucenja_teachings for select using (published = true or auth.uid() is not null);
create policy "Teachers are viewable by everyone" on public.ucenja_teachers for select using (true);
create policy "Series are viewable by everyone" on public.ucenja_series for select using (true);
create policy "Teachings manageable by ucenja leaders" on public.ucenja_teachings for all to authenticated using (public.has_app_role(auth.uid(), 'ucenja', 'leader') or public.is_admin(auth.uid()));
create policy "Teachers manageable by ucenja leaders" on public.ucenja_teachers for all to authenticated using (public.has_app_role(auth.uid(), 'ucenja', 'leader') or public.is_admin(auth.uid()));
create policy "Imports manageable by ucenja leaders" on public.ucenja_imports for all to authenticated using (public.has_app_role(auth.uid(), 'ucenja', 'leader') or public.is_admin(auth.uid()));

-- =============================================================================
-- 3. NEDELJE (Sunday Services & Ministry Rosters)
-- =============================================================================

create table if not exists public.nedelje_ministries (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  color text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.nedelje_services (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  title text not null default 'Nedeljsko bogoslužje',
  theme text,
  notes text,
  speaker_id uuid references public.profiles(id) on delete set null,
  leader_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nedelje_roster_slots (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.nedelje_services(id) on delete cascade,
  ministry_id uuid not null references public.nedelje_ministries(id) on delete cascade,
  role_name text not null,
  assigned_user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'declined', 'swapped')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nedelje_songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  original_key text,
  bpm int,
  ccli_number text,
  chord_chart_url text,
  youtube_url text,
  lyrics text,
  created_at timestamptz not null default now()
);

create table if not exists public.nedelje_service_songs (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.nedelje_services(id) on delete cascade,
  song_id uuid not null references public.nedelje_songs(id) on delete cascade,
  song_order int not null default 1,
  selected_key text,
  notes text,
  unique (service_id, song_id)
);

alter table public.nedelje_ministries enable row level security;
alter table public.nedelje_services enable row level security;
alter table public.nedelje_roster_slots enable row level security;
alter table public.nedelje_songs enable row level security;
alter table public.nedelje_service_songs enable row level security;

create policy "Ministries viewable by authenticated users" on public.nedelje_ministries for select to authenticated using (true);
create policy "Ministries manageable by leaders" on public.nedelje_ministries for all to authenticated using (public.has_app_role(auth.uid(), 'nedelje', 'leader') or public.is_admin(auth.uid()));
create policy "Services viewable by authenticated users" on public.nedelje_services for select to authenticated using (true);
create policy "Rosters viewable by authenticated users" on public.nedelje_roster_slots for select to authenticated using (true);
create policy "Songs viewable by authenticated users" on public.nedelje_songs for select to authenticated using (true);
create policy "Service songs viewable by authenticated users" on public.nedelje_service_songs for select to authenticated using (true);
create policy "Nedelje manageable by leaders" on public.nedelje_services for all to authenticated using (public.has_app_role(auth.uid(), 'nedelje', 'leader') or public.is_admin(auth.uid()));
create policy "Roster slots manageable by leaders" on public.nedelje_roster_slots for all to authenticated using (public.has_app_role(auth.uid(), 'nedelje', 'leader') or public.is_admin(auth.uid()));
create policy "Songs manageable by leaders" on public.nedelje_songs for all to authenticated using (public.has_app_role(auth.uid(), 'nedelje', 'leader') or public.is_admin(auth.uid()));
create policy "Service songs manageable by leaders" on public.nedelje_service_songs for all to authenticated using (public.has_app_role(auth.uid(), 'nedelje', 'leader') or public.is_admin(auth.uid()));

-- =============================================================================
-- 4. ŽIVA VERA (Coffee Shop, Community Platform & Shifts)
-- =============================================================================

create table if not exists public.zivavera_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_order int not null default 0,
  active boolean not null default true
);

create table if not exists public.zivavera_products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.zivavera_categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null default 0.00,
  image_url text,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.zivavera_shifts (
  id uuid primary key default gen_random_uuid(),
  shift_date date not null,
  start_time time not null,
  end_time time not null,
  title text not null default 'Kavarna izmena',
  volunteer_id uuid references public.profiles(id) on delete set null,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.zivavera_categories enable row level security;
alter table public.zivavera_products enable row level security;
alter table public.zivavera_shifts enable row level security;

create policy "Menu viewable by everyone" on public.zivavera_products for select using (available = true or auth.uid() is not null);
create policy "Categories viewable by everyone" on public.zivavera_categories for select using (true);
create policy "Shifts viewable by authenticated" on public.zivavera_shifts for select to authenticated using (true);
create policy "Categories manageable by leaders" on public.zivavera_categories for all to authenticated using (public.has_app_role(auth.uid(), 'zivavera', 'leader') or public.is_admin(auth.uid()));
create policy "Zivavera manageable by leaders" on public.zivavera_products for all to authenticated using (public.has_app_role(auth.uid(), 'zivavera', 'leader') or public.is_admin(auth.uid()));
create policy "Shifts manageable by leaders" on public.zivavera_shifts for all to authenticated using (public.has_app_role(auth.uid(), 'zivavera', 'leader') or public.is_admin(auth.uid()));

-- =============================================================================
-- 5. MAIN WEBSITE (kalvarija.si Church Portal)
-- =============================================================================

create table if not exists public.main_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  image_url text,
  link_url text,
  pinned boolean not null default false,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.main_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text default 'Kalvarija Maribor',
  cover_image_url text,
  registration_required boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.main_contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  message text not null,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.main_announcements enable row level security;
alter table public.main_events enable row level security;
alter table public.main_contact_submissions enable row level security;

create policy "Public announcements viewable by all" on public.main_announcements for select using (published = true);
create policy "Public events viewable by all" on public.main_events for select using (published = true);
create policy "Public can submit contact form" on public.main_contact_submissions for insert with check (true);
create policy "Admin manages announcements" on public.main_announcements for all to authenticated using (public.is_admin(auth.uid()));
create policy "Admin manages events" on public.main_events for all to authenticated using (public.is_admin(auth.uid()));
create policy "Admin manages contact submissions" on public.main_contact_submissions for all to authenticated using (public.is_admin(auth.uid()));
