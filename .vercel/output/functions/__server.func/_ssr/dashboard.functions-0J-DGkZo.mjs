import { c as createServerRpc } from "./createServerRpc-BZmJhcEN.mjs";
import { s as supabaseAdmin } from "./client.server-DJJaeePt.mjs";
import { c as currentMinistryStartYear } from "./ministry-year-BUeW2JcE.mjs";
import { c as createServerFn } from "./server-Dm1gvL4M.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const getLatestStopUpdate_createServerFn_handler = createServerRpc({
  id: "baf0bd5fb9a17a35daf211172410cf38ecbc80b4e4828d8549cd6a564d888fda",
  name: "getLatestStopUpdate",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getLatestStopUpdate.__executeServer(opts));
const getLatestStopUpdate = createServerFn({
  method: "GET"
}).handler(getLatestStopUpdate_createServerFn_handler, async () => {
  try {
    const {
      data,
      error
    } = await supabaseAdmin.from("stop_messages").select("author_name,body,created_at,schedule_stops!inner(locations(name),schedule_dates!inner(date))").order("created_at", {
      ascending: false
    }).limit(1).maybeSingle();
    if (error || !data) return null;
    return {
      date: data.schedule_stops?.schedule_dates?.date ?? "",
      location: data.schedule_stops?.locations?.name ?? null,
      author_name: data.author_name,
      body: data.body,
      created_at: data.created_at
    };
  } catch (err) {
    console.error("getLatestStopUpdate error:", err);
    return null;
  }
});
const nameOf = (fullNameOrPerson) => {
  if (!fullNameOrPerson) return null;
  if (typeof fullNameOrPerson === "string") {
    return fullNameOrPerson.trim() || null;
  }
  if (fullNameOrPerson.full_name) return String(fullNameOrPerson.full_name).trim();
  if (fullNameOrPerson.first_name) return String(fullNameOrPerson.first_name).trim();
  return null;
};
const getPublicSchedule_createServerFn_handler = createServerRpc({
  id: "7c39aada6c930feb5c6507e560431c8b130a74ae92d2a650f44ab4762833cfc8",
  name: "getPublicSchedule",
  filename: "src/lib/dashboard.functions.ts"
}, (opts) => getPublicSchedule.__executeServer(opts));
const getPublicSchedule = createServerFn({
  method: "GET"
}).handler(getPublicSchedule_createServerFn_handler, async () => {
  try {
    const startYear = currentMinistryStartYear();
    const start = `${startYear}-09-01`;
    const end = `${startYear + 1}-08-31`;
    let {
      data: rawDates,
      error: datesErr
    } = await supabaseAdmin.from("schedule_dates").select("id,date,status,notes,ministry_year_id").gte("date", start).lte("date", end).order("date", {
      ascending: true
    });
    if (datesErr || !rawDates || rawDates.length === 0) {
      const {
        data: allDates
      } = await supabaseAdmin.from("schedule_dates").select("id,date,status,notes,ministry_year_id").order("date", {
        ascending: true
      }).limit(100);
      rawDates = allDates ?? [];
    }
    if (!rawDates || rawDates.length === 0) return [];
    return await enrichScheduleDates(rawDates);
  } catch (err) {
    console.error("getPublicSchedule error:", err);
    return [];
  }
});
async function enrichScheduleDates(datesList) {
  const dateIds = datesList.map((d) => d.id);
  if (dateIds.length === 0) return [];
  const [{
    data: stopsData
  }, {
    data: recsData
  }, {
    data: peopleData
  }, {
    data: locsData
  }, {
    data: hhData
  }, {
    data: pickupData
  }] = await Promise.all([supabaseAdmin.from("schedule_stops").select("id,schedule_date_id,location_id,driver_id,coordinator_id,sort_order").in("schedule_date_id", dateIds).order("sort_order"), supabaseAdmin.from("date_recipients").select("id,schedule_date_id,household_id,person_id,manual_name,force_include").in("schedule_date_id", dateIds), supabaseAdmin.from("people").select("id,full_name,first_name").eq("active", true).limit(200), supabaseAdmin.from("locations").select("id,name").eq("active", true).limit(50), supabaseAdmin.from("recipient_households").select("id,name,first_name,person_id,size").eq("active", true).limit(200), supabaseAdmin.from("driver_pickup_households").select("person_id,household_id").limit(200)]);
  const peopleMap = new Map((peopleData ?? []).map((p) => [p.id, p]));
  const locMap = new Map((locsData ?? []).map((l) => [l.id, l]));
  const hhMap = new Map((hhData ?? []).map((h) => [h.id, h]));
  const pickupMap = /* @__PURE__ */ new Map();
  for (const row of pickupData ?? []) {
    if (!pickupMap.has(row.person_id)) pickupMap.set(row.person_id, /* @__PURE__ */ new Set());
    pickupMap.get(row.person_id).add(row.household_id);
  }
  const stopsByDate = {};
  for (const s of stopsData ?? []) {
    (stopsByDate[s.schedule_date_id] ||= []).push(s);
  }
  const recsByDate = {};
  for (const r of recsData ?? []) {
    (recsByDate[r.schedule_date_id] ||= []).push(r);
  }
  return datesList.map((d) => {
    const rawStops = stopsByDate[d.id] ?? [];
    const stops = rawStops.map((s) => {
      const loc = s.location_id ? locMap.get(s.location_id) : null;
      const driver = s.driver_id ? peopleMap.get(s.driver_id) : null;
      const coordinator = s.coordinator_id ? peopleMap.get(s.coordinator_id) : null;
      return {
        id: s.id,
        location: loc?.name ?? null,
        driver: nameOf(driver),
        coordinator: nameOf(coordinator)
      };
    });
    const driverIds = rawStops.map((s) => s.driver_id).filter(Boolean);
    const excludedHh = /* @__PURE__ */ new Set();
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
    const recipients = rawRecs.filter((dr) => dr.force_include || !dr.household_id || !excludedHh.has(dr.household_id)).map((dr) => {
      const hh = dr.household_id ? hhMap.get(dr.household_id) : null;
      const pr = dr.person_id ? peopleMap.get(dr.person_id) : null;
      const fromHh = hh?.first_name || (hh?.name ? String(hh.name).trim().split(/\s+/)[0] : null);
      const fromPerson = pr?.first_name || (pr?.full_name ? String(pr.full_name).trim().split(/\s+/)[0] : null);
      const fromManual = dr.manual_name ? String(dr.manual_name).trim().split(/\s+/)[0] : null;
      return {
        id: dr.id,
        name: fromHh ?? fromPerson ?? fromManual ?? "—",
        size: hh?.size ?? null
      };
    });
    return {
      id: d.id,
      date: d.date,
      status: d.status,
      stops,
      recipient_count: recipients.length,
      recipients
    };
  });
}
export {
  getLatestStopUpdate_createServerFn_handler,
  getPublicSchedule_createServerFn_handler
};
