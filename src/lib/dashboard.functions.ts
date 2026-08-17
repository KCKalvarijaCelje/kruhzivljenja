import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

const firstNameOf = (p: any): string | null => {
  if (!p) return null;
  if (p.first_name) return p.first_name;
  if (p.full_name) return String(p.full_name).trim().split(/\s+/)[0] ?? null;
  return null;
};

export const getPublicSchedule = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicScheduleRow[]> => {
    const today = new Date();
    const startYear = today.getMonth() >= 8 ? today.getFullYear() : today.getFullYear() - 1;
    const start = `${startYear}-09-01`;
    const end = `${startYear + 1}-08-31`;

    const [{ data, error }, { data: pickup }] = await Promise.all([
      supabaseAdmin
        .from("schedule_dates")
        .select(
          "id,date,status," +
          "schedule_stops(id,sort_order,driver_id,locations(name),driver:people!schedule_stops_driver_id_fkey(first_name,full_name),coordinator:people!schedule_stops_coordinator_id_fkey(first_name,full_name))," +
          "date_recipients(id,manual_name,force_include,household_id,household:recipient_households(first_name,name,person_id,size),person:people(first_name,full_name))"
        )
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true }),
      (supabaseAdmin as any).from("driver_pickup_households").select("person_id,household_id"),
    ]);

    if (error) throw error;

    // Build driver person_id → set of pickup household_ids
    const pickupMap = new Map<string, Set<string>>();
    for (const row of (pickup ?? []) as Array<{ person_id: string; household_id: string }>) {
      if (!pickupMap.has(row.person_id)) pickupMap.set(row.person_id, new Set());
      pickupMap.get(row.person_id)!.add(row.household_id);
    }

    return (data ?? []).map((r: any) => {
      const stops: PublicStop[] = (r.schedule_stops ?? [])
        .slice()
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((s: any) => ({
          id: s.id,
          location: s.locations?.name ?? null,
          driver: firstNameOf(s.driver),
          coordinator: firstNameOf(s.coordinator),
        }));

      // Collect driver person ids assigned on this date
      const driverIds = ((r.schedule_stops ?? []) as any[])
        .map((s) => s.driver_id)
        .filter(Boolean) as string[];

      // Households excluded because their owning person drives, or they're linked pickups
      const excludedHh = new Set<string>();
      for (const pid of driverIds) {
        const linked = pickupMap.get(pid);
        if (linked) for (const hid of linked) excludedHh.add(hid);
      }
      // Also exclude households whose person_id is one of the drivers
      for (const dr of (r.date_recipients ?? []) as any[]) {
        const personId = dr.household?.person_id;
        if (personId && driverIds.includes(personId) && dr.household_id) {
          excludedHh.add(dr.household_id);
        }
      }

      const recipients: PublicRecipient[] = ((r.date_recipients ?? []) as any[])
        .filter((dr) => dr.force_include || !dr.household_id || !excludedHh.has(dr.household_id))
        .map((dr) => {
          const fromHh = dr.household?.first_name || (dr.household?.name ? String(dr.household.name).trim().split(/\s+/)[0] : null);
          const fromPerson = dr.person?.first_name || (dr.person?.full_name ? String(dr.person.full_name).trim().split(/\s+/)[0] : null);
          const fromManual = dr.manual_name ? String(dr.manual_name).trim().split(/\s+/)[0] : null;
          return { id: dr.id, name: fromHh ?? fromPerson ?? fromManual ?? "—", size: dr.household?.size ?? null };
        });

      return {
        id: r.id,
        date: r.date,
        status: r.status,
        stops,
        recipient_count: recipients.length,
        recipients,
      };
    });
  }
);
