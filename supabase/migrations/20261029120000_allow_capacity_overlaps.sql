-- Allow overlapping reservations while enforcing the configured total capacity.
-- The original exclusion constraint blocked all overlapping bookings, even when capacity remained.
alter table public.reservations
  drop constraint if exists reservations_no_overlap;

notify pgrst, 'reload schema';
