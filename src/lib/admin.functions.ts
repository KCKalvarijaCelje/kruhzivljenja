import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { generateProfileSlug } from "@/lib/people.functions";

// Standardize roles: replace any 'superadmin' with 'admin' and ensure bootstrap admin
export const bootstrapAdminRoles = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean }> => {
    try {
      await (supabaseAdmin as any)
        .from("user_roles")
        .update({ role: "admin" })
        .eq("role", "superadmin");

      const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com"];

      const { data: profs } = await (supabaseAdmin as any)
        .from("profiles")
        .select("id,email")
        .in("email", ADMIN_BOOTSTRAP_EMAILS);

      for (const p of profs ?? []) {
        const uid = p.id;
        if (uid) {
          await (supabaseAdmin as any).from("user_roles").upsert(
            { user_id: uid, role: "admin" },
            { onConflict: "user_id,role" }
          );
        }
      }
      return { success: true };
    } catch (err) {
      console.warn("Bootstrap admin roles warning:", err);
      return { success: false };
    }
  }
);

// Unified admin data loader using service role to bypass client RLS issues
export const serverGetAdminData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      await (supabaseAdmin as any)
        .from("user_roles")
        .update({ role: "admin" })
        .eq("role", "superadmin");

      const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com"];
      const { data: profsBootstrap } = await (supabaseAdmin as any)
        .from("profiles")
        .select("id,email")
        .in("email", ADMIN_BOOTSTRAP_EMAILS);

      for (const p of profsBootstrap ?? []) {
        const uid = p.id;
        if (uid) {
          await (supabaseAdmin as any).from("user_roles").upsert(
            { user_id: uid, role: "admin" },
            { onConflict: "user_id,role" }
          );
        }
      }

      const [
        { data: profs },
        { data: ppl },
        { data: pplRoles },
        { data: ur },
        { data: yrs },
        { data: locs },
        { data: rls },
        { data: ruleStops },
        { data: recTemplates },
        { data: households }
      ] = await Promise.all([
        (supabaseAdmin as any)
          .from("profiles")
          .select("id,auth_user_id,email,full_name,phone,notes,active,approval_status,role,kruh_role,is_driver,allowed_apps")
          .order("full_name", { ascending: true })
          .limit(300),
        (supabaseAdmin as any).from("people").select("id,profile_id,full_name,first_name,last_name,email,phone,active").order("full_name").limit(200),
        (supabaseAdmin as any).from("people_roles").select("person_id,role"),
        (supabaseAdmin as any).from("user_roles").select("user_id,role"),
        (supabaseAdmin as any).from("ministry_years").select("id,label,start_year").order("start_year", { ascending: false }).limit(20),
        (supabaseAdmin as any).from("locations").select("id,name,address,active").order("name").limit(100),
        (supabaseAdmin as any).from("recurring_schedule_rules").select("id,weekday,frequency,active").order("weekday").order("frequency"),
        (supabaseAdmin as any).from("recurring_schedule_rule_stops").select("id,rule_id,location_id,sort_order,default_driver_count,locations(name)").order("sort_order"),
        (supabaseAdmin as any).from("recurring_recipient_templates").select("id,rule_id,household_id,recipient_households(name,size)"),
        (supabaseAdmin as any).from("recipient_households").select("id,name,size,person_id,active").order("name").limit(200),
      ]);

      const finalProfiles = [...(profs ?? [])];
      const profIdSet = new Set(finalProfiles.map((p: any) => String(p.id)));
      const profEmailMap = new Map(
        finalProfiles
          .filter((pr: any) => pr.email)
          .map((pr: any) => [pr.email.toLowerCase().trim(), pr])
      );

      const rolesByPerson: Record<string, string[]> = {};
      for (const r of pplRoles ?? []) {
        (rolesByPerson[r.person_id] ||= []).push(r.role);
      }

      for (const p of ppl ?? []) {
        const emailKey = p.email ? p.email.toLowerCase().trim() : null;
        let existingProf = p.profile_id && profIdSet.has(String(p.profile_id))
          ? finalProfiles.find((x: any) => String(x.id) === String(p.profile_id))
          : emailKey
          ? profEmailMap.get(emailKey)
          : null;

        const roles = rolesByPerson[p.id] ?? [];
        const isDriver = roles.includes("driver");
        const hasAnyRole = roles.length > 0;
        const mainRole = roles.includes("admin")
          ? "admin"
          : roles.includes("coordinator")
          ? "coordinator"
          : isDriver
          ? "driver"
          : null;

        if (!existingProf) {
          const baseSlug = generateProfileSlug(p.first_name, p.last_name, p.full_name, p.email);
          let finalId = baseSlug;
          let counter = 2;
          while (profIdSet.has(finalId)) {
            finalId = `${baseSlug}_${counter++}`;
          }

          const fullName =
            p.full_name ||
            [p.first_name, p.last_name].filter(Boolean).join(" ") ||
            "Neznano";

          const profileInsert: any = {
            id: finalId,
            full_name: fullName,
            email: p.email?.trim() || null,
            phone: p.phone?.trim() || null,
            notes: p.notes?.trim() || null,
            active: p.active !== false,
            approval_status: "approved",
          };

          const { data: newProf, error: insErr } = await (supabaseAdmin as any)
            .from("profiles")
            .insert(profileInsert)
            .select("id,email,full_name,phone,notes,active,approval_status")
            .maybeSingle();

          if (newProf?.id) {
            profIdSet.add(newProf.id);
            if (newProf.email) profEmailMap.set(newProf.email.toLowerCase().trim(), newProf);
            finalProfiles.push(newProf);
            p.profile_id = newProf.id;
            await (supabaseAdmin as any).from("people").update({ profile_id: newProf.id }).eq("id", p.id);
          } else if (insErr) {
            console.warn("serverGetAdminData: failed to create profile for", p.full_name, insErr);
          }
        } else if (p.profile_id !== existingProf.id) {
          p.profile_id = existingProf.id;
          await (supabaseAdmin as any).from("people").update({ profile_id: existingProf.id }).eq("id", p.id);
        }
      }

      let finalYears = yrs ?? [];
      if (finalYears.length === 0) {
        const startYear = 2026;
        const label = `${startYear}/${startYear + 1}`;
        const { data: createdYear } = await (supabaseAdmin as any)
          .from("ministry_years")
          .insert({ start_year: startYear, label })
          .select("id,label,start_year")
          .maybeSingle();
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
        households: households ?? [],
      };
    } catch (err: any) {
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
        households: [],
      };
    }
  }
);

