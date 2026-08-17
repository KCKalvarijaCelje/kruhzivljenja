import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, CalendarDays, Users, Heart, Settings, LogOut, Repeat, Mail, Home } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { InstallPWAButton } from "@/components/install-pwa-button";

function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex gap-1 text-xs">
      <button
        onClick={() => setLang("sl")}
        className={`px-2 py-1 rounded ${lang === "sl" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        SL
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
      >
        EN
      </button>
    </div>
  );
}

function NavLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Link
      to={to}
      className={className}
      onClick={() => {
        if (isMobile) setOpenMobile(false);
      }}
    >
      {children}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { isAdmin, signOut } = useAuth();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (!isAdmin) {
    const tabBase = "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium transition-colors";
    const tabActive = "bg-primary text-primary-foreground";
    const tabInactive = "text-muted-foreground hover:bg-muted";
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b">
          <div className="max-w-4xl mx-auto h-14 flex items-center gap-2 px-3 sm:px-4">
            <Link to="/planner" className="flex items-center gap-2 font-bold shrink-0">
              <span className="h-8 w-8 rounded-md bg-background ring-1 ring-border flex items-center justify-center overflow-hidden">
                <img src={logoUrl} alt="KRUH ŽIVLJENJA" className="h-7 w-7 object-contain" />
              </span>
            </Link>
            <nav className="flex items-center gap-1 ml-1">
              <Link
                to="/dashboard"
                className={`${tabBase} ${pathname.startsWith("/dashboard") ? tabActive : tabInactive}`}
              >
                <Home className="h-4 w-4" />
                <span>{t("dashboard")}</span>
              </Link>
              <Link
                to="/planner"
                className={`${tabBase} ${pathname === "/planner" || pathname.startsWith("/planner") ? tabActive : tabInactive}`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>{t("planner")}</span>
              </Link>
            </nav>
            <div className="flex-1" />
            <InstallPWAButton />
            <LangSwitch />
            <Button variant="ghost" size="sm" onClick={signOut} className="h-8 px-2">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">{t("signOut")}</span>
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6 overflow-x-clip flex-1">{children}</main>
      </div>
    );
  }

  const navItems = [
    { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/planner", label: t("planner"), icon: CalendarDays },
    { to: "/people", label: t("people"), icon: Users },
    { to: "/recipients", label: t("recipients"), icon: Heart },
    { to: "/templates", label: t("templates"), icon: Repeat },
    { to: "/email-queue", label: t("emailQueue"), icon: Mail },
    { to: "/email-templates", label: t("emailTemplates"), icon: Mail },
    { to: "/admin", label: t("admin"), icon: Settings },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b">
            <Link to="/planner" className="flex items-center gap-2 px-2 py-2 font-bold">
              <span className="h-9 w-9 shrink-0 rounded-lg bg-background ring-1 ring-sidebar-border flex items-center justify-center overflow-hidden">
                <img src={logoUrl} alt="KRUH ŽIVLJENJA" className="h-8 w-8 object-contain" />
              </span>
              <span className="truncate group-data-[collapsible=icon]:hidden text-sm leading-tight">
                {t("appName")}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const active = pathname === item.to || pathname.startsWith(item.to + "/");
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <NavLink to={item.to}>
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <Button variant="ghost" size="sm" onClick={signOut} className="justify-start">
              <LogOut className="h-4 w-4" />
              <span className="group-data-[collapsible=icon]:hidden">{t("signOut")}</span>
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b h-14 flex items-center gap-2 px-4">
            <SidebarTrigger />
            <div className="flex-1" />
            <InstallPWAButton />
            <LangSwitch />
          </header>
          <main className="p-4 md:p-6 overflow-x-clip">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
