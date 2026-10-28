-- Leo's reservation system
-- Run this file in the Supabase SQL Editor before adding the environment variables.

create extension if not exists btree_gist;

create table if not exists public.reservation_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Europe/Berlin',
  capacity integer not null default 36 check (capacity > 0),
  max_guests integer not null default 10 check (max_guests between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.reservation_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_date date not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  guests integer not null check (guests between 1 and 10),
  duration_minutes integer not null check (duration_minutes in (60, 90)),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 120),
  guest_email text not null check (char_length(trim(guest_email)) between 3 and 254),
  guest_phone text not null check (char_length(trim(guest_phone)) between 5 and 40),
  special_requests jsonb not null default '[]'::jsonb,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active_slot tsrange generated always as (
    tsrange(
      reservation_date + start_time,
      reservation_date + end_time,
      '[)'
    )
  ) stored,
  constraint reservations_time_order check (end_time > start_time),
  constraint reservations_no_overlap exclude using gist (active_slot with &&)
    where (status in ('pending', 'confirmed'))
);

create index if not exists reservations_date_idx
  on public.reservations (reservation_date, status);

alter table public.reservation_settings enable row level security;
alter table public.reservations enable row level security;

revoke all on public.reservation_settings from anon, authenticated;
revoke all on public.reservations from anon, authenticated;

create or replace function public.reservation_duration(p_guests integer)
returns integer
language plpgsql
immutable
as $$
begin
  if p_guests between 1 and 2 then return 60; end if;
  if p_guests between 3 and 10 then return 90; end if;
  raise exception using errcode = '22023', message = 'invalid_guests';
end;
$$;

create or replace function public.reservation_window(p_date date)
returns table (opens_at time, closes_at time)
language sql
immutable
as $$
  select
    case when extract(isodow from p_date) between 1 and 5 then time '12:00' else time '17:00' end,
    time '21:00';
$$;