export const serverAddRecurringRule = createServerFn({ method: "POST" })
  .inputValidator((data: { weekday: number; frequency: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("recurring_schedule_rules")
        .insert({
          weekday: data.weekday,
          frequency: data.frequency,
          active: true,
        });

      if (error) {
        if (error.code === "23505") return { success: false, error: "Pravilo za ta dan in pogostost že obstaja" };
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Napaka pri dodajanju pravila" };
    }
  });

export const serverRemoveRecurringRule = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: stops } = await (supabaseAdmin as any)
        .from("recurring_schedule_rule_stops")
        .select("id")
        .eq("rule_id", data.id);

      const stopIds = (stops ?? []).map((s: any) => s.id);
      if (stopIds.length > 0) {
        await (supabaseAdmin as any)
          .from("schedule_stops")
          .delete()
          .in("rule_stop_id", stopIds)
          .is("completed_at", null);
      }

      await (supabaseAdmin as any).from("recurring_schedule_rule_stops").delete().eq("rule_id", data.id);
      await (supabaseAdmin as any).from("recurring_recipient_templates").delete().eq("rule_id", data.id);
      const { error } = await (supabaseAdmin as any)
        .from("recurring_schedule_rules")
        .delete()
        .eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverAddLocation = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("locations")
        .insert({ name: data.name.trim(), active: true });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverRemoveLocation = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("locations")
        .delete()
        .eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverGenerateMinistryYear = createServerFn({ method: "POST" })
  .inputValidator((data: { startYear: number }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; dateCount: number; yearId: string; error?: string }> => {
    try {
      const startYear = Number(data.startYear) || 2026;
      const label = `${startYear}/${startYear + 1}`;

      // 1. Find or insert ministry year record
      let ministryYearId: string;
      const { data: existingYear } = await (supabaseAdmin as any)
        .from("ministry_years")
        .select("id")
        .eq("start_year", startYear)
        .maybeSingle();

      if (existingYear?.id) {
        ministryYearId = existingYear.id;
      } else {
        const { data: created, error: createErr } = await (supabaseAdmin as any)
          .from("ministry_years")
          .insert({ start_year: startYear, label })
          .select("id")
          .single();

        if (createErr) {
          console.error("Create ministry year error:", createErr);
          return { success: false, dateCount: 0, yearId: "", error: createErr.message };
        }
        ministryYearId = created.id;
      }

      // 2. Load active rules, stops, and templates
      const [
        { data: activeRules },
        { data: ruleStops },
        { data: recipientTemplates }
      ] = await Promise.all([
        (supabaseAdmin as any).from("recurring_schedule_rules").select("*"),
        (supabaseAdmin as any).from("recurring_schedule_rule_stops").select("*").order("sort_order"),
        (supabaseAdmin as any).from("recurring_recipient_templates").select("*"),
      ]);

      const rulesList = activeRules ?? [];
      const validDateStrings = new Set<string>();
      const dateToRuleMap = new Map<string, any>();

      if (rulesList.length > 0) {
        const startDate = new Date(Date.UTC(startYear, 8, 1, 0, 0, 0)); // Sep 1 UTC
        const endDate = new Date(Date.UTC(startYear + 1, 7, 31, 23, 59, 59)); // Aug 31 UTC

        for (const rule of rulesList) {
          const ruleWeekday = Number(rule.weekday);
          const d = new Date(startDate.getTime());

          while (d.getUTCDay() !== ruleWeekday) {
            d.setUTCDate(d.getUTCDate() + 1);
          }

          let weekIndex = 0;
          while (d <= endDate) {
            const isMatch =
              rule.frequency === "weekly" || (rule.frequency === "biweekly" && weekIndex % 2 === 0);

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

      // 3. Clean up any dates for this year that are NOT in validDateStrings (e.g. leftover from deleted rules)
      const { data: existingDatesForYear } = await (supabaseAdmin as any)
        .from("schedule_dates")
        .select("id,date,schedule_stops(completed_at)")
        .eq("ministry_year_id", ministryYearId);

      for (const exDate of existingDatesForYear ?? []) {
        if (!validDateStrings.has(exDate.date)) {
          const hasCompleted = (exDate.schedule_stops ?? []).some((s: any) => s.completed_at != null);
          if (!hasCompleted) {
            await (supabaseAdmin as any).from("schedule_stops").delete().eq("schedule_date_id", exDate.id);
            await (supabaseAdmin as any).from("date_recipients").delete().eq("schedule_date_id", exDate.id);
            await (supabaseAdmin as any).from("schedule_dates").delete().eq("id", exDate.id);
          }
        }
      }

      // 4. Populate / sync dates that match active rules
      let dateCount = 0;
      for (const dateStr of validDateStrings) {
        const rule = dateToRuleMap.get(dateStr);
        if (!rule) continue;

        let scheduleDateId: string;
        const { data: existingDate } = await (supabaseAdmin as any)
          .from("schedule_dates")
          .select("id")
          .eq("ministry_year_id", ministryYearId)
          .eq("date", dateStr)
          .maybeSingle();

        if (existingDate?.id) {
          scheduleDateId = existingDate.id;
        } else {
          const { data: newSd, error: sdErr } = await (supabaseAdmin as any)
            .from("schedule_dates")
            .insert({ ministry_year_id: ministryYearId, date: dateStr, status: "pending" })
            .select("id")
            .single();

          if (sdErr) {
            console.error("Error creating schedule_date:", sdErr);
            continue;
          }
          scheduleDateId = newSd.id;
        }

        dateCount++;

        // Attach stops for this rule
        const stopsForRule = (ruleStops ?? []).filter((s: any) => s.rule_id === rule.id);
        for (const rs of stopsForRule) {
          const { data: existingStop } = await (supabaseAdmin as any)
            .from("schedule_stops")
            .select("id,driver_id,coordinator_id")
            .eq("schedule_date_id", scheduleDateId)
            .eq("location_id", rs.location_id)
            .limit(1)
            .maybeSingle();

          if (!existingStop) {
            await (supabaseAdmin as any).from("schedule_stops").insert({
              schedule_date_id: scheduleDateId,
              location_id: rs.location_id,
              driver_id: rs.default_driver_id || null,
              coordinator_id: rs.default_coordinator_id || null,
              rule_stop_id: rs.id,
              sort_order: rs.sort_order ?? 0,
            });
          }
        }

        // Attach recipients for this rule
        const recForRule = (recipientTemplates ?? []).filter((t: any) => t.rule_id === rule.id);
        for (const tr of recForRule) {
          const { data: existingRec } = await (supabaseAdmin as any)
            .from("date_recipients")
            .select("id")
            .eq("schedule_date_id", scheduleDateId)
            .eq("household_id", tr.household_id)
            .limit(1)
            .maybeSingle();

          if (!existingRec) {
            await (supabaseAdmin as any).from("date_recipients").insert({
              schedule_date_id: scheduleDateId,
              household_id: tr.household_id,
            });
          }
        }
      }

      return { success: true, dateCount, yearId: ministryYearId };
    } catch (err: any) {
      console.error("serverGenerateMinistryYear error:", err);
      return { success: false, dateCount: 0, yearId: "", error: err.message };
    }
  });

export const serverToggleRole = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      authUserId?: string | null;
      fullName: string;
      email?: string | null;
      phone?: string | null;
      role: "admin" | "driver" | "coordinator" | "recipient";
      enabled: boolean;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: existing } = await (supabaseAdmin as any)
        .from("people")
        .select("id")
        .or(`profile_id.eq.${data.userId},email.ilike.${data.email || ""}`)
        .limit(1)
        .maybeSingle();

      let personId = existing?.id;
      if (!personId) {
        const first = data.fullName.split(/\s+/)[0] || "";
        const last = data.fullName.split(/\s+/).slice(1).join(" ") || "";
        const { data: created, error: pErr } = await (supabaseAdmin as any)
          .from("people")
          .insert({
            profile_id: data.userId,
            full_name: data.fullName,
            first_name: first || null,
            last_name: last || null,
            email: data.email || null,
            phone: data.phone || null,
            active: true,
          })
          .select("id")
          .single();

        if (pErr) return { success: false, error: pErr.message };
        personId = created?.id;
      }

      if (data.role === "recipient") {
        if (data.enabled) {
          const { data: existingHh } = await (supabaseAdmin as any)
            .from("recipient_households")
            .select("id")
            .or(`person_id.eq.${personId},name.ilike.${data.fullName}`)
            .limit(1)
            .maybeSingle();

          if (existingHh?.id) {
            await (supabaseAdmin as any)
              .from("recipient_households")
              .update({ person_id: personId, active: true })
              .eq("id", existingHh.id);
          } else {
            await (supabaseAdmin as any).from("recipient_households").insert({
              person_id: personId,
              name: data.fullName,
              contact_name: data.fullName,
              phone: data.phone || null,
              size: 1,
              active: true,
            });
          }
        } else {
          await (supabaseAdmin as any)
            .from("recipient_households")
            .update({ active: false, person_id: null })
            .eq("person_id", personId);
        }
        return { success: true };
      }

      // Handle Driver, Coordinator, Admin
      if (personId) {
        if (data.enabled) {
          await (supabaseAdmin as any)
            .from("people_roles")
            .upsert({ person_id: personId, role: data.role }, { onConflict: "person_id,role" });
        } else {
          await (supabaseAdmin as any)
            .from("people_roles")
            .delete()
            .eq("person_id", personId)
            .eq("role", data.role);
        }
      }

      // Fetch remaining active roles for this person
      const { data: remRoles } = await (supabaseAdmin as any)
        .from("people_roles")
        .select("role")
        .eq("person_id", personId);

      const remainingRoles: string[] = (remRoles ?? []).map((r: any) => r.role);
      const isDriverRole = remainingRoles.includes("driver");
      const hasAnyRole = remainingRoles.length > 0;
      const mainRole = remainingRoles.includes("admin")
        ? "admin"
        : remainingRoles.includes("coordinator")
        ? "coordinator"
        : isDriverRole
        ? "driver"
        : null;

      // Update profiles
      await (supabaseAdmin as any)
        .from("profiles")
        .update({
          is_driver: isDriverRole,
          is_kruh_volunteer: hasAnyRole,
          kruh_role: mainRole,
        })
        .eq("id", data.userId);

      // Look up target auth user ID
      const { data: profRow } = await (supabaseAdmin as any)
        .from("profiles")
        .select("auth_user_id")
        .eq("id", data.userId)
        .maybeSingle();

      const targetAuthId =
        data.authUserId ||
        profRow?.auth_user_id ||
        (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.userId)
          ? data.userId
          : null);

      if (targetAuthId) {
        if (!data.enabled) {
          await (supabaseAdmin as any)
            .from("user_roles")
            .delete()
            .eq("user_id", targetAuthId)
            .eq("role", data.role);
        } else {
          await (supabaseAdmin as any)
            .from("user_roles")
            .upsert({ user_id: targetAuthId, role: data.role }, { onConflict: "user_id,role" });
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error("serverToggleRole error:", err);
      return { success: false, error: err.message };
    }
  });

