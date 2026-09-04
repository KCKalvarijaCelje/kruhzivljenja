import { c as createServerRpc } from "./createServerRpc-BZmJhcEN.mjs";
import { s as supabaseAdmin } from "./client.server-DJJaeePt.mjs";
import { g as generateProfileSlug } from "./people.functions-BaJhYbHb.mjs";
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
import "./createSsrRpc-Bob-CuPr.mjs";
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
const bootstrapAdminRoles_createServerFn_handler = createServerRpc({
  id: "9b2c4065b49a805c41f00798ad831f8d51b030630abd5ae641fadd163e286fb1",
  name: "bootstrapAdminRoles",
  filename: "src/lib/admin.functions.ts"
}, (opts) => bootstrapAdminRoles.__executeServer(opts));
const bootstrapAdminRoles = createServerFn({
  method: "POST"
}).handler(bootstrapAdminRoles_createServerFn_handler, async () => {
  try {
    await supabaseAdmin.from("user_roles").update({
      role: "admin"
    }).eq("role", "superadmin");
    const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com"];
    const {
      data: profs
    } = await supabaseAdmin.from("profiles").select("id,email").in("email", ADMIN_BOOTSTRAP_EMAILS);
    for (const p of profs ?? []) {
      const uid = p.id;
      if (uid) {
        await supabaseAdmin.from("user_roles").upsert({
          user_id: uid,
          role: "admin"
        }, {
          onConflict: "user_id,role"
        });
      }
    }
    return {
      success: true
    };
  } catch (err) {
    console.warn("Bootstrap admin roles warning:", err);
    return {
      success: false
    };
  }
});
const serverGetAdminData_createServerFn_handler = createServerRpc({
  id: "491a74907a29deedbc62a6a7cc4342836c06d5f0eaa06b3dfc36fd08e5159c34",
  name: "serverGetAdminData",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverGetAdminData.__executeServer(opts));
const serverGetAdminData = createServerFn({
  method: "GET"
}).handler(serverGetAdminData_createServerFn_handler, async () => {
  try {
    await supabaseAdmin.from("user_roles").update({
      role: "admin"
    }).eq("role", "superadmin");
    const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com"];
    const {
      data: profsBootstrap
    } = await supabaseAdmin.from("profiles").select("id,email").in("email", ADMIN_BOOTSTRAP_EMAILS);
    for (const p of profsBootstrap ?? []) {
      const uid = p.id;
      if (uid) {
        await supabaseAdmin.from("user_roles").upsert({
          user_id: uid,
          role: "admin"
        }, {
          onConflict: "user_id,role"
        });
      }
    }
    const [{
      data: profs
    }, {
      data: ppl
    }, {
      data: pplRoles
    }, {
      data: ur
    }, {
      data: yrs
    }, {
      data: locs
    }, {
      data: rls
    }, {
      data: ruleStops
    }, {
      data: recTemplates
    }, {
      data: households
    }] = await Promise.all([supabaseAdmin.from("profiles").select("id,auth_user_id,email,full_name,phone,notes,active,approval_status,role,kruh_role,is_driver,allowed_apps").order("full_name", {
      ascending: true
    }).limit(300), supabaseAdmin.from("people").select("id,profile_id,full_name,first_name,last_name,email,phone,active").order("full_name").limit(200), supabaseAdmin.from("people_roles").select("person_id,role"), supabaseAdmin.from("user_roles").select("user_id,role"), supabaseAdmin.from("ministry_years").select("id,label,start_year").order("start_year", {
      ascending: false
    }).limit(20), supabaseAdmin.from("locations").select("id,name,address,active").order("name").limit(100), supabaseAdmin.from("recurring_schedule_rules").select("id,weekday,frequency,active").order("weekday").order("frequency"), supabaseAdmin.from("recurring_schedule_rule_stops").select("id,rule_id,location_id,sort_order,default_driver_count,locations(name)").order("sort_order"), supabaseAdmin.from("recurring_recipient_templates").select("id,rule_id,household_id,recipient_households(name,size)"), supabaseAdmin.from("recipient_households").select("id,name,size,person_id,active").order("name").limit(200)]);
    const finalProfiles = [...profs ?? []];
    const profIdSet = new Set(finalProfiles.map((p) => String(p.id)));
    const profEmailMap = new Map(finalProfiles.filter((pr) => pr.email).map((pr) => [pr.email.toLowerCase().trim(), pr]));
    const rolesByPerson = {};
    for (const r of pplRoles ?? []) {
      (rolesByPerson[r.person_id] ||= []).push(r.role);
    }
    for (const p of ppl ?? []) {
      const emailKey = p.email ? p.email.toLowerCase().trim() : null;
      let existingProf = p.profile_id && profIdSet.has(String(p.profile_id)) ? finalProfiles.find((x) => String(x.id) === String(p.profile_id)) : emailKey ? profEmailMap.get(emailKey) : null;
      const roles = rolesByPerson[p.id] ?? [];
      const isDriver = roles.includes("driver");
      const hasAnyRole = roles.length > 0;
      const mainRole = roles.includes("admin") ? "admin" : roles.includes("coordinator") ? "coordinator" : isDriver ? "driver" : null;
      if (!existingProf) {
        const baseSlug = generateProfileSlug(p.first_name, p.last_name, p.full_name, p.email);
        let finalId = baseSlug;
        let counter = 2;
        while (profIdSet.has(finalId)) {
          finalId = `${baseSlug}_${counter++}`;
        }
        const fullName = p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Neznano";
        const profileInsert = {
          id: finalId,
          full_name: fullName,
          email: p.email?.trim() || null,
          phone: p.phone?.trim() || null,
          notes: p.notes?.trim() || null,
          active: p.active !== false,
          approval_status: "approved"
        };
        const {
          data: newProf,
          error: insErr
        } = await supabaseAdmin.from("profiles").insert(profileInsert).select("id,email,full_name,phone,notes,active,approval_status").maybeSingle();
        if (newProf?.id) {
          profIdSet.add(newProf.id);
          if (newProf.email) profEmailMap.set(newProf.email.toLowerCase().trim(), newProf);
          finalProfiles.push(newProf);
          p.profile_id = newProf.id;
          await supabaseAdmin.from("people").update({
            profile_id: newProf.id
          }).eq("id", p.id);
        } else if (insErr) {
          console.warn("serverGetAdminData: failed to create profile for", p.full_name, insErr);
        }
      } else if (p.profile_id !== existingProf.id) {
        p.profile_id = existingProf.id;
        await supabaseAdmin.from("people").update({
          profile_id: existingProf.id
        }).eq("id", p.id);
      }
    }
    let finalYears = yrs ?? [];
    if (finalYears.length === 0) {
      const startYear = 2026;
      const label = `${startYear}/${startYear + 1}`;
      const {
        data: createdYear
      } = await supabaseAdmin.from("ministry_years").insert({
        start_year: startYear,
        label
      }).select("id,label,start_year").maybeSingle();
      if (createdYear) {
        finalYears = [createdYear];
      }
    }
    return {
      success: true,
      profiles: finalProfiles,
      people: ppl ?? [],
      peopleRoles: pplRoles ?? [],
      userRoles: ur ?? [],
      years: finalYears,
      locations: locs ?? [],
      rules: rls ?? [],
      ruleStops: ruleStops ?? [],
      templates: recTemplates ?? [],
      households: households ?? []
    };
  } catch (err) {
    console.error("serverGetAdminData error:", err);
    return {
      success: false,
      error: err.message,
      profiles: [],
      people: [],
      peopleRoles: [],
      userRoles: [],
      years: [],
      locations: [],
      rules: [],
      ruleStops: [],
      templates: [],
      households: []
    };
  }
});
const serverAddRecurringRule_createServerFn_handler = createServerRpc({
  id: "d6356cb0b92b6dd5a50c26384300833e4b7135bac311fb506222c2467f2630a5",
  name: "serverAddRecurringRule",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverAddRecurringRule.__executeServer(opts));
const serverAddRecurringRule = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverAddRecurringRule_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("recurring_schedule_rules").insert({
      weekday: data.weekday,
      frequency: data.frequency,
      active: true
    });
    if (error) {
      if (error.code === "23505") return {
        success: false,
        error: "Pravilo za ta dan in pogostost že obstaja"
      };
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: true
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Napaka pri dodajanju pravila"
    };
  }
});
const serverRemoveRecurringRule_createServerFn_handler = createServerRpc({
  id: "88f3939f922f37dd93c9205159a488901f2ea20ac1c767467d4e3887d171e1e8",
  name: "serverRemoveRecurringRule",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverRemoveRecurringRule.__executeServer(opts));
const serverRemoveRecurringRule = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverRemoveRecurringRule_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: stops
    } = await supabaseAdmin.from("recurring_schedule_rule_stops").select("id").eq("rule_id", data.id);
    const stopIds = (stops ?? []).map((s) => s.id);
    if (stopIds.length > 0) {
      await supabaseAdmin.from("schedule_stops").delete().in("rule_stop_id", stopIds).is("completed_at", null);
    }
    await supabaseAdmin.from("recurring_schedule_rule_stops").delete().eq("rule_id", data.id);
    await supabaseAdmin.from("recurring_recipient_templates").delete().eq("rule_id", data.id);
    const {
      error
    } = await supabaseAdmin.from("recurring_schedule_rules").delete().eq("id", data.id);
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
const serverAddLocation_createServerFn_handler = createServerRpc({
  id: "d9d38261ae1c0bdd05ae36e31faa77dbda6911ccdaba4029ed546c1622a4ba9a",
  name: "serverAddLocation",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverAddLocation.__executeServer(opts));
const serverAddLocation = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverAddLocation_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("locations").insert({
      name: data.name.trim(),
      active: true
    });
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
const serverRemoveLocation_createServerFn_handler = createServerRpc({
  id: "e0520371a6883efe086935df021768ff100173cf367ceb039e582b2d5f0ea7db",
  name: "serverRemoveLocation",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverRemoveLocation.__executeServer(opts));
const serverRemoveLocation = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverRemoveLocation_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("locations").delete().eq("id", data.id);
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
const serverGenerateMinistryYear_createServerFn_handler = createServerRpc({
  id: "ffb722013d534a2d33085be93501dd97b70f3db1ea57276b11ce2c28b8d90415",
  name: "serverGenerateMinistryYear",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverGenerateMinistryYear.__executeServer(opts));
const serverGenerateMinistryYear = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverGenerateMinistryYear_createServerFn_handler, async ({
  data
}) => {
  try {
    const startYear = Number(data.startYear) || 2026;
    const label = `${startYear}/${startYear + 1}`;
    let ministryYearId;
    const {
      data: existingYear
    } = await supabaseAdmin.from("ministry_years").select("id").eq("start_year", startYear).maybeSingle();
    if (existingYear?.id) {
      ministryYearId = existingYear.id;
    } else {
      const {
        data: created,
        error: createErr
      } = await supabaseAdmin.from("ministry_years").insert({
        start_year: startYear,
        label
      }).select("id").single();
      if (createErr) {
        console.error("Create ministry year error:", createErr);
        return {
          success: false,
          dateCount: 0,
          yearId: "",
          error: createErr.message
        };
      }
      ministryYearId = created.id;
    }
    const [{
      data: activeRules
    }, {
      data: ruleStops
    }, {
      data: recipientTemplates
    }] = await Promise.all([supabaseAdmin.from("recurring_schedule_rules").select("*"), supabaseAdmin.from("recurring_schedule_rule_stops").select("*").order("sort_order"), supabaseAdmin.from("recurring_recipient_templates").select("*")]);
    const rulesList = activeRules ?? [];
    const validDateStrings = /* @__PURE__ */ new Set();
    const dateToRuleMap = /* @__PURE__ */ new Map();
    if (rulesList.length > 0) {
      const startDate = new Date(Date.UTC(startYear, 8, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(startYear + 1, 7, 31, 23, 59, 59));
      for (const rule of rulesList) {
        const ruleWeekday = Number(rule.weekday);
        const d = new Date(startDate.getTime());
        while (d.getUTCDay() !== ruleWeekday) {
          d.setUTCDate(d.getUTCDate() + 1);
        }
        let weekIndex = 0;
        while (d <= endDate) {
          const isMatch = rule.frequency === "weekly" || rule.frequency === "biweekly" && weekIndex % 2 === 0;
          if (isMatch) {
            const dateStr = d.toISOString().slice(0, 10);
            validDateStrings.add(dateStr);
            dateToRuleMap.set(dateStr, rule);
          }
          d.setUTCDate(d.getUTCDate() + 7);
          weekIndex++;
        }
      }
    }
    const {
      data: existingDatesForYear
    } = await supabaseAdmin.from("schedule_dates").select("id,date,schedule_stops(completed_at)").eq("ministry_year_id", ministryYearId);
    for (const exDate of existingDatesForYear ?? []) {
      if (!validDateStrings.has(exDate.date)) {
        const hasCompleted = (exDate.schedule_stops ?? []).some((s) => s.completed_at != null);
        if (!hasCompleted) {
          await supabaseAdmin.from("schedule_stops").delete().eq("schedule_date_id", exDate.id);
          await supabaseAdmin.from("date_recipients").delete().eq("schedule_date_id", exDate.id);
          await supabaseAdmin.from("schedule_dates").delete().eq("id", exDate.id);
        }
      }
    }
    let dateCount = 0;
    for (const dateStr of validDateStrings) {
      const rule = dateToRuleMap.get(dateStr);
      if (!rule) continue;
      let scheduleDateId;
      const {
        data: existingDate
      } = await supabaseAdmin.from("schedule_dates").select("id").eq("ministry_year_id", ministryYearId).eq("date", dateStr).maybeSingle();
      if (existingDate?.id) {
        scheduleDateId = existingDate.id;
      } else {
        const {
          data: newSd,
          error: sdErr
        } = await supabaseAdmin.from("schedule_dates").insert({
          ministry_year_id: ministryYearId,
          date: dateStr,
          status: "pending"
        }).select("id").single();
        if (sdErr) {
          console.error("Error creating schedule_date:", sdErr);
          continue;
        }
        scheduleDateId = newSd.id;
      }
      dateCount++;
      const stopsForRule = (ruleStops ?? []).filter((s) => s.rule_id === rule.id);
      for (const rs of stopsForRule) {
        const {
          data: existingStop
        } = await supabaseAdmin.from("schedule_stops").select("id,driver_id,coordinator_id").eq("schedule_date_id", scheduleDateId).eq("location_id", rs.location_id).limit(1).maybeSingle();
        if (!existingStop) {
          await supabaseAdmin.from("schedule_stops").insert({
            schedule_date_id: scheduleDateId,
            location_id: rs.location_id,
            driver_id: rs.default_driver_id || null,
            coordinator_id: rs.default_coordinator_id || null,
            rule_stop_id: rs.id,
            sort_order: rs.sort_order ?? 0
          });
        }
      }
      const recForRule = (recipientTemplates ?? []).filter((t) => t.rule_id === rule.id);
      for (const tr of recForRule) {
        const {
          data: existingRec
        } = await supabaseAdmin.from("date_recipients").select("id").eq("schedule_date_id", scheduleDateId).eq("household_id", tr.household_id).limit(1).maybeSingle();
        if (!existingRec) {
          await supabaseAdmin.from("date_recipients").insert({
            schedule_date_id: scheduleDateId,
            household_id: tr.household_id
          });
        }
      }
    }
    return {
      success: true,
      dateCount,
      yearId: ministryYearId
    };
  } catch (err) {
    console.error("serverGenerateMinistryYear error:", err);
    return {
      success: false,
      dateCount: 0,
      yearId: "",
      error: err.message
    };
  }
});
const serverToggleRole_createServerFn_handler = createServerRpc({
  id: "1f38ba75c35e29cc19118f6ab0bfacb99b6e56f0eb9abb8280cf0d9955da9f75",
  name: "serverToggleRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverToggleRole.__executeServer(opts));
const serverToggleRole = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverToggleRole_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: existing
    } = await supabaseAdmin.from("people").select("id").or(`profile_id.eq.${data.userId},email.ilike.${data.email || ""}`).limit(1).maybeSingle();
    let personId = existing?.id;
    if (!personId) {
      const first = data.fullName.split(/\s+/)[0] || "";
      const last = data.fullName.split(/\s+/).slice(1).join(" ") || "";
      const {
        data: created,
        error: pErr
      } = await supabaseAdmin.from("people").insert({
        profile_id: data.userId,
        full_name: data.fullName,
        first_name: first || null,
        last_name: last || null,
        email: data.email || null,
        phone: data.phone || null,
        active: true
      }).select("id").single();
      if (pErr) return {
        success: false,
        error: pErr.message
      };
      personId = created?.id;
    }
    if (data.role === "recipient") {
      if (data.enabled) {
        const {
          data: existingHh
        } = await supabaseAdmin.from("recipient_households").select("id").or(`person_id.eq.${personId},name.ilike.${data.fullName}`).limit(1).maybeSingle();
        if (existingHh?.id) {
          await supabaseAdmin.from("recipient_households").update({
            person_id: personId,
            active: true
          }).eq("id", existingHh.id);
        } else {
          await supabaseAdmin.from("recipient_households").insert({
            person_id: personId,
            name: data.fullName,
            contact_name: data.fullName,
            phone: data.phone || null,
            size: 1,
            active: true
          });
        }
      } else {
        await supabaseAdmin.from("recipient_households").update({
          active: false,
          person_id: null
        }).eq("person_id", personId);
      }
      return {
        success: true
      };
    }
    if (personId) {
      if (data.enabled) {
        await supabaseAdmin.from("people_roles").upsert({
          person_id: personId,
          role: data.role
        }, {
          onConflict: "person_id,role"
        });
      } else {
        await supabaseAdmin.from("people_roles").delete().eq("person_id", personId).eq("role", data.role);
      }
    }
    const {
      data: remRoles
    } = await supabaseAdmin.from("people_roles").select("role").eq("person_id", personId);
    const remainingRoles = (remRoles ?? []).map((r) => r.role);
    const isDriverRole = remainingRoles.includes("driver");
    const hasAnyRole = remainingRoles.length > 0;
    const mainRole = remainingRoles.includes("admin") ? "admin" : remainingRoles.includes("coordinator") ? "coordinator" : isDriverRole ? "driver" : null;
    await supabaseAdmin.from("profiles").update({
      is_driver: isDriverRole,
      is_kruh_volunteer: hasAnyRole,
      kruh_role: mainRole
    }).eq("id", data.userId);
    const {
      data: profRow
    } = await supabaseAdmin.from("profiles").select("auth_user_id").eq("id", data.userId).maybeSingle();
    const targetAuthId = data.authUserId || profRow?.auth_user_id || (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.userId) ? data.userId : null);
    if (targetAuthId) {
      if (!data.enabled) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", targetAuthId).eq("role", data.role);
      } else {
        await supabaseAdmin.from("user_roles").upsert({
          user_id: targetAuthId,
          role: data.role
        }, {
          onConflict: "user_id,role"
        });
      }
    }
    return {
      success: true
    };
  } catch (err) {
    console.error("serverToggleRole error:", err);
    return {
      success: false,
      error: err.message
    };
  }
});
const serverSetApproval_createServerFn_handler = createServerRpc({
  id: "f615a201487d54f8e6cc7ca5ea7e0d1f363076763fb2c6d2ca2e80c6a8592532",
  name: "serverSetApproval",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverSetApproval.__executeServer(opts));
const serverSetApproval = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverSetApproval_createServerFn_handler, async ({
  data
}) => {
  try {
    const curApps = data.allowedApps || ["nedelje", "kruh-zivljenja", "kavarna", "ucenja"];
    if (data.status === "rejected") {
      const newApps = curApps.filter((a) => a !== "kruh-zivljenja");
      await supabaseAdmin.from("profiles").update({
        allowed_apps: newApps,
        is_kruh_volunteer: false,
        is_driver: false,
        kruh_role: null,
        approval_status: "rejected"
      }).eq("id", data.userId);
      await supabaseAdmin.from("people").update({
        active: false
      }).eq("profile_id", data.userId);
      return {
        success: true
      };
    } else if (data.status === "approved") {
      const newApps = curApps.includes("kruh-zivljenja") ? curApps : [...curApps, "kruh-zivljenja"];
      await supabaseAdmin.from("profiles").update({
        allowed_apps: newApps,
        is_kruh_volunteer: true,
        approval_status: "approved",
        approved_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", data.userId);
      await supabaseAdmin.from("people").update({
        active: true
      }).eq("profile_id", data.userId);
      return {
        success: true
      };
    }
    return {
      success: true
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.message
    };
  }
});
const serverSyncAllToPeople_createServerFn_handler = createServerRpc({
  id: "b5ae94e6423d013754872f5a2effb7aef42ca09887c4f650e74c1db65e5f6ae4",
  name: "serverSyncAllToPeople",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverSyncAllToPeople.__executeServer(opts));
const serverSyncAllToPeople = createServerFn({
  method: "POST"
}).handler(serverSyncAllToPeople_createServerFn_handler, async () => {
  try {
    const [{
      data: profs
    }, {
      data: ppl
    }] = await Promise.all([supabaseAdmin.from("profiles").select("id,email,full_name,first_name,last_name,name,phone,is_driver").limit(300), supabaseAdmin.from("people").select("id,profile_id,email")]);
    const existingProfileIds = new Set((ppl ?? []).map((p) => p.profile_id).filter(Boolean));
    const existingEmails = new Set((ppl ?? []).map((p) => p.email?.toLowerCase().trim()).filter(Boolean));
    let count = 0;
    for (const pr of profs ?? []) {
      const hasMatch = existingProfileIds.has(pr.id) || pr.email && existingEmails.has(pr.email.toLowerCase().trim());
      if (!hasMatch) {
        const fullName = pr.full_name || [pr.first_name, pr.last_name].filter(Boolean).join(" ") || pr.name || pr.email || "Neznano";
        const first = pr.first_name || fullName.split(/\s+/)[0] || "";
        const last = pr.last_name || fullName.split(/\s+/).slice(1).join(" ") || "";
        const {
          data: created,
          error
        } = await supabaseAdmin.from("people").insert({
          profile_id: pr.id,
          full_name: fullName,
          first_name: first || null,
          last_name: last || null,
          email: pr.email || null,
          phone: pr.phone || null,
          active: true
        }).select("id").single();
        if (!error && created) {
          count++;
          if (pr.is_driver) {
            await supabaseAdmin.from("people_roles").upsert({
              person_id: created.id,
              role: "driver"
            }, {
              onConflict: "person_id,role"
            });
          }
        }
      }
    }
    return {
      success: true,
      count
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      count: 0,
      error: err.message
    };
  }
});
const serverAddRuleStop_createServerFn_handler = createServerRpc({
  id: "d885807138ffbfa4ff11b83fbc3dac63cd042c4873802624680338247c036eae",
  name: "serverAddRuleStop",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverAddRuleStop.__executeServer(opts));
const serverAddRuleStop = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverAddRuleStop_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("recurring_schedule_rule_stops").insert({
      rule_id: data.ruleId,
      location_id: data.locationId,
      sort_order: data.sortOrder
    });
    if (error) {
      if (error.code === "23505") return {
        success: false,
        error: "Ta lokacija je že dodana na to pravilo"
      };
      return {
        success: false,
        error: error.message
      };
    }
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
const serverRemoveRuleStop_createServerFn_handler = createServerRpc({
  id: "500118f713545ca7727b1f17a37784f85b43954023738f96eb891d403695379e",
  name: "serverRemoveRuleStop",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverRemoveRuleStop.__executeServer(opts));
const serverRemoveRuleStop = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverRemoveRuleStop_createServerFn_handler, async ({
  data
}) => {
  try {
    await supabaseAdmin.from("schedule_stops").delete().eq("rule_stop_id", data.id).is("completed_at", null);
    const {
      error
    } = await supabaseAdmin.from("recurring_schedule_rule_stops").delete().eq("id", data.id);
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
const serverUpdateRuleStop_createServerFn_handler = createServerRpc({
  id: "dc3f76093040b9ff3b71e390a7bda2b80181361a5ca1981dca86fdf784c16148",
  name: "serverUpdateRuleStop",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverUpdateRuleStop.__executeServer(opts));
const serverUpdateRuleStop = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverUpdateRuleStop_createServerFn_handler, async ({
  data
}) => {
  try {
    const patch = {};
    if (data.default_driver_id !== void 0) patch.default_driver_id = data.default_driver_id;
    if (data.default_coordinator_id !== void 0) patch.default_coordinator_id = data.default_coordinator_id;
    const {
      error
    } = await supabaseAdmin.from("recurring_schedule_rule_stops").update(patch).eq("id", data.id);
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
const serverAddRuleRecipient_createServerFn_handler = createServerRpc({
  id: "d18a9bbf5a149c5197765bf3045d1d51af701d197b10c48ba4bb78e130da701d",
  name: "serverAddRuleRecipient",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverAddRuleRecipient.__executeServer(opts));
const serverAddRuleRecipient = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverAddRuleRecipient_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("recurring_recipient_templates").insert({
      rule_id: data.ruleId,
      household_id: data.householdId
    });
    if (error) {
      if (error.code === "23505") return {
        success: false,
        error: "Prejemnik je že v predlogi"
      };
      return {
        success: false,
        error: error.message
      };
    }
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
const serverRemoveRuleRecipient_createServerFn_handler = createServerRpc({
  id: "e27f991c04200931aec3a623c9f67e40b0fc7282a14f9dbb4c435831bea45dfe",
  name: "serverRemoveRuleRecipient",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverRemoveRuleRecipient.__executeServer(opts));
const serverRemoveRuleRecipient = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverRemoveRuleRecipient_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      error
    } = await supabaseAdmin.from("recurring_recipient_templates").delete().eq("id", data.id);
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
const serverApplyTemplateToFuture_createServerFn_handler = createServerRpc({
  id: "f44138699df6bede27d0d61588ac6aaf735b1eb4cff2aa10cfa821417103014f",
  name: "serverApplyTemplateToFuture",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverApplyTemplateToFuture.__executeServer(opts));
const serverApplyTemplateToFuture = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverApplyTemplateToFuture_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: targetDates
    } = await supabaseAdmin.from("schedule_dates").select("id,date,schedule_stops!inner(rule_stop_id,recurring_schedule_rule_stops!inner(rule_id))").eq("schedule_stops.recurring_schedule_rule_stops.rule_id", data.ruleId).gte("date", data.fromDate);
    const dateIds = Array.from(new Set((targetDates ?? []).map((d) => d.id)));
    const {
      data: templates
    } = await supabaseAdmin.from("recurring_recipient_templates").select("household_id").eq("rule_id", data.ruleId);
    const templateHhIds = (templates ?? []).map((t) => t.household_id);
    let inserted = 0;
    let deleted = 0;
    for (const did of dateIds) {
      const {
        data: existingRecs
      } = await supabaseAdmin.from("date_recipients").select("id,household_id,force_include").eq("schedule_date_id", did);
      for (const er of existingRecs ?? []) {
        if (!er.force_include && er.household_id && !templateHhIds.includes(er.household_id)) {
          await supabaseAdmin.from("date_recipients").delete().eq("id", er.id);
          deleted++;
        }
      }
      const existingHhIds = new Set((existingRecs ?? []).map((r) => r.household_id).filter(Boolean));
      for (const hid of templateHhIds) {
        if (!existingHhIds.has(hid)) {
          await supabaseAdmin.from("date_recipients").insert({
            schedule_date_id: did,
            household_id: hid
          });
          inserted++;
        }
      }
    }
    return {
      success: true,
      inserted,
      deleted
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      inserted: 0,
      deleted: 0,
      error: err.message
    };
  }
});
const serverApplyAssignmentsToFuture_createServerFn_handler = createServerRpc({
  id: "0f368c92820148f159e6a56d85ad37d7373ac07cabb01c209cec73730a1dd761",
  name: "serverApplyAssignmentsToFuture",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverApplyAssignmentsToFuture.__executeServer(opts));
const serverApplyAssignmentsToFuture = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverApplyAssignmentsToFuture_createServerFn_handler, async ({
  data
}) => {
  try {
    const {
      data: ruleStop
    } = await supabaseAdmin.from("recurring_schedule_rule_stops").select("default_driver_id,default_coordinator_id").eq("id", data.ruleStopId).single();
    if (!ruleStop) return {
      success: false,
      affected: 0,
      error: "Postaja ni najdena"
    };
    const {
      data: targetStops
    } = await supabaseAdmin.from("schedule_stops").select("id,driver_id,coordinator_id,schedule_dates!inner(date)").eq("rule_stop_id", data.ruleStopId).gte("schedule_dates.date", data.fromDate);
    let affected = 0;
    for (const st of targetStops ?? []) {
      const patch = {};
      if (data.override) {
        patch.driver_id = ruleStop.default_driver_id;
        patch.coordinator_id = ruleStop.default_coordinator_id;
      } else {
        if (!st.driver_id && ruleStop.default_driver_id) patch.driver_id = ruleStop.default_driver_id;
        if (!st.coordinator_id && ruleStop.default_coordinator_id) patch.coordinator_id = ruleStop.default_coordinator_id;
      }
      if (Object.keys(patch).length > 0) {
        await supabaseAdmin.from("schedule_stops").update(patch).eq("id", st.id);
        affected++;
      }
    }
    return {
      success: true,
      affected
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      affected: 0,
      error: err.message
    };
  }
});
const serverUpdateRecipientSize_createServerFn_handler = createServerRpc({
  id: "684b1c5997d8eadb553caaa740431691c2806129d2ea00daeb7f757ae1d930b8",
  name: "serverUpdateRecipientSize",
  filename: "src/lib/admin.functions.ts"
}, (opts) => serverUpdateRecipientSize.__executeServer(opts));
const serverUpdateRecipientSize = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverUpdateRecipientSize_createServerFn_handler, async ({
  data
}) => {
  try {
    const size = Math.max(1, Number(data.size) || 1);
    if (data.householdId) {
      await supabaseAdmin.from("recipient_households").update({
        size
      }).eq("id", data.householdId);
      return {
        success: true
      };
    }
    if (data.personId) {
      await supabaseAdmin.from("recipient_households").update({
        size
      }).eq("person_id", data.personId);
      return {
        success: true
      };
    }
    if (data.fullName) {
      await supabaseAdmin.from("recipient_households").update({
        size
      }).ilike("name", data.fullName.trim());
      return {
        success: true
      };
    }
    return {
      success: false,
      error: "Gospodinjstvo ni bilo najdeno"
    };
  } catch (err) {
    console.error("serverUpdateRecipientSize error:", err);
    return {
      success: false,
      error: err.message
    };
  }
});
export {
  bootstrapAdminRoles_createServerFn_handler,
  serverAddLocation_createServerFn_handler,
  serverAddRecurringRule_createServerFn_handler,
  serverAddRuleRecipient_createServerFn_handler,
  serverAddRuleStop_createServerFn_handler,
  serverApplyAssignmentsToFuture_createServerFn_handler,
  serverApplyTemplateToFuture_createServerFn_handler,
  serverGenerateMinistryYear_createServerFn_handler,
  serverGetAdminData_createServerFn_handler,
  serverRemoveLocation_createServerFn_handler,
  serverRemoveRecurringRule_createServerFn_handler,
  serverRemoveRuleRecipient_createServerFn_handler,
  serverRemoveRuleStop_createServerFn_handler,
  serverSetApproval_createServerFn_handler,
  serverSyncAllToPeople_createServerFn_handler,
  serverToggleRole_createServerFn_handler,
  serverUpdateRecipientSize_createServerFn_handler,
  serverUpdateRuleStop_createServerFn_handler
};
