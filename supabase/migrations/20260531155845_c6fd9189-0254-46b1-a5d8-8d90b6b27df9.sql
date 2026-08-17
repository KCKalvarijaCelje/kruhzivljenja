CREATE OR REPLACE FUNCTION public.admin_get_cron_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_build_object(
    'jobs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'jobid', j.jobid,
        'jobname', j.jobname,
        'schedule', j.schedule,
        'active', j.active
      ) ORDER BY j.jobname)
      FROM cron.job j
      WHERE j.jobname IN ('driver-reminders-daily','process-email-queue')
    ), '[]'::jsonb),
    'runs', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'jobid', r.jobid,
        'jobname', j.jobname,
        'status', r.status,
        'return_message', r.return_message,
        'start_time', r.start_time,
        'end_time', r.end_time
      ) ORDER BY r.start_time DESC)
      FROM cron.job_run_details r
      JOIN cron.job j ON j.jobid = r.jobid
      WHERE j.jobname IN ('driver-reminders-daily','process-email-queue')
        AND r.start_time > now() - interval '7 days'
      LIMIT 50
    ), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_cron_status() TO authenticated;