export const serverSetApproval = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      userId: string;
      allowedApps?: string[];
      status: "approved" | "rejected" | "pending";
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const curApps = data.allowedApps || ["nedelje", "kruh-zivljenja", "kavarna", "ucenja"];

      if (data.status === "rejected") {
        const newApps = curApps.filter((a) => a !== "kruh-zivljenja");
        await (supabaseAdmin as any)
          .from("profiles")
          .update({
            allowed_apps: newApps,
            is_kruh_volunteer: false,
            is_driver: false,
            kruh_role: null,
            approval_status: "rejected",
          })
          .eq("id", data.userId);

        await (supabaseAdmin as any)
          .from("people")
          .update({ active: false })
          .eq("profile_id", data.userId);

        return { success: true };
      } else if (data.status === "approved") {
        const newApps = curApps.includes("kruh-zivljenja")
          ? curApps
          : [...curApps, "kruh-zivljenja"];

        await (supabaseAdmin as any)
          .from("profiles")
          .update({
            allowed_apps: newApps,
            is_kruh_volunteer: true,
            approval_status: "approved",
            approved_at: new Date().toISOString(),
          })
          .eq("id", data.userId);

        await (supabaseAdmin as any)
          .from("people")
          .update({ active: true })
          .eq("profile_id", data.userId);

        return { success: true };
      }

      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message };
    }
  });

