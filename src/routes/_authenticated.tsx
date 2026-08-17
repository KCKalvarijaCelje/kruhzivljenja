import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading, isAdmin, isApproved, approvalStatus } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const ADMIN_ONLY_PREFIXES = ["/people", "/recipients", "/templates", "/admin", "/email-queue", "/email-templates"];
  const isOnAdminRoute = ADMIN_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const isOnPlannerDetailRoute = pathname.startsWith("/planner/");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: pathname } as any });
    if (!loading && user && approvalStatus !== "unknown" && !isApproved) {
      navigate({ to: "/pending-approval" });
    }
    if (!loading && user && isApproved && !isAdmin && (isOnAdminRoute || isOnPlannerDetailRoute)) {
      navigate({ to: "/planner" });
    }
  }, [loading, user, isApproved, approvalStatus, isAdmin, isOnAdminRoute, isOnPlannerDetailRoute, navigate, pathname]);

  if (loading || !user || (approvalStatus !== "unknown" && !isApproved) || (!isAdmin && (isOnAdminRoute || isOnPlannerDetailRoute))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
