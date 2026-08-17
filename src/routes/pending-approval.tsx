import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LayoutDashboard, LogOut, XCircle } from "lucide-react";

export const Route = createFileRoute("/pending-approval")({
  component: PendingApprovalPage,
});

function PendingApprovalPage() {
  const { user, loading, approvalStatus, isApproved, signOut, refresh } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
    if (isApproved) navigate({ to: "/planner" });
  }, [loading, user, isApproved, navigate]);

  const rejected = approvalStatus === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-5">
          {rejected ? (
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
          ) : (
            <Clock className="h-12 w-12 mx-auto text-primary" />
          )}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {rejected ? t("accessRejectedTitle") : t("pendingApprovalTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {rejected ? t("accessRejectedBody") : t("pendingApprovalBody")}
            </p>
            {user?.email && (
              <p className="text-xs text-muted-foreground pt-2">{user.email}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                {t("openPublicDashboard")}
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => refresh()}>
              {t("checkAgain")}
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t("signOut")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
