import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com"];
  const userEmail = session?.user?.email?.toLowerCase()?.trim();
  const isPrimaryAdmin = !!userEmail && ADMIN_BOOTSTRAP_EMAILS.includes(userEmail);

  const loadUserMeta = async (userId: string, email?: string) => {
    try {
      const emailToMatch = email || userEmail;
      
      const [
        { data: rolesData },
        { data: profById },
        { data: profByAuth },
        { data: profByEmail }
      ] = await Promise.all([
        supabase.from("user_roles").select("role,app").eq("user_id", userId),
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
      }

      // Check linked people & people_roles
      if (prof?.id || userId || emailToMatch) {
        const { data: person } = await supabase
          .from("people")
          .select("id,people_roles(role)")
          .or(`profile_id.eq.${prof?.id || userId},email.ilike.${emailToMatch || ""}`)
          .limit(1)
          .maybeSingle();

        if (person) {
          const prs = ((person as any).people_roles ?? []).map((r: any) => r.role);
          prs.forEach((r: string) => collectedRoles.add(r));
        }
      }

      if (isPrimaryAdmin) {
        collectedRoles.add("admin");
      }

      // Check allowed_apps for Kruh Življenja
      let status: ApprovalStatus = (prof?.approval_status ?? (isPrimaryAdmin ? "approved" : "pending")) as ApprovalStatus;
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
      }
    }
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) {
        setTimeout(() => loadUserMeta(s.user.id, s.user.email), 0);
      } else {
        setRoles([]);
        setApprovalStatus("unknown");
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) loadUserMeta(data.session.user.id, data.session.user.email);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
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
