import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PersonSaveInput = {
  id?: string | null;
  profile_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  active: boolean;
  roles: ("driver" | "coordinator" | "admin")[];
  isRecipient?: boolean;
  household?: {
    id?: string | null;
    name?: string | null;
    address?: string | null;
    phone?: string | null;
    notes?: string | null;
    size?: number | null;
    active?: boolean;
  } | null;
  pickupHhIds?: string[];
};

export function generateProfileSlug(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
  email?: string | null
): string {
  const transliterate = (str: string) =>
    str
      .toLowerCase()
      .replace(/č/g, "c")
      .replace(/ć/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

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

async function syncUnlinkedPeopleToProfiles(
  people: any[],
  profiles: any[],
  peopleRoles: any[]
): Promise<any[]> {
  const profIdSet = new Set((profiles ?? []).map((p: any) => String(p.id)));
  const profEmailMap = new Map(
    (profiles ?? [])
      .filter((pr: any) => pr.email)
      .map((pr: any) => [pr.email.toLowerCase().trim(), pr])
  );

  const rolesByPerson: Record<string, string[]> = {};
  for (const r of peopleRoles ?? []) {
    (rolesByPerson[r.person_id] ||= []).push(r.role);
  }

  const updatedProfiles = [...(profiles ?? [])];

  for (const p of people ?? []) {
    const emailKey = p.email ? p.email.toLowerCase().trim() : null;
    let existingProf = p.profile_id && profIdSet.has(String(p.profile_id))
      ? updatedProfiles.find((x: any) => String(x.id) === String(p.profile_id))
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
        updatedProfiles.push(newProf);
        p.profile_id = newProf.id;
        await (supabaseAdmin as any).from("people").update({ profile_id: newProf.id }).eq("id", p.id);
      } else if (insErr) {
        console.warn("Could not auto-create profile for person:", p.full_name, insErr);
      }
    } else if (p.profile_id !== existingProf.id) {
      p.profile_id = existingProf.id;
      await (supabaseAdmin as any).from("people").update({ profile_id: existingProf.id }).eq("id", p.id);
    }
  }

  return updatedProfiles;
}

export const serverGetPeopleData = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const [
        { data: people },
        { data: peopleRoles },
        { data: households },
        { data: pickups },
        { data: profilesRaw }
      ] = await Promise.all([
        (supabaseAdmin as any)
          .from("people")
          .select("id, profile_id, full_name, first_name, last_name, email, phone, notes, active")
          .order("full_name")
          .limit(300),
        (supabaseAdmin as any).from("people_roles").select("person_id,role"),
        (supabaseAdmin as any)
          .from("recipient_households")
          .select("id, name, contact_name, first_name, address, phone, notes, size, person_id, active")
          .order("name")
          .limit(300),
        (supabaseAdmin as any).from("driver_pickup_households").select("person_id,household_id").limit(300),
        (supabaseAdmin as any)
          .from("profiles")
          .select("id, email, full_name, phone, notes, active, approval_status")
          .limit(300),
      ]);

      const profiles = await syncUnlinkedPeopleToProfiles(people ?? [], profilesRaw ?? [], peopleRoles ?? []);

      const rolesByPerson: Record<string, string[]> = {};
      for (const r of peopleRoles ?? []) {
        (rolesByPerson[r.person_id] ||= []).push(r.role);
      }

      const householdsByPerson: Record<string, any[]> = {};
      for (const h of households ?? []) {
        if (h.person_id) {
          (householdsByPerson[h.person_id] ||= []).push(h);
        }
      }

      const pickupsByPerson: Record<string, string[]> = {};
      for (const p of pickups ?? []) {
        (pickupsByPerson[p.person_id] ||= []).push(p.household_id);
      }

      const profMap = new Map((profiles ?? []).map((pr: any) => [String(pr.id), pr]));
      const profEmailMap = new Map(
        (profiles ?? [])
          .filter((pr: any) => pr.email)
          .map((pr: any) => [pr.email.toLowerCase().trim(), pr])
      );

      const enriched = (people ?? [])
        .map((p: any) => {
          const hhList = householdsByPerson[p.id] ?? [];
          const primaryHh = hhList[0] ?? null;
          const profile =
            (p.profile_id && profMap.get(String(p.profile_id))) ||
            (p.email && profEmailMap.get(p.email.toLowerCase().trim())) ||
            null;

          const roles = (rolesByPerson[p.id] ?? []).map((role) => ({ role }));
          const resolvedAddress =
            p.address ||
            primaryHh?.address ||
            profile?.address ||
            profile?.street ||
            profile?.home_address ||
            null;

          return {
            ...p,
            address: resolvedAddress,
            people_roles: roles,
            recipient_households: hhList,
            pickupHhIds: pickupsByPerson[p.id] ?? [],
          };
        })
        .filter((p: any) => {
          // Only include people with active Kruh roles, recipient households, or pickup assignments
          const hasRoles = p.people_roles && p.people_roles.length > 0;
          const hasHouseholds = p.recipient_households && p.recipient_households.length > 0;
          const hasPickups = p.pickupHhIds && p.pickupHhIds.length > 0;
          const isKruhFlagged = Boolean(p.is_recipient || p.is_driver || p.is_kruh_volunteer || p.kruh_role);
          return hasRoles || hasHouseholds || hasPickups || isKruhFlagged;
        });

      return {
        success: true,
        people: enriched,
        allHouseholds: (households ?? []).filter((h: any) => h.active),
      };
    } catch (err: any) {
      console.error("serverGetPeopleData error:", err);
      return {
        success: false,
        error: err.message,
        people: [],
        allHouseholds: [],
      };
    }
  }
);

