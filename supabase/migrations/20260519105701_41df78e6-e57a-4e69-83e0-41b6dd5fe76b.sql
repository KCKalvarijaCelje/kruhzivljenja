
alter table public.recurring_schedule_rules
  add column if not exists default_driver_id uuid references public.people(id) on delete set null,
  add column if not exists default_coordinator_id uuid references public.people(id) on delete set null;

create or replace function public.generate_ministry_year(_start_year integer)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  my_id uuid;
  start_date date := make_date(_start_year, 9, 1);
  end_date   date := make_date(_start_year + 1, 8, 31);
  d date;
  rule record;
  weeks_since int;
  new_sd_id uuid;
begin
  insert into public.ministry_years(start_year, label)
  values (_start_year, _start_year || '/' || (_start_year + 1))
  on conflict (start_year) do update set label = excluded.label
  returning id into my_id;

  for rule in
    select * from public.recurring_schedule_rules
    where active and location_id is not null
  loop
    d := start_date;
    while extract(dow from d)::int <> rule.weekday loop
      d := d + 1;
    end loop;
    weeks_since := 0;
    while d <= end_date loop
      if rule.frequency = 'weekly'
         or (rule.frequency = 'biweekly' and weeks_since % 2 = 0) then
        insert into public.schedule_dates(ministry_year_id, date, location_id, rule_id, driver_id, coordinator_id)
        values (my_id, d, rule.location_id, rule.id, rule.default_driver_id, rule.default_coordinator_id)
        on conflict (date, location_id) do update
          set rule_id = excluded.rule_id,
              ministry_year_id = excluded.ministry_year_id,
              driver_id = coalesce(public.schedule_dates.driver_id, excluded.driver_id),
              coordinator_id = coalesce(public.schedule_dates.coordinator_id, excluded.coordinator_id)
        returning id into new_sd_id;

        insert into public.date_recipients(schedule_date_id, household_id)
        select new_sd_id, t.household_id
        from public.recurring_recipient_templates t
        where t.rule_id = rule.id
        on conflict do nothing;
      end if;
      d := d + 7;
      weeks_since := weeks_since + 1;
    end loop;
  end loop;
  return my_id;
end;
$$;

create or replace function public.apply_assignments_to_future(
  _rule_id uuid,
  _from_date date,
  _override boolean default false
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  affected int := 0;
  r record;
begin
  if not is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  select default_driver_id, default_coordinator_id into r
  from public.recurring_schedule_rules where id = _rule_id;

  if _override then
    update public.schedule_dates
    set driver_id = r.default_driver_id,
        coordinator_id = r.default_coordinator_id
    where rule_id = _rule_id and date >= _from_date;
  else
    update public.schedule_dates
    set driver_id = coalesce(driver_id, r.default_driver_id),
        coordinator_id = coalesce(coordinator_id, r.default_coordinator_id)
    where rule_id = _rule_id and date >= _from_date;
  end if;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
