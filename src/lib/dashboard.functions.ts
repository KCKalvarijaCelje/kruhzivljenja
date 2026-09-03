import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { currentMinistryStartYear } from "@/lib/ministry-year";

export type LatestStopUpdate = {
  date: string;
  location: string | null;
  author_name: string;
  body: string;
  created_at: string;
};

// Latest single stop_message tied to the most recent delivery date that has any messages.
export const getLatestStopUpdate = createServerFn({ method: "GET" }).handler(
  async (): Promise<LatestStopUpdate | null> => {
    try {
      const { data, error } = await (supabaseAdmin as any)
        .from("stop_messages")
        .select(
          "author_name,body,created_at,schedule_stops!inner(locations(name),schedule_dates!inner(date))"
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;
      return {
        date: data.schedule_stops?.schedule_dates?.date ?? "",
        location: data.schedule_stops?.locations?.name ?? null,
        author_name: data.author_name,
        body: data.body,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error("getLatestStopUpdate error:", err);
      return null;
    }
  }
);

export type PublicRecipient = {
  id: string;
  name: string;
  size: number | null;
};

export type PublicStop = {
  id: string;
  location: string | null;
  driver: string | null;
  coordinator: string | null;
};

export type PublicScheduleRow = {
  id: string;
  date: string;
  status: string;
  stops: PublicStop[];
  recipient_count: number;
  recipients: PublicRecipient[];
};

const nameOf = (fullNameOrPerson: any): string | null => {
  if (!fullNameOrPerson) return null;
  if (typeof fullNameOrPerson === "string") {
    return fullNameOrPerson.trim() || null;
  }
  if (fullNameOrPerson.full_name) return String(fullNameOrPerson.full_name).trim();
  if (fullNameOrPerson.first_name) return String(fullNameOrPerson.first_name).trim();
  return null;
};

export const getPublicSchedule = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicScheduleRow[]> => {
    try {
      const startYear = currentMinistryStartYear();
      const start = `${startYear}-09-01`;
      const end = `${startYear + 1}-08-31`;

      // 1. Fetch dates in range
      let { data: rawDates, error: datesErr } = await (supabaseAdmin as any)
        .from("schedule_dates")
        .select("id,date,status,notes,ministry_year_id")
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });

      if (datesErr || !rawDates || rawDates.length === 0) {
        const { data: allDates } = await (supabaseAdmin as any)
          .from("schedule_dates")
          .select("id,date,status,notes,ministry_year_id")
          .order("date", { ascending: true })
          .limit(100);

        rawDates = allDates ?? [];
      }

      if (!rawDates || rawDates.length === 0) return [];
      return await enrichScheduleDates(rawDates);
    } catch (err: any) {
      console.error("getPublicSchedule error:", err);
      return [];
    }
  }
);

async function enrichScheduleDates(datesList: any[]): Promise<PublicScheduleRow[]> {
  const dateIds = datesList.map((d) => d.id);
  if (dateIds.length === 0) return [];

  const [
    { data: stopsData },
    { data: recsData },
    { data: peopleData },
    { data: locsData },
    { data: hhData },
    { data: pickupData }
  ] = await Promise.all([
    (supabaseAdmin as any)
      .from("schedule_stops")
      .select("id,schedule_date_id,location_id,driver_id,coordinator_id,sort_order")
      .in("schedule_date_id", dateIds)
      .order("sort_order"),
    (supabaseAdmin as any)
      .from("date_recipients")
      .select("id,schedule_date_id,household_id,person_id,manual_name,force_include")
      .in("schedule_date_id", dateIds),
    (supabaseAdmin as any).from("people").select("id,full_name,first_name").eq("active", true).limit(200),
    (supabaseAdmin as any).from("locations").select("id,name").eq("active", true).limit(50),
    (supabaseAdmin as any).from("recipient_households").select("id,name,first_name,person_id,size").eq("active", true).limit(200),
    (supabaseAdmin as any).from("driver_pickup_households").select("person_id,household_id").limit(200),
  ]);

  const peopleMap = new Map((peopleData ?? []).map((p: any) => [p.id, p]));
  const locMap = new Map((locsData ?? []).map((l: any) => [l.id, l]));
  const hhMap = new Map((hhData ?? []).map((h: any) => [h.id, h]));

  const pickupMap = new Map<string, Set<string>>();
  for (const row of (pickupData ?? []) as Array<{ person_id: string; household_id: string }>) {
    if (!pickupMap.has(row.person_id)) pickupMap.set(row.person_id, new Set());
    pickupMap.get(row.person_id)!.add(row.household_id);
  }

  const stopsByDate: Record<string, any[]> = {};
  for (const s of stopsData ?? []) {
    (stopsByDate[s.schedule_date_id] ||= []).push(s);
  }

  const recsByDate: Record<string, any[]> = {};
  for (const r of recsData ?? []) {
    (recsByDate[r.schedule_date_id] ||= []).push(r);
  }

  return datesList.map((d: any) => {
    const rawStops = stopsByDate[d.id] ?? [];
    const stops: PublicStop[] = rawStops.map((s: any) => {
      const loc = s.location_id ? locMap.get(s.location_id) : null;
      const driver = s.driver_id ? peopleMap.get(s.driver_id) : null;
      const coordinator = s.coordinator_id ? peopleMap.get(s.coordinator_id) : null;

      return {
        id: s.id,
        location: loc?.name ?? null,
        driver: nameOf(driver),
        coordinator: nameOf(coordinator),
      };
    });

    const driverIds = rawStops.map((s: any) => s.driver_id).filter(Boolean) as string[];
    const excludedHh = new Set<string>();
    for (const pid of driverIds) {
      const linked = pickupMap.get(pid);
      if (linked) {
        for (const hid of linked) excludedHh.add(hid);
      }
    }

    const rawRecs = recsByDate[d.id] ?? [];
    for (const dr of rawRecs) {
      const hh = dr.household_id ? hhMap.get(dr.household_id) : null;
      const personId = hh?.person_id;
      if (personId && driverIds.includes(personId) && dr.household_id) {
        excludedHh.add(dr.household_id);
      }
    }

    const recipients: PublicRecipient[] = rawRecs
      .filter((dr: any) => dr.force_include || !dr.household_id || !excludedHh.has(dr.household_id))
      .map((dr: any) => {
        const hh = dr.household_id ? hhMap.get(dr.household_id) : null;
        const pr = dr.person_id ? peopleMap.get(dr.person_id) : null;

        const fromHh = hh?.first_name || (hh?.name ? String(hh.name).trim().split(/\s+/)[0] : null);
        const fromPerson = pr?.first_name || (pr?.full_name ? String(pr.full_name).trim().split(/\s+/)[0] : null);
        const fromManual = dr.manual_name ? String(dr.manual_name).trim().split(/\s+/)[0] : null;

        return {
          id: dr.id,
          name: fromHh ?? fromPerson ?? fromManual ?? "—",
          size: hh?.size ?? null,
        };
      });

    return {
      id: d.id,
      date: d.date,
      status: d.status,
      stops,
      recipient_count: recipients.length,
      recipients,
    };
  });
}
