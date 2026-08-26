import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, getAuthBroadcastChannel, broadcastAuthChange, performGlobalSignOut } from "@/integrations/supabase/client";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "unknown";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: string[];
  isAdmin: boolean;
  approvalStatus: ApprovalStatus;
  isApproved: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  isAdmin: false,
  approvalStatus: "unknown",
  isApproved: false,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("unknown");

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
      if (prof?.id || userId || emailToMatch) {
        const { data: person } = await supabase
          .from("people")
          .select("id,role,people_roles(role)")
          .or(`profile_id.eq.${prof?.id || userId},email.ilike.${emailToMatch || ""}`)
          .limit(1)
          .maybeSingle();

        matchedPerson = person;
        if (person) {
          const prs = ((person as any).people_roles ?? []).map((r: any) => r.role);
          prs.forEach((r: string) => collectedRoles.add(r));
          if (person.role && String(person.role).toLowerCase().includes("admin")) {
            collectedRoles.add("admin");
          }
        }
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

  const effectiveIsAdmin = isPrimaryAdmin || roles.includes("admin");
  const effectiveIsApproved = isPrimaryAdmin || approvalStatus === "approved";
  const effectiveStatus: ApprovalStatus = isPrimaryAdmin ? "approved" : approvalStatus;

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        roles: isPrimaryAdmin && !roles.includes("admin") ? [...roles, "admin"] : roles,
        isAdmin: effectiveIsAdmin,
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
