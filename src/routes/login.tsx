import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LayoutDashboard, ChevronDown, ChevronUp, Mail, Lock, LogIn } from "lucide-react";
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
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const oauthError = hashParams.get("error_description") || queryParams.get("error_description") || hashParams.get("error") || queryParams.get("error");
      if (oauthError) {
        toast.error(`Prijava ni uspela: ${decodeURIComponent(oauthError.replace(/\+/g, " "))}`);
      }
    }
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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setEmailBusy(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        toast.error(error.message || (lang === "sl" ? "Napačno geslo ali e-pošta." : "Invalid credentials"));
        setEmailBusy(false);
        return;
      }

      toast.success(lang === "sl" ? "Uspešna prijava!" : "Signed in successfully!");
      navigate({ to: "/planner" });
    } catch (err: any) {
      toast.error(err?.message || "Sign in error");
      setEmailBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary px-4">
      <div className="absolute top-4 right-4 flex gap-1 text-xs">
        <button onClick={() => setLang("sl")} className={`px-2 py-1 rounded ${lang === "sl" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>SL</button>
        <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground"}`}>EN</button>
      </div>
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-24 w-24 rounded-2xl bg-card ring-1 ring-border flex items-center justify-center shadow-lg overflow-hidden">
          <img src={logoUrl} alt="KRUH ŽIVLJENJA" className="h-20 w-20 object-contain" />
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">{t("appName")}</h1>
        <p className="mt-2 text-muted-foreground">{t("tagline")}</p>
        
        <div className="mt-10 bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          {/* 1. PRIMARY BASE OPTION: Google 1-Click Sign in */}
          <Button onClick={handleGoogle} disabled={busy} size="lg" className="w-full font-bold shadow-sm">
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
            {busy ? t("signingIn") : (lang === "sl" ? "Nadaljuj z Google računom (Gmail)" : t("signInGoogle"))}
          </Button>

          {/* 2. SECONDARY OPTION: Collapsible Dropdown for Email Sign In */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 transition-colors cursor-pointer"
            >
              <span>
                {lang === "sl" ? "Ali pa se prijavi z e-pošto in geslom" : "Or sign in with email and password"}
              </span>
              {showEmailForm ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {showEmailForm && (
              <form onSubmit={handleEmailSignIn} className="mt-3 p-4 bg-secondary/50 rounded-xl border space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "sl" ? "E-poštni naslov" : "Email Address"}
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ime@domena.si"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {lang === "sl" ? "Geslo" : "Password"}
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 text-xs"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={emailBusy} className="w-full text-xs font-bold" size="sm">
                  {emailBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <LogIn className="w-3.5 h-3.5 mr-2" />}
                  <span>{emailBusy ? (lang === "sl" ? "Preverjanje..." : "Checking...") : (lang === "sl" ? "Prijava z e-pošto" : "Sign in with Email")}</span>
                </Button>
              </form>
            )}
          </div>

          <div className="pt-2 border-t">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/dashboard"><LayoutDashboard className="h-4 w-4 mr-2" />{t("dashboard")}</Link>
            </Button>
          </div>
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

