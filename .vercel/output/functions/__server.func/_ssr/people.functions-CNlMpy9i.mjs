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
function generateProfileSlug(firstName, lastName, fullName, email) {
  const transliterate = (str) => str.toLowerCase().replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  let slug = "";
  if (first && last) {
    slug = `${transliterate(first)}_${transliterate(last)}`;
  } else if (fullName && fullName.trim()) {
    slug = transliterate(fullName.trim());
  } else if (email && email.trim()) {
    slug = transliterate(email.split("@")[0]);
  } else {
    slug = `user_${Date.now().toString(36)}`;
  }
  return `p-${slug}`;
}
async function syncUnlinkedPeopleToProfiles(people, profiles, peopleRoles) {
  const profIdSet = new Set((profiles ?? []).map((p) => String(p.id)));
  const profEmailMap = new Map((profiles ?? []).filter((pr) => pr.email).map((pr) => [pr.email.toLowerCase().trim(), pr]));
  const rolesByPerson = {};
  for (const r of peopleRoles ?? []) {
    (rolesByPerson[r.person_id] ||= []).push(r.role);
  }
  const updatedProfiles = [...profiles ?? []];
  for (const p of people ?? []) {
    const emailKey = p.email ? p.email.toLowerCase().trim() : null;
    let existingProf = p.profile_id && profIdSet.has(String(p.profile_id)) ? updatedProfiles.find((x) => String(x.id) === String(p.profile_id)) : emailKey ? profEmailMap.get(emailKey) : null;
    const roles = rolesByPerson[p.id] ?? [];
    const isDriver = roles.includes("driver");
    roles.length > 0;
    roles.includes("admin") ? "admin" : roles.includes("coordinator") ? "coordinator" : isDriver ? "driver" : null;
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
        updatedProfiles.push(newProf);
        p.profile_id = newProf.id;
        await supabaseAdmin.from("people").update({
          profile_id: newProf.id
        }).eq("id", p.id);
      } else if (insErr) {
        console.warn("Could not auto-create profile for person:", p.full_name, insErr);
      }
    } else if (p.profile_id !== existingProf.id) {
      p.profile_id = existingProf.id;
      await supabaseAdmin.from("people").update({
        profile_id: existingProf.id
      }).eq("id", p.id);
    }
  }
  return updatedProfiles;
}
const serverGetPeopleData_createServerFn_handler = createServerRpc({
  id: "0e399adf27d93761e74c3199fde76d30a7d71660553c49e3832cdec9e2af57c4",
  name: "serverGetPeopleData",
  filename: "src/lib/people.functions.ts"
}, (opts) => serverGetPeopleData.__executeServer(opts));
const serverGetPeopleData = createServerFn({
  method: "GET"
}).handler(serverGetPeopleData_createServerFn_handler, async () => {
  try {
    const [{
      data: people
    }, {
      data: peopleRoles
    }, {
      data: households
    }, {
      data: pickups
    }, {
      data: profilesRaw
    }] = await Promise.all([supabaseAdmin.from("people").select("id, profile_id, full_name, first_name, last_name, email, phone, notes, active").order("full_name").limit(300), supabaseAdmin.from("people_roles").select("person_id,role"), supabaseAdmin.from("recipient_households").select("id, name, contact_name, first_name, address, phone, notes, size, person_id, active").order("name").limit(300), supabaseAdmin.from("driver_pickup_households").select("person_id,household_id").limit(300), supabaseAdmin.from("profiles").select("id, email, full_name, phone, notes, active, approval_status").limit(300)]);
    const profiles = await syncUnlinkedPeopleToProfiles(people ?? [], profilesRaw ?? [], peopleRoles ?? []);
    const rolesByPerson = {};
    for (const r of peopleRoles ?? []) {
      (rolesByPerson[r.person_id] ||= []).push(r.role);
    }
    const householdsByPerson = {};
    for (const h of households ?? []) {
      if (h.person_id) {
        (householdsByPerson[h.person_id] ||= []).push(h);
      }
    }
    const pickupsByPerson = {};
    for (const p of pickups ?? []) {
      (pickupsByPerson[p.person_id] ||= []).push(p.household_id);
    }
    const profMap = new Map((profiles ?? []).map((pr) => [String(pr.id), pr]));
    const profEmailMap = new Map((profiles ?? []).filter((pr) => pr.email).map((pr) => [pr.email.toLowerCase().trim(), pr]));
    const enriched = (people ?? []).map((p) => {
      const hhList = householdsByPerson[p.id] ?? [];
      const primaryHh = hhList[0] ?? null;
      const profile = p.profile_id && profMap.get(String(p.profile_id)) || p.email && profEmailMap.get(p.email.toLowerCase().trim()) || null;
      const roles = (rolesByPerson[p.id] ?? []).map((role) => ({
        role
      }));
      const resolvedAddress = p.address || primaryHh?.address || profile?.address || profile?.street || profile?.home_address || null;
      return {
        ...p,
        address: resolvedAddress,
        people_roles: roles,
        recipient_households: hhList,
        pickupHhIds: pickupsByPerson[p.id] ?? []
      };
    });
    const linkedProfIds = new Set((people ?? []).map((p) => String(p.profile_id)).filter(Boolean));
    const linkedEmails = new Set((people ?? []).map((p) => p.email?.toLowerCase().trim()).filter(Boolean));
    const unlinkedPeople = (profiles ?? []).filter((pr) => !linkedProfIds.has(String(pr.id)) && (!pr.email || !linkedEmails.has(pr.email.toLowerCase().trim()))).map((pr) => ({
      id: `virtual-${pr.id}`,
      profile_id: pr.id,
      full_name: pr.full_name || pr.email || "Neznano",
      first_name: pr.first_name || pr.full_name?.split(" ")[0] || "",
      last_name: pr.last_name || pr.full_name?.split(" ").slice(1).join(" ") || "",
      email: pr.email,
      phone: pr.phone,
      notes: pr.notes,
      active: pr.active !== false,
      address: pr.address || null,
      people_roles: [],
      recipient_households: [],
      pickupHhIds: []
    }));
    const allPeople = [...enriched, ...unlinkedPeople];
    return {
      success: true,
      people: allPeople,
      allHouseholds: (households ?? []).filter((h) => h.active)
    };
  } catch (err) {
    console.error("serverGetPeopleData error:", err);
    return {
      success: false,
      error: err.message,
      people: [],
      allHouseholds: []
    };
  }
});
const serverSavePerson_createServerFn_handler = createServerRpc({
  id: "ca80e46b932e8662b910d9df77f23a3142721e4d2005bdf04ff72f08c82d88a5",
  name: "serverSavePerson",
  filename: "src/lib/people.functions.ts"
}, (opts) => serverSavePerson.__executeServer(opts));
const serverSavePerson = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverSavePerson_createServerFn_handler, async ({
  data
}) => {
  try {
    const first = (data.first_name ?? "").trim();
    const last = (data.last_name ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || (data.full_name ?? "").trim();
    if (!fullName) {
      return {
        success: false,
        error: "Ime je obvezno"
      };
    }
    const personPayload = {
      full_name: fullName,
      first_name: first || null,
      last_name: last || null,
      needs_name_review: !last,
      phone: data.phone?.trim() || null,
      email: data.email?.trim() || null,
      notes: data.notes?.trim() || null,
      active: data.active !== false
    };
    if (data.profile_id) {
      personPayload.profile_id = data.profile_id;
    }
    let personId = data.id && !data.id.startsWith("virtual-") ? data.id : null;
    if (personId) {
      const {
        error: updateErr
      } = await supabaseAdmin.from("people").update(personPayload).eq("id", personId);
      if (updateErr) {
        console.warn("people update error (ignoring non-critical column misses):", updateErr);
      }
    } else {
      const {
        data: created,
        error: insertErr
      } = await supabaseAdmin.from("people").insert(personPayload).select("id").single();
      if (insertErr) return {
        success: false,
        error: insertErr.message
      };
      personId = created?.id;
    }
    if (!personId) {
      return {
        success: false,
        error: "Napaka pri pridobivanju ID-ja osebe"
      };
    }
    await supabaseAdmin.from("people_roles").delete().eq("person_id", personId);
    const rolesToInsert = data.roles ?? [];
    if (rolesToInsert.length > 0) {
      const roleRows = rolesToInsert.map((r) => ({
        person_id: personId,
        role: r
      }));
      await supabaseAdmin.from("people_roles").insert(roleRows);
    }
    let profileId = data.profile_id;
    if (!profileId && data.email) {
      const {
        data: matchedProfile
      } = await supabaseAdmin.from("profiles").select("id").ilike("email", data.email.trim()).limit(1).maybeSingle();
      if (matchedProfile?.id) {
        profileId = matchedProfile.id;
        await supabaseAdmin.from("people").update({
          profile_id: profileId
        }).eq("id", personId);
      }
    }
    const isDriverRole = rolesToInsert.includes("driver");
    const hasAnyRole = rolesToInsert.length > 0;
    const mainKruhRole = rolesToInsert.includes("admin") ? "admin" : rolesToInsert.includes("coordinator") ? "coordinator" : isDriverRole ? "driver" : null;
    if (!profileId) {
      const baseSlug = generateProfileSlug(first, last, fullName, data.email);
      let finalProfileId = baseSlug;
      const {
        data: existingSlugs
      } = await supabaseAdmin.from("profiles").select("id").ilike("id", `${baseSlug}%`);
      if (existingSlugs && existingSlugs.length > 0) {
        const idSet = new Set(existingSlugs.map((s) => s.id));
        let counter = 2;
        while (idSet.has(finalProfileId)) {
          finalProfileId = `${baseSlug}_${counter++}`;
        }
      }
      const profileInsert = {
        id: finalProfileId,
        full_name: fullName,
        name: fullName,
        first_name: first || null,
        last_name: last || null,
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        notes: data.notes?.trim() || null,
        active: data.active !== false,
        approval_status: "approved",
        allowed_apps: ["nedelje", "kruh-zivljenja", "kavarna", "ucenja"],
        is_driver: isDriverRole,
        is_kruh_volunteer: hasAnyRole,
        kruh_role: mainKruhRole
      };
      if (data.address) {
        profileInsert.address = data.address.trim();
      }
      const {
        data: newProfile,
        error: profErr
      } = await supabaseAdmin.from("profiles").insert(profileInsert).select("id").maybeSingle();
      if (newProfile?.id) {
        profileId = newProfile.id;
        await supabaseAdmin.from("people").update({
          profile_id: profileId
        }).eq("id", personId);
      } else if (profErr) {
        console.warn("Could not insert profile into profiles table:", profErr);
      }
    } else {
      const profilePatch = {
        full_name: fullName,
        name: fullName,
        first_name: first || null,
        last_name: last || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        is_driver: isDriverRole,
        is_kruh_volunteer: hasAnyRole,
        kruh_role: mainKruhRole
      };
      if (data.address) {
        profilePatch.address = data.address.trim();
      }
      await supabaseAdmin.from("profiles").update(profilePatch).eq("id", profileId);
      await supabaseAdmin.from("people").update({
        profile_id: profileId
      }).eq("id", personId);
    }
    if (profileId) {
      const {
        data: profRow
      } = await supabaseAdmin.from("profiles").select("auth_user_id").eq("id", profileId).maybeSingle();
      const targetAuthId = profRow?.auth_user_id || (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId) ? profileId : null);
      if (targetAuthId) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", targetAuthId);
        for (const role of rolesToInsert) {
          await supabaseAdmin.from("user_roles").upsert({
            user_id: targetAuthId,
            role
          }, {
            onConflict: "user_id,role"
          });
        }
      }
    }
    const existingHhId = data.household?.id ?? null;
    if (data.isRecipient) {
      const h = data.household;
      const hhAddress = data.address?.trim() || h?.address?.trim() || null;
      const hhPayload = {
        person_id: personId,
        name: (h?.name || fullName).trim(),
        contact_name: fullName,
        address: hhAddress,
        phone: h?.phone?.trim() || data.phone?.trim() || null,
        notes: h?.notes?.trim() || null,
        size: Number(h?.size) || 1,
        active: h?.active !== false
      };
      if (existingHhId) {
        await supabaseAdmin.from("recipient_households").update(hhPayload).eq("id", existingHhId);
      } else {
        const {
          data: exHh
        } = await supabaseAdmin.from("recipient_households").select("id").eq("person_id", personId).limit(1).maybeSingle();
        if (exHh?.id) {
          await supabaseAdmin.from("recipient_households").update(hhPayload).eq("id", exHh.id);
        } else {
          await supabaseAdmin.from("recipient_households").insert(hhPayload);
        }
      }
    } else if (existingHhId) {
      await supabaseAdmin.from("recipient_households").update({
        person_id: null
      }).eq("id", existingHhId);
    }
    await supabaseAdmin.from("driver_pickup_households").delete().eq("person_id", personId);
    const pickupIds = data.pickupHhIds ?? [];
    if (pickupIds.length > 0 && rolesToInsert.includes("driver")) {
      const pickupRows = pickupIds.map((hid) => ({
        person_id: personId,
        household_id: hid
      }));
      await supabaseAdmin.from("driver_pickup_households").insert(pickupRows);
    }
    return {
      success: true,
      personId
    };
  } catch (err) {
    console.error("serverSavePerson error:", err);
    return {
      success: false,
      error: err.message
    };
  }
});
const serverDeletePerson_createServerFn_handler = createServerRpc({
  id: "1729a3b2dea3dfeecfba1b648a282bd41e907753b26e5fd0de42f649b4a838f9",
  name: "serverDeletePerson",
  filename: "src/lib/people.functions.ts"
}, (opts) => serverDeletePerson.__executeServer(opts));
const serverDeletePerson = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(serverDeletePerson_createServerFn_handler, async ({
  data
}) => {
  try {
    if (data.mode === "soft") {
      await supabaseAdmin.from("people").update({
        active: false
      }).eq("id", data.id);
      await supabaseAdmin.from("recipient_households").update({
        active: false
      }).eq("person_id", data.id);
      return {
        success: true
      };
    }
    await supabaseAdmin.from("people_roles").delete().eq("person_id", data.id);
    await supabaseAdmin.from("driver_pickup_households").delete().eq("person_id", data.id);
    await supabaseAdmin.from("recipient_households").update({
      person_id: null
    }).eq("person_id", data.id);
    const {
      error: delErr
    } = await supabaseAdmin.from("people").delete().eq("id", data.id);
    if (delErr) {
      return {
        success: false,
        error: delErr.message
      };
    }
    return {
      success: true
    };
  } catch (err) {
    console.error("serverDeletePerson error:", err);
    return {
      success: false,
      error: err.message
    };
  }
});
export {
  serverDeletePerson_createServerFn_handler,
  serverGetPeopleData_createServerFn_handler,
  serverSavePerson_createServerFn_handler
};