export const serverSavePerson = createServerFn({ method: "POST" })
  .inputValidator((data: PersonSaveInput) => data)
  .handler(async ({ data }): Promise<{ success: boolean; personId?: string; error?: string }> => {
    try {
      const first = (data.first_name ?? "").trim();
      const last = (data.last_name ?? "").trim();
      const fullName = [first, last].filter(Boolean).join(" ") || (data.full_name ?? "").trim();

      if (!fullName) {
        return { success: false, error: "Ime je obvezno" };
      }

      const personPayload: any = {
        full_name: fullName,
        first_name: first || null,
        last_name: last || null,
        needs_name_review: !last,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        notes: data.notes?.trim() || null,
        active: data.active !== false,
      };

      if (data.profile_id) {
        personPayload.profile_id = data.profile_id;
      }

      let personId = data.id;

      // 1. Insert or update people record
      if (personId) {
        const { error: updateErr } = await (supabaseAdmin as any)
          .from("people")
          .update(personPayload)
          .eq("id", personId);

        if (updateErr) {
          console.warn("people update error (ignoring non-critical column misses):", updateErr);
        }
      } else {
        const { data: created, error: insertErr } = await (supabaseAdmin as any)
          .from("people")
          .insert(personPayload)
          .select("id")
          .single();

        if (insertErr) return { success: false, error: insertErr.message };
        personId = created?.id;
      }

      if (!personId) {
        return { success: false, error: "Napaka pri pridobivanju ID-ja osebe" };
      }

      // 2. Synchronize people_roles table
      await (supabaseAdmin as any).from("people_roles").delete().eq("person_id", personId);
      const rolesToInsert = data.roles ?? [];
      if (rolesToInsert.length > 0) {
        const roleRows = rolesToInsert.map((r) => ({
          person_id: personId,
          role: r,
        }));
        await (supabaseAdmin as any).from("people_roles").insert(roleRows);
      }

      // 3. Synchronize church profile & user_roles (creates or updates church directory profile)
      let profileId = data.profile_id;
      if (!profileId && data.email) {
        const { data: matchedProfile } = await (supabaseAdmin as any)
          .from("profiles")
          .select("id")
          .ilike("email", data.email.trim())
          .limit(1)
          .maybeSingle();

        if (matchedProfile?.id) {
          profileId = matchedProfile.id;
          await (supabaseAdmin as any)
            .from("people")
            .update({ profile_id: profileId })
            .eq("id", personId);
        }
      }

      const isDriverRole = rolesToInsert.includes("driver");
      const hasAnyRole = rolesToInsert.length > 0;
      const mainKruhRole = rolesToInsert.includes("admin")
        ? "admin"
        : rolesToInsert.includes("coordinator")
        ? "coordinator"
        : isDriverRole
        ? "driver"
        : null;

      if (!profileId) {
        // Create brand new profile in central church directory with p- slug id
        const baseSlug = generateProfileSlug(first, last, fullName, data.email);
        let finalProfileId = baseSlug;

        const { data: existingSlugs } = await (supabaseAdmin as any)
          .from("profiles")
          .select("id")
          .ilike("id", `${baseSlug}%`);

        if (existingSlugs && existingSlugs.length > 0) {
          const idSet = new Set(existingSlugs.map((s: any) => s.id));
          let counter = 2;
          while (idSet.has(finalProfileId)) {
            finalProfileId = `${baseSlug}_${counter++}`;
          }
        }

        const profileInsert: any = {
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
          kruh_role: mainKruhRole,
        };

        if (data.address) {
          profileInsert.address = data.address.trim();
        }

        const { data: newProfile, error: profErr } = await (supabaseAdmin as any)
          .from("profiles")
          .insert(profileInsert)
          .select("id")
          .maybeSingle();

        if (newProfile?.id) {
          profileId = newProfile.id;
          await (supabaseAdmin as any)
            .from("people")
            .update({ profile_id: profileId })
            .eq("id", personId);
        } else if (profErr) {
          console.warn("Could not insert profile into profiles table:", profErr);
        }
      } else {
        // Update existing profile in central church directory
        const profilePatch: any = {
          full_name: fullName,
          name: fullName,
          first_name: first || null,
          last_name: last || null,
          phone: data.phone?.trim() || null,
          email: data.email?.trim() || null,
          is_driver: isDriverRole,
          is_kruh_volunteer: hasAnyRole,
          kruh_role: mainKruhRole,
        };

        if (data.address) {
          profilePatch.address = data.address.trim();
        }

        await (supabaseAdmin as any)
          .from("profiles")
          .update(profilePatch)
          .eq("id", profileId);

        await (supabaseAdmin as any)
          .from("people")
          .update({ profile_id: profileId })
          .eq("id", personId);
      }

      if (profileId) {
        // Fetch auth_user_id from profile
        const { data: profRow } = await (supabaseAdmin as any)
          .from("profiles")
          .select("auth_user_id")
          .eq("id", profileId)
          .maybeSingle();

        const targetAuthId =
          profRow?.auth_user_id ||
          (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)
            ? profileId
            : null);

        if (targetAuthId) {
          await (supabaseAdmin as any)
            .from("user_roles")
            .delete()
            .eq("user_id", targetAuthId);

          for (const role of rolesToInsert) {
            await (supabaseAdmin as any).from("user_roles").upsert(
              { user_id: targetAuthId, role },
              { onConflict: "user_id,role" }
            );
          }
        }
      }

      // 4. Recipient Household sync
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
          active: h?.active !== false,
        };

        if (existingHhId) {
          await (supabaseAdmin as any)
            .from("recipient_households")
            .update(hhPayload)
            .eq("id", existingHhId);
        } else {
          // Check if one already exists by person_id
          const { data: exHh } = await (supabaseAdmin as any)
            .from("recipient_households")
            .select("id")
            .eq("person_id", personId)
            .limit(1)
            .maybeSingle();

          if (exHh?.id) {
            await (supabaseAdmin as any)
              .from("recipient_households")
              .update(hhPayload)
              .eq("id", exHh.id);
          } else {
            await (supabaseAdmin as any).from("recipient_households").insert(hhPayload);
          }
        }
      } else if (existingHhId) {
        // Unlink person from household so recipient assignments stay intact
        await (supabaseAdmin as any)
          .from("recipient_households")
          .update({ person_id: null })
          .eq("id", existingHhId);
      }

      // 5. Driver Pickup Households
      await (supabaseAdmin as any)
        .from("driver_pickup_households")
        .delete()
        .eq("person_id", personId);

      const pickupIds = data.pickupHhIds ?? [];
      if (pickupIds.length > 0 && rolesToInsert.includes("driver")) {
        const pickupRows = pickupIds.map((hid) => ({
          person_id: personId,
          household_id: hid,
        }));
        await (supabaseAdmin as any).from("driver_pickup_households").insert(pickupRows);
      }

      return { success: true, personId };
    } catch (err: any) {
      console.error("serverSavePerson error:", err);
      return { success: false, error: err.message };
    }
  });

export const serverDeletePerson = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; mode: "hard" | "soft" }) => data)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    try {
      if (data.mode === "soft") {
        await (supabaseAdmin as any)
          .from("people")
          .update({ active: false })
          .eq("id", data.id);

        await (supabaseAdmin as any)
          .from("recipient_households")
          .update({ active: false })
          .eq("person_id", data.id);

        return { success: true };
      }

      // Hard Delete (Scoped strictly to Kruh Življenja)
      await (supabaseAdmin as any)
        .from("people_roles")
        .delete()
        .eq("person_id", data.id);

      await (supabaseAdmin as any)
        .from("driver_pickup_households")
        .delete()
        .eq("person_id", data.id);

      await (supabaseAdmin as any)
        .from("recipient_households")
        .update({ person_id: null })
        .eq("person_id", data.id);

      const { error: delErr } = await (supabaseAdmin as any)
        .from("people")
        .delete()
        .eq("id", data.id);

      if (delErr) {
        return { success: false, error: delErr.message };
      }

      return { success: true };
    } catch (err: any) {
      console.error("serverDeletePerson error:", err);
      return { success: false, error: err.message };
    }
  });
