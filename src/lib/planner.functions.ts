import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const serverGetPlannerData = createServerFn({ method: "POST" })
  .inputValidator((data: { yearId?: string | null }) => data)
  .handler(async ({ data }) => {
    try {
      // 1. Get all ministry years
      const { data: yrs } = await (supabaseAdmin as any)
        .from("ministry_years")
        .select("*")
        .order("start_year", { ascending: false });

      const yearsList = yrs ?? [];
      let selectedYear = yearsList.find((y: any) => y.id === data.yearId);
      if (!selectedYear && yearsList.length > 0) {
        selectedYear = yearsList.find((y: any) => y.start_year === 2026) || yearsList[0];
      }

      if (!selectedYear) {
        return {
          success: true,
          years: [],
          selectedYear: null,
          dates: [],
          people: [],
          locations: [],
          households: [],
        };
      }

      // 2. Fetch dates, stops, recipients, and lookups for this year
      const [
        { data: rawDates },
        { data: people },
        { data: locations },
        { data: households }
      ] = await Promise.all([
        (supabaseAdmin as any)
          .from("schedule_dates")
          .select("id,date,status,notes,ministry_year_id")
          .eq("ministry_year_id", selectedYear.id)
          .order("date", { ascending: true }),
        (supabaseAdmin as any)
          .from("people")
          .select("id,profile_id,full_name,email,phone,active")
          .order("full_name"),
        (supabaseAdmin as any)
          .from("locations")
          .select("id,name,active")
          .order("name"),
        (supabaseAdmin as any)
          .from("recipient_households")
          .select("id,name,size,active")
          .order("name"),
      ]);

      const dateList = rawDates ?? [];
      const dateIds = dateList.map((d: any) => d.id);

      let allStops: any[] = [];
      let allRecipients: any[] = [];

      if (dateIds.length > 0) {
        const [{ data: stopsData }, { data: recsData }] = await Promise.all([
          (supabaseAdmin as any)
            .from("schedule_stops")
            .select("id,schedule_date_id,location_id,driver_id,coordinator_id,completed_at,completed_by,notes,sort_order,rule_stop_id")
            .in("schedule_date_id", dateIds)
            .order("sort_order"),
          (supabaseAdmin as any)
            .from("date_recipients")
            .select("id,schedule_date_id,household_id,person_id,manual_name,force_include")
            .in("schedule_date_id", dateIds),
        ]);
        allStops = stopsData ?? [];
        allRecipients = recsData ?? [];
      }

      // Map people & location names to stops
      const peopleMap = new Map((people ?? []).map((p: any) => [p.id, p]));
      const locMap = new Map((locations ?? []).map((l: any) => [l.id, l]));
      const hhMap = new Map((households ?? []).map((h: any) => [h.id, h]));

      const stopsByDate: Record<string, any[]> = {};
      for (const st of allStops) {
        const driver = st.driver_id ? peopleMap.get(st.driver_id) : null;
        const coordinator = st.coordinator_id ? peopleMap.get(st.coordinator_id) : null;
        const completer = st.completed_by ? peopleMap.get(st.completed_by) : null;
        const loc = st.location_id ? locMap.get(st.location_id) : null;

        const enrichedStop = {
          ...st,
          locations: loc ? { name: loc.name } : null,
          driver: driver ? { full_name: driver.full_name } : null,
          coordinator: coordinator ? { full_name: coordinator.full_name } : null,
          completer: completer ? { full_name: completer.full_name } : null,
        };
        (stopsByDate[st.schedule_date_id] ||= []).push(enrichedStop);
      }

      const recsByDate: Record<string, any[]> = {};
      for (const r of allRecipients) {
        const hh = r.household_id ? hhMap.get(r.household_id) : null;
        (recsByDate[r.schedule_date_id] ||= []).push({
          ...r,
          recipient_households: hh ? { name: hh.name, size: hh.size } : null,
        });
      }

      const enrichedDates = dateList.map((d: any) => ({
        ...d,
        schedule_stops: stopsByDate[d.id] ?? [],
        date_recipients: recsByDate[d.id] ?? [],
      }));

      return {
        success: true,
        years: yearsList,
        selectedYear,
        dates: enrichedDates,
        people: (people ?? []).filter((p: any) => p.active),
        locations: (locations ?? []).filter((l: any) => l.active),
        households: (households ?? []).filter((h: any) => h.active),
      };
    } catch (err: any) {
      console.error("serverGetPlannerData error:", err);
      return {
        success: false,
        error: err.message,
        years: [],
        selectedYear: null,
        dates: [],
        people: [],
        locations: [],
        households: [],
      };
    }
  });

export const serverUpdateScheduleStopAssignment = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      stopId: string;
      driverId?: string | null;
      coordinatorId?: string | null;
    }) => data
  )
  .handler(async ({ data }) => {
    try {
      const patch: any = {};
      if (data.driverId !== undefined) patch.driver_id = data.driverId;
      if (data.coordinatorId !== undefined) patch.coordinator_id = data.coordinatorId;

      const { error } = await (supabaseAdmin as any)
        .from("schedule_stops")
        .update(patch)
        .eq("id", data.stopId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverToggleStopCompletion = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      stopId: string;
      completed: boolean;
      completedByPersonId?: string | null;
    }) => data
  )
  .handler(async ({ data }) => {
    try {
      const patch: any = {
        completed_at: data.completed ? new Date().toISOString() : null,
        completed_by: data.completed ? data.completedByPersonId || null : null,
      };

      const { error } = await (supabaseAdmin as any)
        .from("schedule_stops")
        .update(patch)
        .eq("id", data.stopId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
