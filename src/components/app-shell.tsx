import { ReactNode } from "react";
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
  ArrowLeftRight,
  Youtube,
  Facebook,
  Instagram,
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EcosystemAppsDropdown } from "@/components/EcosystemAppsDropdown";

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, signOut, user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-['Nohemi',sans-serif] transition-all cursor-pointer whitespace-nowrap";
  const tabActive = "bg-[#93032E] text-white shadow-xs";
  const tabInactive = "text-slate-700 hover:text-[#93032E] hover:bg-slate-100/80";

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Aleš";
  const initial = (firstName[0] || "A").toUpperCase();

  const desktopNav = (
    <>
      <div className="hidden lg:flex items-center gap-1.5 shrink-0">
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
                    ["/email-queue", "/email-templates", "/admin"].some((p) =>
                      pathname.startsWith(p)
                    )
                      ? tabActive
                      : tabInactive
                  }`}
                >
                  <span>Več</span>
                  <ChevronDown className="h-3 w-3 ml-0.5 opacity-80" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-white border border-slate-200 shadow-xl rounded-xl p-1 z-50"
              >
                <DropdownMenuItem asChild>
                  <Link
                    to="/email-queue"
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium py-2 rounded-lg text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{t("emailQueue")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/email-templates"
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium py-2 rounded-lg text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
                  >
                    <FileText className="h-4 w-4" />
                    <span>{t("emailTemplates")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 cursor-pointer text-xs font-medium py-2 rounded-lg text-slate-700 hover:text-[#93032E] hover:bg-slate-50"
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
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 flex flex-col font-sans">
      {/* 1. TOP CRIMSON BAR (#93032E) */}
      <div className="bg-[#93032E] text-white select-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-9 flex items-center justify-between text-xs gap-2">
          {/* Left: App Pill & Description */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider px-2.5 py-0.5 rounded-full uppercase shrink-0 shadow-2xs font-['Nohemi',sans-serif]">
              KRUH ŽIVLJENJA
            </span>
            <span className="text-white/90 text-xs font-medium truncate hidden sm:inline">
              Organizacija prevzema in razdeljevanja hrane KCK
            </span>
          </div>

          {/* Right: Socials, Install, Language, User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Social Icons */}
            <div className="hidden sm:flex items-center gap-1 text-white/80">
              <a
                href="https://www.youtube.com/@KCKCelje"
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-white transition-colors"
                title="YouTube"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.facebook.com/kckcelje"
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-white transition-colors"
                title="Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.instagram.com/kckcelje"
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-white transition-colors"
                title="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Install Button */}
            <button
              type="button"
              className="hidden xs:inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold px-2 py-0.5 rounded shadow-2xs transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>Install</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center rounded bg-black/20 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLang("sl")}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  lang === "sl"
                    ? "bg-white text-[#93032E] shadow-2xs font-extrabold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                SL
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  lang === "en"
                    ? "bg-white text-[#93032E] shadow-2xs font-extrabold"
                    : "text-white/80 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            {/* User Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-full hover:bg-white/10 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <div className="h-5 w-5 rounded-full bg-white text-[#93032E] flex items-center justify-center text-[10px] font-black shadow-2xs">
                      {initial}
                    </div>
                    <span className="truncate max-w-[80px] sm:max-w-[120px]">{firstName}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-50 text-slate-900"
                >
                  <div className="px-2 py-1.5 text-xs">
                    <div className="font-semibold text-slate-900 truncate">
                      {user.user_metadata?.full_name || "Prijavljen uporabnik"}
                    </div>
                    <div className="text-muted-foreground truncate text-[11px]">{user.email}</div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-xs font-medium rounded-lg"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    <span>{t("signOut")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="text-xs text-white/90 hover:text-white font-semibold underline underline-offset-2"
              >
                {t("signIn")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN WHITE NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo: Kalvarija */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="h-9 px-2.5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-[#93032E]/40 hover:bg-slate-50/50 transition-all flex items-center justify-center">
                  <img
                    src="/KCK-logo-rdec_small.png"
                    alt="Krščanska cerkev Kalvarija Celje"
                    className="h-6 md:h-6.5 w-auto object-contain shrink-0"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop / Tablet Nav */}
            {desktopNav}

            {/* Right-side Utilities: Bell, Switch App, Ecosystem Apps Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Notification Bell */}
              <button
                type="button"
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Obvestila"
              >
                <Bell className="h-4 w-4" />
              </button>

              {/* Ecosystem Apps Switcher (9 dots) */}
              <EcosystemAppsDropdown currentApp="kruh" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 md:pb-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 shadow-lg">
        <div className="grid grid-cols-4 gap-1 text-center">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              pathname === "/dashboard"
                ? "text-[#93032E] font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 tracking-tight font-['Nohemi',sans-serif] truncate max-w-full">
              {t("dashboard")}
            </span>
          </Link>

          <Link
            to="/planner"
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
              pathname.startsWith("/planner")
                ? "text-[#93032E] font-bold"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CalendarDays className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 tracking-tight font-['Nohemi',sans-serif] truncate max-w-full">
              {t("planner")}
            </span>
          </Link>

          {isAdmin ? (
            <>
              <Link
                to="/people"
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  pathname.startsWith("/people")
                    ? "text-[#93032E] font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 tracking-tight font-['Nohemi',sans-serif] truncate max-w-full">
                  {t("people")}
                </span>
              </Link>

              <Link
                to="/admin"
                className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer ${
                  pathname.startsWith("/admin")
                    ? "text-[#93032E] font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[9px] mt-0.5 tracking-tight font-['Nohemi',sans-serif] truncate max-w-full">
                  {t("admin")}
                </span>
              </Link>
            </>
          ) : (
            <button
              onClick={signOut}
              className="flex flex-col items-center justify-center py-1 px-1 rounded-xl text-rose-600 transition-all cursor-pointer col-span-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[9px] mt-0.5 tracking-tight font-['Nohemi',sans-serif]">
                {t("signOut")}
              </span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
