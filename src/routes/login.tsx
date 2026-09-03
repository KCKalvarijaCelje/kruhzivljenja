import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { getMediaUrl } from "@/lib/cdn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LayoutDashboard, ChevronDown, ChevronUp, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import logoUrl from "@/assets/logo.webp";
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

  // Standard CDN image from Cloudflare R2, with local fallback
  const breadImgSrc = getMediaUrl("/kruh-bread.webp");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const queryParams = new URLSearchParams(window.location.search);
      const oauthError =
        hashParams.get("error_description") ||
        queryParams.get("error_description") ||
        hashParams.get("error") ||
        queryParams.get("error");
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
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-background via-secondary/30 to-background px-3 sm:px-4 py-4 sm:py-8">
      {/* Top Bar with Language Selector */}
      <div className="w-full max-w-4xl mx-auto flex justify-end items-center mb-3 sm:mb-4">
        <div className="inline-flex items-center gap-1 p-1 bg-card/90 backdrop-blur border rounded-full shadow-xs text-xs font-semibold">
          <button
            onClick={() => setLang("sl")}
            className={`px-2.5 py-1 rounded-full transition-all ${
              lang === "sl"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            }`}
          >
            SL
          </button>
          <button
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded-full transition-all ${
              lang === "en"
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Split-Screen Card */}
      <div className="w-full max-w-4xl mx-auto bg-card border rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all my-auto">
        {/* Left Side: Kruh Bread Banner Image - Full Bleed */}
        <div className="relative md:col-span-5 lg:col-span-6 bg-[#f2e5d7] h-56 sm:h-72 md:h-full md:min-h-[480px] overflow-hidden">
          <img
            src={breadImgSrc}
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith("/kruh-bread.png")) {
                target.src = "/kruh-bread.png";
              }
            }}
            alt="Kruh Življenja"
            className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
          />
        </div>

        {/* Right Side: Sign In Panel */}
        <div className="md:col-span-7 lg:col-span-6 p-5 sm:p-8 lg:p-10 flex flex-col justify-center bg-card">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-secondary/50 border flex items-center justify-center p-2 shadow-xs shrink-0">
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">{t("appName")}</h1>
              <p className="text-[11px] sm:text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                <span>{t("bannerMotto")}</span>
              </p>
            </div>
          </div>

          <div className="mb-4 sm:mb-6 p-2.5 sm:p-3 rounded-xl bg-secondary/60 border text-[11px] sm:text-xs text-muted-foreground leading-relaxed italic">
            {t("verseMatthew")}
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* 1. PRIMARY BASE OPTION: Google 1-Click Sign in */}
            <Button
              onClick={handleGoogle}
              disabled={busy}
              size="lg"
              className="w-full font-bold shadow-sm h-11 sm:h-12 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-transform active:scale-[0.99] cursor-pointer"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GoogleIcon />}
              {busy ? t("signingIn") : lang === "sl" ? "Nadaljuj z Google računom (Gmail)" : t("signInGoogle")}
            </Button>

            {/* 2. SECONDARY OPTION: Collapsible Dropdown for Email Sign In */}
            <div className="pt-0.5">
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
                <form
                  onSubmit={handleEmailSignIn}
                  className="mt-2.5 p-3.5 sm:p-4 bg-secondary/50 rounded-2xl border space-y-3 text-left animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="space-y-1">
                    <Label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "sl" ? "E-poštni naslov" : "Email Address"}
                    </Label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ime@domena.si"
                        className="pl-8 sm:pl-9 text-xs h-9 sm:h-10 bg-card"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {lang === "sl" ? "Geslo" : "Password"}
                    </Label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-8 sm:pl-9 text-xs h-9 sm:h-10 bg-card"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={emailBusy} className="w-full text-xs font-bold h-9 mt-1" size="sm">
                    {emailBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <LogIn className="w-3.5 h-3.5 mr-2" />}
                    <span>
                      {emailBusy
                        ? lang === "sl"
                          ? "Preverjanje..."
                          : "Checking..."
                        : lang === "sl"
                        ? "Prijava z e-pošto"
                        : "Sign in with Email"}
                    </span>
                  </Button>
                </form>
              )}
            </div>

            <div className="pt-2 border-t">
              <Button asChild variant="outline" size="sm" className="w-full text-xs font-medium h-9">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {t("dashboard")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer Section: Separated John 6:35 Scripture Verse */}
      <footer className="mt-4 sm:mt-6 mb-1 w-full max-w-2xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 mb-1 text-primary/70">
          <span className="h-px w-6 bg-primary/20" />
          <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase">
            {lang === "sl" ? "Janez 6,35" : "John 6:35"}
          </span>
          <span className="h-px w-6 bg-primary/20" />
        </div>
        <p className="text-[11px] sm:text-xs md:text-sm italic text-muted-foreground leading-relaxed">
          {t("verseJohn")}
        </p>
      </footer>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#fff"
        d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.66 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.05.78 3.75 1.45l2.55-2.45C16.65 4.36 14.55 3.4 12 3.4 6.94 3.4 2.85 7.5 2.85 12.55s4.09 9.15 9.15 9.15c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.05-.15-1.5z"
      />
    </svg>
  );
}

