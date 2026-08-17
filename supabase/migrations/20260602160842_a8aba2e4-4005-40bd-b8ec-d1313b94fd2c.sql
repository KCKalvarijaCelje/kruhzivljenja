DROP FUNCTION IF EXISTS public.apply_template_to_future(uuid, date);

CREATE OR REPLACE FUNCTION public.apply_template_to_future(_rule_id uuid, _from_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  inserted_count int := 0;
  deleted_count int := 0;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;

  with target_dates as (
    select distinct d.id as date_id
    from public.schedule_dates d
    join public.schedule_stops s on s.schedule_date_id = d.id
    join public.recurring_schedule_rule_stops rs on rs.id = s.rule_stop_id
    where rs.rule_id = _rule_id and d.date >= _from_date
  ),
  del as (
    delete from public.date_recipients dr
    using target_dates td
    where dr.schedule_date_id = td.date_id
      and dr.force_include = false
      and dr.household_id is not null
      and not exists (
        select 1 from public.recurring_recipient_templates t
        where t.rule_id = _rule_id and t.household_id = dr.household_id
      )
    returning 1
  )
  select count(*) into deleted_count from del;

  with target_dates as (
    select distinct d.id as date_id
    from public.schedule_dates d
    join public.schedule_stops s on s.schedule_date_id = d.id
    join public.recurring_schedule_rule_stops rs on rs.id = s.rule_stop_id
    where rs.rule_id = _rule_id and d.date >= _from_date
  ),
  ins as (
    insert into public.date_recipients(schedule_date_id, household_id)
    select td.date_id, t.household_id
    from target_dates td
    cross join public.recurring_recipient_templates t
    where t.rule_id = _rule_id
      and not exists (
        select 1 from public.date_recipients dr
        where dr.schedule_date_id = td.date_id and dr.household_id = t.household_id
      )
    returning 1
  )
  select count(*) into inserted_count from ins;

  return jsonb_build_object('inserted', inserted_count, 'deleted', deleted_count);
end;
$function$;