create or replace function public.get_reservation_availability(
  p_date date,
  p_guests integer,
  p_timezone text default 'Europe/Berlin'
)
returns table ("time" text, available boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open time;
  v_close time;
  v_duration integer;
  v_capacity integer;
  v_slot time;
  v_end time;
  v_reserved integer;
  v_today date := (now() at time zone p_timezone)::date;
  v_now time := (now() at time zone p_timezone)::time;
begin
  if p_date is null then raise exception using errcode = '22023', message = 'invalid_date'; end if;
  v_duration := public.reservation_duration(p_guests);
  select opens_at, closes_at into v_open, v_close from public.reservation_window(p_date);
  select capacity into v_capacity from public.reservation_settings where id = true;

  v_slot := v_open;
  while v_slot <= time '19:45' loop
    v_end := v_slot + make_interval(mins => v_duration);
    if v_end <= v_close and (p_date <> v_today or v_slot > v_now) then
      select coalesce(sum(r.guests), 0) into v_reserved
      from public.reservations r
      where r.reservation_date = p_date
        and r.status in ('pending', 'confirmed')
        and r.start_time < v_end
        and r.end_time > v_slot;
      "time" := to_char(v_slot, 'HH24:MI');
      available := (v_reserved + p_guests <= v_capacity);
      return next;
    end if;
    v_slot := v_slot + interval '30 minutes';
  end loop;
end;
$$;

create or replace function public.create_reservation(
  p_date date,
  p_time time without time zone,
  p_guests integer,
  p_name text,
  p_email text,
  p_phone text,
  p_special_requests jsonb default '[]'::jsonb,
  p_timezone text default 'Europe/Berlin'
)
returns table (
  id uuid,
  reservation_date date,
  start_time time,
  end_time time,
  guests integer,
  duration_minutes integer,
  guest_name text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_close time;
  v_open time;
  v_end time;
  v_duration integer;
  v_capacity integer;
  v_reserved integer;
  v_status text := 'confirmed';
  v_today date := (now() at time zone p_timezone)::date;
  v_now time := (now() at time zone p_timezone)::time;
begin
  if p_date is null or p_time is null then
    raise exception using errcode = '22023', message = 'invalid_date_or_time';
  end if;
  if p_guests not between 1 and 10 then
    raise exception using errcode = '22023', message = 'invalid_guests';
  end if;
  if p_name is null or char_length(trim(p_name)) < 2
     or p_email is null or position('@' in p_email) < 2
     or p_phone is null or char_length(trim(p_phone)) < 5 then
    raise exception using errcode = '22023', message = 'invalid_guest_details';
  end if;
  if extract(minute from p_time) not in (0, 30) then
    raise exception using errcode = '22023', message = 'invalid_time_interval';
  end if;

  v_duration := public.reservation_duration(p_guests);
  select opens_at, closes_at into v_open, v_close from public.reservation_window(p_date);
  v_end := p_time + make_interval(mins => v_duration);

  if p_time < v_open or p_time > time '19:45' or v_end > v_close
     or (p_date = v_today and p_time <= v_now) then
    raise exception using errcode = '22023', message = 'outside_hours';
  end if;

  perform pg_advisory_xact_lock(hashtext('leo-reservations:' || p_date::text));

  select capacity into v_capacity
  from public.reservation_settings
  where id = true
  for update;

  select coalesce(sum(r.guests), 0) into v_reserved
  from public.reservations r
  where r.reservation_date = p_date
    and r.status in ('pending', 'confirmed')
    and r.start_time < v_end
    and r.end_time > p_time;

  if v_reserved + p_guests > v_capacity then
    raise exception using errcode = 'P0001', message = 'capacity_exceeded';
  end if;

  return query
  insert into public.reservations (
    reservation_date, start_time, end_time, guests, duration_minutes,
    guest_name, guest_email, guest_phone, special_requests, status
  )
  values (
    p_date, p_time, v_end, p_guests, v_duration,
    trim(p_name), lower(trim(p_email)), trim(p_phone),
    coalesce(p_special_requests, '[]'::jsonb), v_status
  )
  returning reservations.id, reservations.reservation_date, reservations.start_time,
    reservations.end_time, reservations.guests, reservations.duration_minutes,
    reservations.guest_name;
end;
$$;

revoke all on function public.get_reservation_availability(date, integer, text) from public, anon, authenticated;
revoke all on function public.create_reservation(date, time, integer, text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.get_reservation_availability(date, integer, text) to service_role;
grant execute on function public.create_reservation(date, time, integer, text, text, text, jsonb, text) to service_role;


create table if not exists public.reservation_inquiries (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null check (char_length(trim(guest_name)) between 2 and 120),
  guest_email text not null check (char_length(trim(guest_email)) between 3 and 254),
  guest_phone text not null check (char_length(trim(guest_phone)) between 5 and 40),
  message text not null check (char_length(trim(message)) between 2 and 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reservation_inquiries enable row level security;
revoke all on public.reservation_inquiries from anon, authenticated;

create or replace function public.create_reservation_inquiry(
  p_name text,
  p_email text,
  p_phone text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inquiry_id uuid;
begin
  if p_name is null or char_length(trim(p_name)) < 2
     or p_email is null or position('@' in p_email) < 2
     or p_phone is null or char_length(trim(p_phone)) < 5
     or p_message is null or char_length(trim(p_message)) < 2 then
    raise exception using errcode = '22023', message = 'invalid_inquiry';
  end if;

  insert into public.reservation_inquiries (guest_name, guest_email, guest_phone, message)
  values (trim(p_name), lower(trim(p_email)), trim(p_phone), trim(p_message))
  returning id into inquiry_id;

  return inquiry_id;
end;
$$;

revoke all on function public.create_reservation_inquiry(text, text, text, text) from public, anon, authenticated;
grant execute on function public.create_reservation_inquiry(text, text, text, text) to service_role;


-- Refresh PostgREST's function schema cache immediately.
notify pgrst, 'reload schema';