export const serverSyncAllToPeople = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ success: boolean; count: number; error?: string }> => {
    try {
      const [{ data: profs }, { data: ppl }] = await Promise.all([
        (supabaseAdmin as any)
          .from("profiles")
          .select("id,email,full_name,first_name,last_name,name,phone,is_driver")
          .limit(300),
        (supabaseAdmin as any).from("people").select("id,profile_id,email"),
      ]);

      const existingProfileIds = new Set((ppl ?? []).map((p: any) => p.profile_id).filter(Boolean));
      const existingEmails = new Set(
        (ppl ?? []).map((p: any) => p.email?.toLowerCase().trim()).filter(Boolean)
      );

      let count = 0;
      for (const pr of profs ?? []) {
        const hasMatch =
          existingProfileIds.has(pr.id) ||
          (pr.email && existingEmails.has(pr.email.toLowerCase().trim()));

        if (!hasMatch) {
          const fullName =
            pr.full_name ||
            [pr.first_name, pr.last_name].filter(Boolean).join(" ") ||
            pr.name ||
            pr.email ||
            "Neznano";

          const first = pr.first_name || fullName.split(/\s+/)[0] || "";
          const last = pr.last_name || fullName.split(/\s+/).slice(1).join(" ") || "";

          const { data: created, error } = await (supabaseAdmin as any)
            .from("people")
            .insert({
              profile_id: pr.id,
              full_name: fullName,
              first_name: first || null,
              last_name: last || null,
              email: pr.email || null,
              phone: pr.phone || null,
              active: true,
            })
            .select("id")
            .single();

          if (!error && created) {
            count++;
            if (pr.is_driver) {
              await (supabaseAdmin as any)
                .from("people_roles")
                .upsert({ person_id: created.id, role: "driver" }, { onConflict: "person_id,role" });
            }
          }
        }
      }

      return { success: true, count };
    } catch (err: any) {
      console.error(err);
      return { success: false, count: 0, error: err.message };
    }
  }
);

