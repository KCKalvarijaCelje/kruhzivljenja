ALTER TABLE public.driver_notification_log
  ADD CONSTRAINT driver_notification_log_driver_person_id_fkey
  FOREIGN KEY (driver_person_id) REFERENCES public.people(id) ON DELETE CASCADE;

ALTER TABLE public.driver_notification_log
  ADD CONSTRAINT driver_notification_log_schedule_stop_id_fkey
  FOREIGN KEY (schedule_stop_id) REFERENCES public.schedule_stops(id) ON DELETE CASCADE;