import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, getAuthBroadcastChannel, broadcastAuthChange, performGlobalSignOut } from "@/integrations/supabase/client";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "unknown";
export type SimulatedRole = "admin" | "coordinator" | "driver" | "viewer" | null;

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: any;
  fullName: string;
  avatarUrl: string;
  loading: boolean;
  roles: string[];
  realRoles: string[];
  isAdmin: boolean;
  realIsAdmin: boolean;
  simulatedRole: SimulatedRole;
  isSimulating: boolean;
  setSimulatedRole: (role: SimulatedRole) => void;
  approvalStatus: ApprovalStatus;
  isApproved: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  fullName: "",
  avatarUrl: "",
  loading: true,
  roles: [],
  realRoles: [],
  isAdmin: false,
  realIsAdmin: false,
  simulatedRole: null,
  isSimulating: false,
  setSimulatedRole: () => {},
  approvalStatus: "unknown",
  isApproved: false,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("unknown");
  const [simulatedRole, setSimulatedRoleState] = useState<SimulatedRole>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("kck_kruh_simulated_role");
    if (saved && ["admin", "coordinator", "driver", "viewer"].includes(saved)) {
      return saved as SimulatedRole;
    }
    return null;
  });

  const setSimulatedRole = (role: SimulatedRole) => {
    setSimulatedRoleState(role);
    if (typeof window !== "undefined") {
      if (role) {
        localStorage.setItem("kck_kruh_simulated_role", role);
      } else {
        localStorage.removeItem("kck_kruh_simulated_role");
      }
    }
  };

  const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com", "whitney.lajlar@gmail.com"];
  const userEmail = session?.user?.email?.toLowerCase()?.trim();
  const isPrimaryAdmin = !!userEmail && ADMIN_BOOTSTRAP_EMAILS.includes(userEmail);

  const loadUserMeta = async (userId: string, email?: string) => {
    try {
      const emailToMatch = (email || userEmail || "").toLowerCase().trim();
      
      const [
        { data: rolesData },
        { data: profById },
        { data: profByAuth },
        { data: profByEmail }
      ] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("*").eq("auth_user_id", userId).maybeSingle(),
        emailToMatch ? supabase.from("profiles").select("*").ilike("email", emailToMatch).maybeSingle() : Promise.resolve({ data: null })
      ]);

      const prof: any = profById || profByAuth || profByEmail;

      const collectedRoles: Set<string> = new Set(
        (rolesData ?? [])
          .map((r: any) => r.role)
          .filter(Boolean)
      );

      // Add roles from profiles table
      if (prof) {
        if (prof.is_driver) collectedRoles.add("driver");
        if (prof.kruh_role && ["driver", "coordinator", "admin"].includes(prof.kruh_role)) {
          collectedRoles.add(prof.kruh_role);
        }
        if (prof.role) {
          const rLower = String(prof.role).toLowerCase();
          if (rLower.includes("admin") || rLower.includes("leader")) {
            collectedRoles.add("admin");
          }
        }
      }

      // Check linked people & people_roles
      let matchedPerson: any = null;
      try {
        const queryFilters: string[] = [];
        if (prof?.id) queryFilters.push(`profile_id.eq.${prof.id}`);
        else if (userId) queryFilters.push(`profile_id.eq.${userId}`);
        if (emailToMatch) queryFilters.push(`email.ilike.${emailToMatch}`);

        if (queryFilters.length > 0) {
          const { data: person } = await supabase
            .from("people")
            .select("id, full_name, profile_id, email")
            .or(queryFilters.join(","))
            .limit(1)
            .maybeSingle();

          matchedPerson = person;
          if (person?.id) {
            const { data: prs } = await supabase
              .from("people_roles")
              .select("role")
              .eq("person_id", person.id);

            (prs ?? []).forEach((r: any) => {
              if (r.role) collectedRoles.add(r.role);
            });
          }
        }
      } catch (e) {
        console.warn("Could not check linked person/roles:", e);
      }

      if (isPrimaryAdmin) {
        collectedRoles.add("admin");
      }

      // Automatically approve known users from profiles or people, or anyone with roles
      const isKnownMember = Boolean(prof || matchedPerson || collectedRoles.size > 0 || isPrimaryAdmin);
      let status: ApprovalStatus = prof?.approval_status ? (prof.approval_status as ApprovalStatus) : (isKnownMember ? "approved" : "approved");

      if (prof?.allowed_apps && Array.isArray(prof.allowed_apps) && !prof.allowed_apps.includes("kruh-zivljenja") && !isPrimaryAdmin) {
        status = "rejected";
      }

      setProfile(prof || null);
      const metaName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "";
      const rawName = prof?.full_name || prof?.name || matchedPerson?.name || metaName || (emailToMatch ? emailToMatch.split("@")[0] : "");
      setFullName(rawName);
      setAvatarUrl(prof?.avatar_url || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || "");

      setRoles(Array.from(collectedRoles));
      setApprovalStatus(isPrimaryAdmin ? "approved" : status);
    } catch (err) {
      console.warn("Failed to load user meta:", err);
      if (isPrimaryAdmin) {
        setRoles(["admin"]);
        setApprovalStatus("approved");
      } else {
        setApprovalStatus("approved");
      }
    }
  };

  const syncSession = async (s: Session | null) => {
    setSession(s);
    if (s?.user) {
      await loadUserMeta(s.user.id, s.user.email);
    } else {
      setProfile(null);
      setFullName("");
      setAvatarUrl("");
      setRoles([]);
      setApprovalStatus("unknown");
    }
    setLoading(false);
  };

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session);
    }).catch(() => setLoading(false));

    // 2. Supabase Auth State Change Listener
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      syncSession(s);
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        broadcastAuthChange('GLOBAL_SIGNIN');
      } else if (event === 'SIGNED_OUT') {
        broadcastAuthChange('GLOBAL_SIGNOUT');
      }
    });

    // 3. Cross-Tab & Cross-Subdomain Broadcast Listener
    const channel = getAuthBroadcastChannel();
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data?.type === 'GLOBAL_SIGNOUT') {
          syncSession(null);
        } else if (e.data?.type === 'GLOBAL_SIGNIN') {
          supabase.auth.getSession().then(({ data }) => {
            syncSession(data.session);
          });
        }
      };
    }

    // 4. Tab Focus & Visibility Sync
    const handleTabFocus = () => {
      supabase.auth.getSession().then(({ data }) => {
        syncSession(data.session);
      }).catch(() => {});
    };

    window.addEventListener('focus', handleTabFocus);
    document.addEventListener('visibilitychange', handleTabFocus);

    return () => {
      sub.subscription.unsubscribe();
      if (channel) channel.close();
      window.removeEventListener('focus', handleTabFocus);
      document.removeEventListener('visibilitychange', handleTabFocus);
    };
  }, []);

  const signOut = async () => {
    await performGlobalSignOut();
    window.location.href = "/login";
  };

  const refresh = async () => {
    if (session?.user) await loadUserMeta(session.user.id, session.user.email);
  };

  const realIsAdmin = isPrimaryAdmin || roles.includes("admin");
  const realRoles = isPrimaryAdmin && !roles.includes("admin") ? [...roles, "admin"] : roles;

  let effectiveIsAdmin = realIsAdmin;
  let effectiveRoles = realRoles;
  const isSimulating = realIsAdmin && simulatedRole !== null && simulatedRole !== "admin";

  if (realIsAdmin && simulatedRole) {
    if (simulatedRole === "admin") {
      effectiveIsAdmin = true;
      effectiveRoles = realRoles;
    } else if (simulatedRole === "coordinator") {
      effectiveIsAdmin = false;
      effectiveRoles = ["coordinator"];
    } else if (simulatedRole === "driver") {
      effectiveIsAdmin = false;
      effectiveRoles = ["driver"];
    } else if (simulatedRole === "viewer") {
      effectiveIsAdmin = false;
      effectiveRoles = [];
    }
  }

  const effectiveIsApproved = isPrimaryAdmin || approvalStatus === "approved";
  const effectiveStatus: ApprovalStatus = isPrimaryAdmin ? "approved" : approvalStatus;

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        profile,
        fullName,
        avatarUrl,
        loading,
        roles: effectiveRoles,
        realRoles,
        isAdmin: effectiveIsAdmin,
        realIsAdmin,
        simulatedRole: realIsAdmin ? simulatedRole : null,
        isSimulating,
        setSimulatedRole,
        approvalStatus: effectiveStatus,
        isApproved: effectiveIsApproved,
        signOut,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