// Template server functions
export const serverAddRuleStop = createServerFn({ method: "POST" })
  .inputValidator((data: { ruleId: string; locationId: string; sortOrder: number }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("recurring_schedule_rule_stops")
        .insert({
          rule_id: data.ruleId,
          location_id: data.locationId,
          sort_order: data.sortOrder,
        });
      if (error) {
        if (error.code === "23505") return { success: false, error: "Ta lokacija je že dodana na to pravilo" };
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverRemoveRuleStop = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      await (supabaseAdmin as any)
        .from("schedule_stops")
        .delete()
        .eq("rule_stop_id", data.id)
        .is("completed_at", null);

      const { error } = await (supabaseAdmin as any)
        .from("recurring_schedule_rule_stops")
        .delete()
        .eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverUpdateRuleStop = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string;
      default_driver_id?: string | null;
      default_coordinator_id?: string | null;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const patch: any = {};
      if (data.default_driver_id !== undefined) patch.default_driver_id = data.default_driver_id;
      if (data.default_coordinator_id !== undefined)
        patch.default_coordinator_id = data.default_coordinator_id;

      const { error } = await (supabaseAdmin as any)
        .from("recurring_schedule_rule_stops")
        .update(patch)
        .eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverAddRuleRecipient = createServerFn({ method: "POST" })
  .inputValidator((data: { ruleId: string; householdId: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("recurring_recipient_templates")
        .insert({
          rule_id: data.ruleId,
          household_id: data.householdId,
        });
      if (error) {
        if (error.code === "23505") return { success: false, error: "Prejemnik je že v predlogi" };
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverRemoveRuleRecipient = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await (supabaseAdmin as any)
        .from("recurring_recipient_templates")
        .delete()
        .eq("id", data.id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

export const serverApplyTemplateToFuture = createServerFn({ method: "POST" })
  .inputValidator((data: { ruleId: string; fromDate: string }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; inserted: number; deleted: number; error?: string }> => {
    try {
      const { data: targetDates } = await (supabaseAdmin as any)
        .from("schedule_dates")
        .select("id,date,schedule_stops!inner(rule_stop_id,recurring_schedule_rule_stops!inner(rule_id))")
        .eq("schedule_stops.recurring_schedule_rule_stops.rule_id", data.ruleId)
        .gte("date", data.fromDate);

      const dateIds = Array.from(new Set((targetDates ?? []).map((d: any) => d.id)));

      const { data: templates } = await (supabaseAdmin as any)
        .from("recurring_recipient_templates")
        .select("household_id")
        .eq("rule_id", data.ruleId);

      const templateHhIds = (templates ?? []).map((t: any) => t.household_id);

      let inserted = 0;
      let deleted = 0;

      for (const did of dateIds) {
        const { data: existingRecs } = await (supabaseAdmin as any)
          .from("date_recipients")
          .select("id,household_id,force_include")
          .eq("schedule_date_id", did);

        for (const er of existingRecs ?? []) {
          if (!er.force_include && er.household_id && !templateHhIds.includes(er.household_id)) {
            await (supabaseAdmin as any).from("date_recipients").delete().eq("id", er.id);
            deleted++;
          }
        }

        const existingHhIds = new Set(
          (existingRecs ?? []).map((r: any) => r.household_id).filter(Boolean)
        );

        for (const hid of templateHhIds) {
          if (!existingHhIds.has(hid)) {
            await (supabaseAdmin as any)
              .from("date_recipients")
              .insert({ schedule_date_id: did, household_id: hid });
            inserted++;
          }
        }
      }

      return { success: true, inserted, deleted };
    } catch (err: any) {
      console.error(err);
      return { success: false, inserted: 0, deleted: 0, error: err.message };
    }
  });

export const serverApplyAssignmentsToFuture = createServerFn({ method: "POST" })
  .inputValidator((data: { ruleStopId: string; fromDate: string; override: boolean }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; affected: number; error?: string }> => {
    try {
      const { data: ruleStop } = await (supabaseAdmin as any)
        .from("recurring_schedule_rule_stops")
        .select("default_driver_id,default_coordinator_id")
        .eq("id", data.ruleStopId)
        .single();

      if (!ruleStop) return { success: false, affected: 0, error: "Postaja ni najdena" };

      const { data: targetStops } = await (supabaseAdmin as any)
        .from("schedule_stops")
        .select("id,driver_id,coordinator_id,schedule_dates!inner(date)")
        .eq("rule_stop_id", data.ruleStopId)
        .gte("schedule_dates.date", data.fromDate);

      let affected = 0;
      for (const st of targetStops ?? []) {
        const patch: any = {};
        if (data.override) {
          patch.driver_id = ruleStop.default_driver_id;
          patch.coordinator_id = ruleStop.default_coordinator_id;
        } else {
          if (!st.driver_id && ruleStop.default_driver_id) patch.driver_id = ruleStop.default_driver_id;
          if (!st.coordinator_id && ruleStop.default_coordinator_id)
            patch.coordinator_id = ruleStop.default_coordinator_id;
        }
        if (Object.keys(patch).length > 0) {
          await (supabaseAdmin as any).from("schedule_stops").update(patch).eq("id", st.id);
          affected++;
        }
      }

      return { success: true, affected };
    } catch (err: any) {
      console.error(err);
      return { success: false, affected: 0, error: err.message };
    }
  });

export const serverUpdateRecipientSize = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      householdId?: string | null;
      personId?: string | null;
      fullName?: string | null;
      size: number;
    }) => data
  )
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      const size = Math.max(1, Number(data.size) || 1);

      if (data.householdId) {
        await (supabaseAdmin as any)
          .from("recipient_households")
          .update({ size })
          .eq("id", data.householdId);
        return { success: true };
      }

      if (data.personId) {
        await (supabaseAdmin as any)
          .from("recipient_households")
          .update({ size })
          .eq("person_id", data.personId);
        return { success: true };
      }

      if (data.fullName) {
        await (supabaseAdmin as any)
          .from("recipient_households")
          .update({ size })
          .ilike("name", data.fullName.trim());
        return { success: true };
      }

      return { success: false, error: "Gospodinjstvo ni bilo najdeno" };
    } catch (err: any) {
      console.error("serverUpdateRecipientSize error:", err);
      return { success: false, error: err.message };
    }
  });
