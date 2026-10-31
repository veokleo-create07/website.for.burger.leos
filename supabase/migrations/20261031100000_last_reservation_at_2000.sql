-- Set 20:00 as the latest reservation start time while still requiring the booking to finish by closing.

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
  select capacity into v_capacity from public.reservation_settings where reservation_settings.id = true;

  v_slot := v_open;
  while v_slot <= time '20:00' loop
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

  if p_time < v_open or p_time > time '20:00' or v_end > v_close
     or (p_date = v_today and p_time <= v_now) then
    raise exception using errcode = '22023', message = 'outside_hours';
  end if;

  perform pg_advisory_xact_lock(hashtext('leo-reservations:' || p_date::text));

  select capacity into v_capacity
  from public.reservation_settings
  where reservation_settings.id = true
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


notify pgrst, 'reload schema';
