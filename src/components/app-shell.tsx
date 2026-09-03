import { ReactNode, useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import {
  CalendarDays,
  Users,
  Settings,
  Mail,
  Home,
  LogOut,
  ChevronDown,
  Download,
  Bell,
  Youtube,
  Facebook,
  Instagram,
  FileText,
  Smartphone,
  CheckCircle2,
  LogIn,
  SlidersHorizontal,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EcosystemAppsDropdown } from "@/components/EcosystemAppsDropdown";
import { BrandLogo } from "@/components/BrandLogo";

export function AppShell({ children }: { children: ReactNode }) {
  const {
    isAdmin,
    realIsAdmin,
    simulatedRole,
    isSimulating,
    setSimulatedRole,
    signOut,
    user,
    fullName,
    avatarUrl,
  } = useAuth();
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      localStorage.getItem('kck_kruh_pwa_installed') === 'true' ||
      localStorage.getItem('kck_pwa_installed') === 'true'
    ) {
      setIsPwaInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const installedHandler = () => {
      setIsPwaInstalled(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kck_kruh_pwa_installed', 'true');
      }
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsPwaInstalled(true);
        localStorage.setItem('kck_kruh_pwa_installed', 'true');
      }
      setDeferredPrompt(null);
    }
  };

  const adminNavItems = [
    { to: "/dashboard", label: t("dashboard"), icon: Home },
    { to: "/planner", label: t("planner"), icon: CalendarDays },
    { to: "/people", label: t("people"), icon: Users },
    { to: "/email-queue", label: t("emailQueue"), icon: Mail },
    { to: "/admin", label: t("admin"), icon: Settings },
  ];

  const volunteerNavItems = [
    { to: "/dashboard", label: t("dashboard"), icon: Home },
    { to: "/planner", label: t("planner"), icon: CalendarDays },
  ];

  const currentNav = isAdmin ? adminNavItems : volunteerNavItems;

  const tabBase =
    "inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none";
  const tabActive = "bg-[#93032E] text-white shadow-xs";
  const tabInactive = "text-slate-700 hover:text-[#93032E] hover:bg-slate-100/80";

  // Format display name with proper Slovenian diacritics (Š, Č, Ž)
  const formatSlovenianDisplayName = (rawName?: string | null, email?: string | null): string => {
    const emailLower = (email || '').toLowerCase().trim();
    let name = (rawName || '').trim();

    if (emailLower === 'ales.lajlar@gmail.com' || emailLower === 'aleslajlar@gmail.com') {
      return 'Aleš Lajlar';
    }

    if (!name && email) {
      name = email.split('@')[0];
    }

    if (!name) return 'Uporabnik';

    // If name is dot-separated like "kenzley.lajlar" or "whitney.lajlar", format to capitalized words
    if (name.includes('.') && !name.includes(' ')) {
      name = name.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    }

    return name
      .replace(/\bAles\b/g, 'Aleš')
      .replace(/\bales\b/g, 'Aleš')
      .replace(/\bStefan\b/g, 'Štefan')
      .replace(/\bStef\b/g, 'Štef')
      .replace(/\bSpela\b/g, 'Špela')
      .replace(/\bBostjan\b/g, 'Boštjan')
      .replace(/\bBozena\b/g, 'Božena')
      .replace(/\bZiga\b/g, 'Žiga')
      .replace(/\bZan\b/g, 'Žan')
      .replace(/\bCrt\b/g, 'Črt')
      .replace(/\bMatjaz\b/g, 'Matjaž')
      .replace(/\bMarusa\b/g, 'Maruša')
      .replace(/\bAljosa\b/g, 'Aljoša')
      .replace(/\bAnze\b/g, 'Anže')
      .replace(/\bSasa\b/g, 'Saša')
      .replace(/\bBlaz\b/g, 'Blaž');
  };

  const userFullName = formatSlovenianDisplayName(
    fullName || user?.user_metadata?.full_name || user?.user_metadata?.name,
    user?.email
  );
  const initial = (userFullName[0] || 'A').toUpperCase();

  const desktopNav = (
    <>
      <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
        {currentNav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.to ||
            (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`${tabBase} ${active ? tabActive : tabInactive}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Medium Screens (Tablets) */}
      <div className="hidden md:flex lg:hidden items-center gap-1">
        <Link
          to="/dashboard"
          className={`${tabBase} ${pathname === "/dashboard" ? tabActive : tabInactive}`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>{t("dashboard")}</span>
        </Link>
        <Link
          to="/planner"
          className={`${tabBase} ${pathname.startsWith("/planner") ? tabActive : tabInactive}`}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          <span>{t("planner")}</span>
        </Link>
        {isAdmin && (
          <>
            <Link
              to="/people"
              className={`${tabBase} ${pathname.startsWith("/people") ? tabActive : tabInactive}`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t("people")}</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`${tabBase} ${
                    pathname.startsWith("/email") || pathname.startsWith("/admin")
                      ? tabActive
                      : tabInactive
                  }`}
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span>Več</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-50"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/email-queue"
                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{t("emailQueue")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/email-templates"
                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{t("emailTemplates")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t("admin")}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col font-sans">
      {/* 1. TOP CRIMSON BANNER (Identical to localhost:3000 / kalvarija.si) */}
      <div className="bg-[#93032E] text-white text-xs py-1.5 px-4 sm:px-6 shadow-sm border-b border-black/10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: App Pill Badge & Description */}
          <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
            <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 tracking-wider uppercase shadow-2xs">
              KRUH ŽIVLJENJA
            </span>
            <span className="font-bold truncate text-xs sm:text-[13px] tracking-tight text-white">
              {lang === "sl" ? "Organizacija prevzema in razdeljevanja hrane KCK" : "Food pickup & distribution logistics KCK"}
            </span>
          </div>

          {/* Right: Socials, Install, Language, User */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {/* Social Icons & PWA Install */}
            <div className="flex items-center gap-1 sm:gap-1.5 border-r border-white/20 pr-2 sm:pr-3">
              <a
                href="https://www.youtube.com/@KCKalvarija"
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="YouTube"
                aria-label="YouTube"
              >
                <Youtube className="h-3.5 w-3.5 text-rose-300 hover:text-white" />
              </a>
              <a
                href="https://www.facebook.com/kck.celje"
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Facebook"
                aria-label="Facebook"
              >
                <Facebook className="h-3.5 w-3.5 text-blue-200 hover:text-white" />
              </a>
              <a
                href="https://www.instagram.com/kalvarijacelje/"
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-200 hover:text-white" />
              </a>

              {/* Install Button */}
              {!isPwaInstalled && (
                <div className="relative group ml-0.5">
                  <button
                    type="button"
                    onClick={handlePwaInstall}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-xs border border-amber-300/80 hover:scale-105"
                    title={lang === "sl" ? "Namesti aplikacijo Kruh Življenja" : "Install App"}
                  >
                    <Download className="h-3.5 w-3.5 text-slate-950 animate-bounce" />
                    <span className="hidden sm:inline font-black">
                      {lang === "sl" ? "Namesti APP" : "Install App"}
                    </span>
                  </button>

                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-xl shadow-2xl border border-white/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50">
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === "sl" ? "Namesti na telefon / PC" : "Install to Home Screen"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-black/25 rounded-lg p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => setLang("sl")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  lang === "sl"
                    ? "bg-white text-[#93032E] shadow-sm font-black"
                    : "text-white/80 hover:text-white"
                }`}
                title="Slovenski jezik"
              >
                SL
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-[#93032E] shadow-sm font-black"
                    : "text-white/80 hover:text-white"
                }`}
                title="English language"
              >
                EN
              </button>
            </div>

            {/* User Account / Profile Badge with Full Name */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-lg transition cursor-pointer border text-xs font-bold ${
                      isSimulating
                        ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-xs"
                        : "bg-white/15 hover:bg-white/25 text-white border-white/20"
                    }`}
                    title={userFullName}
                  >
                    <div
                      className={`w-5 h-5 rounded-full font-black flex items-center justify-center text-[10px] shrink-0 ${
                        isSimulating ? "bg-slate-950 text-amber-400" : "bg-white text-[#93032E]"
                      }`}
                    >
                      {initial}
                    </div>
                    <span className="hidden sm:inline max-w-[160px] truncate">{userFullName}</span>
                    {isSimulating && (
                      <span className="hidden md:inline-block px-1.5 py-0.2 bg-slate-950 text-amber-300 rounded text-[9px] font-black uppercase tracking-wider">
                        {simulatedRole === "driver" ? t("driver") : simulatedRole === "coordinator" ? t("coordinator") : t("viewer")}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div className="p-2.5 border-b border-slate-100">
                    <div className="font-bold text-xs text-slate-900 truncate">{userFullName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    {realIsAdmin ? (
                      <span className="inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Superadmin
                      </span>
                    ) : (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t("volunteer")}
                      </span>
                    )}
                  </div>

                  {/* ADMIN SIMULATION SECTION */}
                  {realIsAdmin && (
                    <div className="p-2 border-b border-slate-100">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                        <span>{t("adminSimulation")}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: "admin", label: t("adminRole") },
                          { id: "coordinator", label: t("coordinator") },
                          { id: "driver", label: t("driver") },
                          { id: "viewer", label: t("viewer") },
                        ].map((r) => {
                          const active = (simulatedRole === r.id) || (!simulatedRole && r.id === "admin");
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSimulatedRole(r.id === "admin" ? null : (r.id as any))}
                              className={`px-2 py-1.5 rounded-xl text-xs transition-all border text-center cursor-pointer ${
                                active
                                  ? "bg-[#93032E] text-white border-[#93032E] shadow-xs font-bold"
                                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <DropdownMenuItem
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    <span>{t("signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-[#93032E] hover:bg-white/90 font-bold text-xs transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t("signIn")}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Simulation Alert Banner */}
      {isSimulating && (
        <div className="bg-amber-100 border-b border-amber-300/80 px-4 sm:px-6 py-1.5 text-xs text-amber-950 shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-amber-700 shrink-0" />
              <span className="font-bold">{t("simulatingRole")}:</span>
              <span className="font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide">
                {simulatedRole === "driver" ? t("driver") : simulatedRole === "coordinator" ? t("coordinator") : t("viewer")}
              </span>
              <span className="text-amber-800 hidden sm:inline text-[11px]">
                ({lang === "sl" ? "Preizkušate pogled te vloge" : "Previewing page as this role"})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSimulatedRole(null)}
              className="text-xs font-black text-amber-950 underline hover:text-black cursor-pointer shrink-0"
            >
              {t("resetSimulation")} (Admin) &times;
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WHITE NAVIGATION BAR (Identical to localhost:3000 / kalvarija.si) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 sm:py-3.5 border-b border-[#A6A15E]/20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 xl:gap-4">
          {/* Brand Logo: Clean standard KCK logotype */}
          <BrandLogo
            variant="responsive"
            isLight={false}
            className="shrink-0 cursor-pointer"
          />

          {/* Desktop / Tablet Nav */}
          {desktopNav}

          {/* Right-side Utilities: Bell & Ecosystem Apps Dropdown */}
          <div className="flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Notification Bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Obvestila"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* Standardized 9-Dot Ecosystem Apps Dropdown */}
            <EcosystemAppsDropdown currentApp="kruh" isLight={false} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
