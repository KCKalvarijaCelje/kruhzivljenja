CREATE OR REPLACE FUNCTION public.apply_person_to_future(
  _rule_stop_id uuid,
  _from_date date,
  _field text,
  _person_id uuid,
  _update_template boolean DEFAULT false
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  affected int := 0;
begin
  if not is_admin(auth.uid()) then raise exception 'not authorized'; end if;
  if _field not in ('driver','coordinator') then raise exception 'invalid field'; end if;

  if _field = 'driver' then
    update public.schedule_stops s
       set driver_id = _person_id
      from public.schedule_dates d
     where s.schedule_date_id = d.id
       and s.rule_stop_id = _rule_stop_id
       and d.date >= _from_date;
    get diagnostics affected = row_count;

    if _update_template then
      update public.recurring_schedule_rule_stops
         set default_driver_id = _person_id
       where id = _rule_stop_id;
    end if;
  else
    update public.schedule_stops s
       set coordinator_id = _person_id
      from public.schedule_dates d
     where s.schedule_date_id = d.id
       and s.rule_stop_id = _rule_stop_id
       and d.date >= _from_date;
    get diagnostics affected = row_count;

    if _update_template then
      update public.recurring_schedule_rule_stops
         set default_coordinator_id = _person_id
       where id = _rule_stop_id;
    end if;
  end if;

  return affected;
end;
$function$;