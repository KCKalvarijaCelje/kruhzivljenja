import { c as createServerRpc } from "./createServerRpc-BZmJhcEN.mjs";
import { s as supabaseAdmin } from "./client.server-DJJaeePt.mjs";
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
const serverGetPlannerData_createServerFn_handler = createServerRpc({
  id: "ed19c09f4469de7acbcf7fd298c4b21d136a3d80ba1850f02d1b5653682b7f7c",
  name: "serverGetPlannerData",
  filename: "src/lib/planner.functions.ts"
}, (opts) => serverGetPlannerData.__executeServer(opts));
const serverGetPlannerData = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverGetPlannerData_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: yrs
    } = await supabaseAdmin.from("ministry_years").select("id,label,start_year").order("start_year", {
      ascending: false
    }).limit(20);
    let yearsList = yrs ?? [];
    if (yearsList.length === 0) {
      const startYear = 2026;
      const label = `${startYear}/${startYear + 1}`;
      try {
        const {
          data: createdYear
        } = await supabaseAdmin.from("ministry_years").insert({
          start_year: startYear,
          label
        }).select("id,label,start_year").maybeSingle();
        if (createdYear) {
          yearsList = [createdYear];
        }
      } catch {
      }
      if (yearsList.length === 0) {
        yearsList = [{
          id: "year_2026",
          start_year: startYear,
          label
        }];
      }
    }
    let selectedYear = yearsList.find((y) => y.id === data.yearId);
    if (!selectedYear && yearsList.length > 0) {
      selectedYear = yearsList.find((y) => y.start_year === 2026) || yearsList[0];
    }
    if (selectedYear && selectedYear.id !== "year_2026") {
      try {
        await supabaseAdmin.from("schedule_dates").update({
          ministry_year_id: selectedYear.id
        }).is("ministry_year_id", null);
      } catch {
      }
    }
    const [{
      data: rawDates
    }, {
      data: people
    }, {
      data: locations
    }, {
      data: households
    }] = await Promise.all([selectedYear && selectedYear.id !== "year_2026" ? supabaseAdmin.from("schedule_dates").select("id,date,status,notes,ministry_year_id").or(`ministry_year_id.eq.${selectedYear.id},ministry_year_id.is.null`).order("date", {
      ascending: true
    }) : supabaseAdmin.from("schedule_dates").select("id,date,status,notes,ministry_year_id").order("date", {
      ascending: true
    }), supabaseAdmin.from("people").select("id,profile_id,full_name,email,phone,active").order("full_name").limit(300), supabaseAdmin.from("locations").select("id,name,active").order("name").limit(100), supabaseAdmin.from("recipient_households").select("id,name,size,active").order("name").limit(300)]);
    let dateList = rawDates ?? [];
    if (dateList.length === 0) {
      const {
        data: allDates
      } = await supabaseAdmin.from("schedule_dates").select("id,date,status,notes,ministry_year_id").order("date", {
        ascending: true
      }).limit(100);
      dateList = allDates ?? [];
    }
    const dateIds = dateList.map((d) => d.id);
    let allStops = [];
    let allRecipients = [];
    if (dateIds.length > 0) {
      const [{
        data: stopsData
      }, {
        data: recsData
      }] = await Promise.all([supabaseAdmin.from("schedule_stops").select("id,schedule_date_id,location_id,driver_id,coordinator_id,completed_at,completed_by,notes,sort_order,rule_stop_id").in("schedule_date_id", dateIds).order("sort_order"), supabaseAdmin.from("date_recipients").select("id,schedule_date_id,household_id,person_id,manual_name,force_include").in("schedule_date_id", dateIds)]);
      allStops = stopsData ?? [];
      allRecipients = recsData ?? [];
    }
    const peopleMap = new Map((people ?? []).map((p) => [p.id, p]));
    const locMap = new Map((locations ?? []).map((l) => [l.id, l]));
    const hhMap = new Map((households ?? []).map((h) => [h.id, h]));
    const stopsByDate = {};
    for (const st of allStops) {
      const driver = st.driver_id ? peopleMap.get(st.driver_id) : null;
      const coordinator = st.coordinator_id ? peopleMap.get(st.coordinator_id) : null;
      const completer = st.completed_by ? peopleMap.get(st.completed_by) : null;
      const loc = st.location_id ? locMap.get(st.location_id) : null;
      const enrichedStop = {
        ...st,
        locations: loc ? {
          name: loc.name
        } : null,
        driver: driver ? {
          full_name: driver.full_name
        } : null,
        coordinator: coordinator ? {
          full_name: coordinator.full_name
        } : null,
        completer: completer ? {
          full_name: completer.full_name
        } : null
      };
      (stopsByDate[st.schedule_date_id] ||= []).push(enrichedStop);
    }
    const recsByDate = {};
    for (const r of allRecipients) {
      const hh = r.household_id ? hhMap.get(r.household_id) : null;
      (recsByDate[r.schedule_date_id] ||= []).push({
        ...r,
        recipient_households: hh ? {
          name: hh.name,
          size: hh.size
        } : null
      });
    }
    const enrichedDates = dateList.map((d) => ({
      ...d,
      schedule_stops: stopsByDate[d.id] ?? [],
      date_recipients: recsByDate[d.id] ?? []
    }));
    return {
      success: true,
      years: yearsList,
      selectedYear,
      dates: enrichedDates,
      people: (people ?? []).filter((p) => p.active !== false),
      locations: (locations ?? []).filter((l) => l.active !== false),
      households: (households ?? []).filter((h) => h.active !== false)
    };
  } catch (err) {
    console.error("serverGetPlannerData error:", err);
    return {
      success: false,
      error: err.message,
      years: [],
      selectedYear: null,
      dates: [],
      people: [],
      locations: [],
      households: []
    };
  }
});
const serverUpdateScheduleStopAssignment_createServerFn_handler = createServerRpc({
  id: "ee4ad2b48dcf62cce133a8e4a3241f002663f4e939bfbaec1694bc7835c64791",
  name: "serverUpdateScheduleStopAssignment",
  filename: "src/lib/planner.functions.ts"
}, (opts) => serverUpdateScheduleStopAssignment.__executeServer(opts));
const serverUpdateScheduleStopAssignment = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverUpdateScheduleStopAssignment_createServerFn_handler, async ({
  data
}) => {
  try {
    const patch = {};
    if (data.driverId !== void 0) patch.driver_id = data.driverId;
    if (data.coordinatorId !== void 0) patch.coordinator_id = data.coordinatorId;
    const {
      error
    } = await supabaseAdmin.from("schedule_stops").update(patch).eq("id", data.stopId);
    if (error) return {
      success: false,
      error: error.message
    };
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});
const serverToggleStopCompletion_createServerFn_handler = createServerRpc({
  id: "3dfced1b843730da8022b1dcc3de2781e6632ec98c93f3f6cbf57dd9815752e2",
  name: "serverToggleStopCompletion",
  filename: "src/lib/planner.functions.ts"
}, (opts) => serverToggleStopCompletion.__executeServer(opts));
const serverToggleStopCompletion = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverToggleStopCompletion_createServerFn_handler, async ({
  data
}) => {
  try {
    const patch = {
      completed_at: data.completed ? (/* @__PURE__ */ new Date()).toISOString() : null,
      completed_by: data.completed ? data.completedByPersonId || null : null
    };
    const {
      error
    } = await supabaseAdmin.from("schedule_stops").update(patch).eq("id", data.stopId);
    if (error) return {
      success: false,
      error: error.message
    };
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
});
export {
  serverGetPlannerData_createServerFn_handler,
  serverToggleStopCompletion_createServerFn_handler,
  serverUpdateScheduleStopAssignment_createServerFn_handler
};
