import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutDashboard } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { user, loading } = useAuth();
  const { t, lang, setLang } = useI18n();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/planner" });
  }, [user, loading, navigate]);

  const handleGoogle = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/planner`,
      },
    });
    if (error) {
      toast.error(error.message ?? "Sign-in failed");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary px-4">
      <div className="absolute top-4 right-4 flex gap-1 text-xs">
        <button onClick={() => setLang("sl")} className={`px-2 py-1 rounded ${lang === "sl" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>SL</button>
        <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>EN</button>
      </div>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-24 w-24 rounded-2xl bg-card ring-1 ring-border flex items-center justify-center shadow-lg overflow-hidden">
          <img src={logoUrl} alt="KRUH ŽIVLJENJA" className="h-20 w-20 object-contain" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{t("appName")}</h1>
        <p className="mt-2 text-muted-foreground">{t("tagline")}</p>
        <div className="mt-10 bg-card border rounded-2xl p-6 shadow-sm space-y-3">
          <Button onClick={handleGoogle} disabled={busy} size="lg" className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
            {busy ? t("signingIn") : t("signInGoogle")}
          </Button>
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />{t("dashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
      <path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.66 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.65 4.36 14.55 3.4 12 3.4 6.94 3.4 2.85 7.5 2.85 12.55s4.09 9.15 9.15 9.15c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.05-.15-1.5z"/>
    </svg>
  );
}
