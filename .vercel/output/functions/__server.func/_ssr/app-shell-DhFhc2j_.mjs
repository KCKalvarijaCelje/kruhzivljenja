import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAuth, a as useI18n } from "./router-Yc5lMt1t.mjs";
import { R as Root2, T as Trigger, P as Portal2, C as Content2, I as Item2, S as SubTrigger2, a as SubContent2, b as CheckboxItem2, c as ItemIndicator2, d as RadioItem2, L as Label2, e as Separator2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { c as cn } from "./utils-BhSPcRjB.mjs";
import { r as House, h as CalendarDays, U as Users, M as Mail, s as Settings, e as ChevronDown, F as FileText, Y as Youtube, t as Facebook, I as Instagram, D as Download, u as Smartphone, v as SlidersHorizontal, b as LogOut, g as LogIn, E as Eye, w as Bell, x as ChevronRight, y as Check, z as Circle } from "../_libs/lucide-react.mjs";
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
const CORE_APPS = [
  {
    key: "main",
    name: "Kalvarija Celje",
    subtitle: "Uradni portal cerkve",
    icon: "⛪",
    prodUrl: "https://kalvarija.si",
    devPort: 3e3
  },
  {
    key: "nedelje",
    name: "Organizacija Nedelj",
    subtitle: "Razporedi, službe in šola",
    icon: "📅",
    prodUrl: "https://nedelje.kalvarija.si",
    devPort: 3001
  },
  {
    key: "ucenja",
    name: "Arhiv Učenj",
    subtitle: "Pridige, zvočni & video posnetki",
    icon: "📖",
    prodUrl: "https://ucenja.kalvarija.si",
    devPort: 3002
  },
  {
    key: "kruh",
    name: "Kruh Življenja",
    subtitle: "Prehranska pomoč & logistika",
    icon: "🍞",
    prodUrl: "https://kruhzivljenja.kalvarija.si",
    devPort: 5173
  }
];
const STANDALONE_APPS = [
  {
    key: "vodnik",
    name: "Osebni Vodnik",
    subtitle: "Učeništvo, mentorstvo & navade",
    icon: "🧭",
    badge: "Učeništvo",
    isStandalone: true,
    prodUrl: "https://osebnivodnik.kalvarija.si",
    devPort: 3003
  },
  {
    key: "zivavera",
    name: "Kavarna Živa Vera",
    subtitle: "Kavarna & skupnostni prostor",
    icon: "☕",
    badge: "Kavarna",
    isStandalone: true,
    prodUrl: "https://zivavera.kalvarija.si",
    devPort: 8080
  }
];
const EcosystemAppsDropdown = ({
  currentApp = "kruh",
  isLight = false,
  onOpenModal,
  className = ""
}) => {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const dropdownRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const resolveAppLink = (app) => {
    if (typeof window === "undefined") return app.prodUrl;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return `http://localhost:${app.devPort}`;
    }
    return app.prodUrl;
  };
  const renderAppItem = (app) => {
    const isCurrent = app.key === currentApp;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "a",
      {
        href: resolveAppLink(app),
        onClick: () => setIsOpen(false),
        className: `group flex items-start gap-3 p-2.5 rounded-xl transition-all ${isCurrent ? "bg-[#FAF7F2] border border-[#93032E]/20 text-[#93032E]" : "hover:bg-slate-50 text-slate-800"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl shrink-0 p-1 bg-white rounded-lg border border-slate-100 shadow-2xs group-hover:scale-105 transition-transform", children: app.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-heading font-bold text-sm truncate", children: app.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 shrink-0", children: isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#93032E] text-white", children: "Trenutna" }) : app.badge ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200/60", children: app.badge }) : null })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-500 truncate mt-0.5", children: app.subtitle })
          ] })
        ]
      },
      app.key
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative ${className}`, ref: dropdownRef, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setIsOpen(!isOpen),
        className: `flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${isLight ? isOpen ? "bg-white/25 text-white" : "text-white/90 hover:text-white hover:bg-white/15" : isOpen ? "bg-[#93032E] text-white shadow-xs" : "bg-white hover:bg-slate-50 text-[#93032E] border border-[#93032E]/30 shadow-2xs"}`,
        title: "Preklopi med aplikacijami Kalvarija",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-4 h-4 shrink-0", viewBox: "0 0 24 24", fill: "currentColor", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "5", cy: "5", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "5", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "19", cy: "5", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "5", cy: "12", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "12", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "19", cy: "12", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "5", cy: "19", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "12", cy: "19", r: "2.2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "19", cy: "19", r: "2.2" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline font-heading", children: "Aplikacije" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-[#A6A15E]/20 p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3 py-2 border-b border-gray-100 flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black text-[#A6A15E] tracking-wider uppercase font-heading", children: "Ekosistem Kalvarija Celje" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2.5 pt-2 pb-1 text-[10px] font-black text-slate-400 uppercase tracking-wider font-heading", children: "Cerkvene Aplikacije" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1", children: CORE_APPS.map(renderAppItem) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-slate-100" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-2.5 pt-0.5 pb-1 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider font-heading", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Samostojni Projekti" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80", children: "Samostojno" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-1", children: STANDALONE_APPS.map(renderAppItem) }),
      onOpenModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 mt-2 border-t border-gray-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setIsOpen(false);
            onOpenModal();
          },
          className: "w-full py-1.5 text-center text-xs font-bold text-[#93032E] hover:underline cursor-pointer font-heading",
          children: "Več informacij o orodjih →"
        }
      ) })
    ] })
  ] });
};
const BrandLogo = ({
  variant = "responsive",
  subAppTitle,
  href,
  onClick,
  className = ""
}) => {
  const content = /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center select-none ${className}`, children: [
    variant === "compact" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: "/KCK-logo-rdec-sekundaren_small.png",
        alt: "KC Kalvarija",
        className: "h-8 w-8 object-contain rounded-full shadow-2xs shrink-0",
        loading: "eager"
      }
    ),
    variant === "full" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: "/KCK-logo-rdec_small.png",
        alt: "Krščanska cerkev Kalvarija Celje",
        className: "h-8 md:h-9 w-auto object-contain rounded-xl shadow-2xs shrink-0",
        loading: "eager"
      }
    ),
    variant === "responsive" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/KCK-logo-rdec-sekundaren_small.png",
          alt: "KC Kalvarija",
          className: "md:hidden h-8 w-8 object-contain rounded-full shadow-2xs shrink-0",
          loading: "eager"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/KCK-logo-rdec_small.png",
          alt: "Krščanska cerkev Kalvarija Celje",
          className: "hidden md:block h-8 md:h-9 w-auto object-contain rounded-xl shadow-2xs shrink-0",
          loading: "eager"
        }
      )
    ] }),
    subAppTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-r border-white/25 h-5 mx-3 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-white text-sm tracking-wide uppercase whitespace-nowrap font-['Nohemi',sans-serif]", children: subAppTitle })
    ] })
  ] });
  if (onClick) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick,
        className: "inline-flex items-center text-left group focus:outline-none cursor-pointer transition-opacity hover:opacity-90",
        title: "Krščanska cerkev Kalvarija Celje",
        children: content
      }
    );
  }
  if (href) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href,
        className: "inline-flex items-center group focus:outline-none transition-opacity hover:opacity-90",
        title: "Krščanska cerkev Kalvarija Celje",
        children: content
      }
    );
  }
  return content;
};
function AppShell({ children }) {
  const {
    isAdmin,
    realIsAdmin,
    simulatedRole,
    isSimulating,
    setSimulatedRole,
    signOut,
    user,
    fullName,
    avatarUrl
  } = useAuth();
  const { t, lang, setLang } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [isPwaInstalled, setIsPwaInstalled] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true || localStorage.getItem("kck_kruh_pwa_installed") === "true" || localStorage.getItem("kck_pwa_installed") === "true") {
      setIsPwaInstalled(true);
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => {
      setIsPwaInstalled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("kck_kruh_pwa_installed", "true");
      }
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);
  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsPwaInstalled(true);
        localStorage.setItem("kck_kruh_pwa_installed", "true");
      }
      setDeferredPrompt(null);
    }
  };
  const adminNavItems = [
    { to: "/dashboard", label: t("dashboard"), icon: House },
    { to: "/planner", label: t("planner"), icon: CalendarDays },
    { to: "/people", label: t("people"), icon: Users },
    { to: "/email-queue", label: t("emailQueue"), icon: Mail },
    { to: "/admin", label: t("admin"), icon: Settings }
  ];
  const volunteerNavItems = [
    { to: "/dashboard", label: t("dashboard"), icon: House },
    { to: "/planner", label: t("planner"), icon: CalendarDays }
  ];
  const currentNav = isAdmin ? adminNavItems : volunteerNavItems;
  const tabBase = "inline-flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap select-none";
  const tabActive = "bg-[#93032E] text-white shadow-xs";
  const tabInactive = "text-slate-700 hover:text-[#93032E] hover:bg-slate-100/80";
  const formatSlovenianDisplayName = (rawName, email) => {
    const emailLower = (email || "").toLowerCase().trim();
    let name = (rawName || "").trim();
    if (emailLower === "ales.lajlar@gmail.com" || emailLower === "aleslajlar@gmail.com") {
      return "Aleš Lajlar";
    }
    if (!name && email) {
      name = email.split("@")[0];
    }
    if (!name) return "Uporabnik";
    if (name.includes(".") && !name.includes(" ")) {
      name = name.split(".").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
    }
    return name.replace(/\bAles\b/g, "Aleš").replace(/\bales\b/g, "Aleš").replace(/\bStefan\b/g, "Štefan").replace(/\bStef\b/g, "Štef").replace(/\bSpela\b/g, "Špela").replace(/\bBostjan\b/g, "Boštjan").replace(/\bBozena\b/g, "Božena").replace(/\bZiga\b/g, "Žiga").replace(/\bZan\b/g, "Žan").replace(/\bCrt\b/g, "Črt").replace(/\bMatjaz\b/g, "Matjaž").replace(/\bMarusa\b/g, "Maruša").replace(/\bAljosa\b/g, "Aljoša").replace(/\bAnze\b/g, "Anže").replace(/\bSasa\b/g, "Saša").replace(/\bBlaz\b/g, "Blaž");
  };
  const userFullName = formatSlovenianDisplayName(
    fullName || user?.user_metadata?.full_name || user?.user_metadata?.name,
    user?.email
  );
  const initial = (userFullName[0] || "A").toUpperCase();
  const desktopNav = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0", children: currentNav.map((item) => {
      const Icon = item.icon;
      const active = pathname === item.to || item.to !== "/dashboard" && pathname.startsWith(item.to + "/");
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: item.to,
          className: `${tabBase} ${active ? tabActive : tabInactive}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
          ]
        },
        item.to
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex lg:hidden items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/dashboard",
          className: `${tabBase} ${pathname === "/dashboard" ? tabActive : tabInactive}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("dashboard") })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/planner",
          className: `${tabBase} ${pathname.startsWith("/planner") ? tabActive : tabInactive}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("planner") })
          ]
        }
      ),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/people",
            className: `${tabBase} ${pathname.startsWith("/people") ? tabActive : tabInactive}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("people") })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: `${tabBase} ${pathname.startsWith("/email") || pathname.startsWith("/admin") ? tabActive : tabInactive}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Več" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-3 w-3 opacity-60" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuContent,
            {
              align: "start",
              className: "w-48 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/email-queue",
                    className: "flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("emailQueue") })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/email-templates",
                    className: "flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("emailTemplates") })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/admin",
                    className: "flex items-center gap-2 cursor-pointer text-xs font-semibold py-2 rounded-xl text-slate-700 hover:text-[#93032E] hover:bg-slate-50",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("admin") })
                    ]
                  }
                ) })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-[#FAF7F2] text-slate-900 flex flex-col font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#93032E] text-white text-xs py-1.5 px-4 sm:px-6 shadow-sm border-b border-black/10 select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 flex items-center gap-2 truncate", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 tracking-wider uppercase shadow-2xs", children: "KRUH ŽIVLJENJA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold truncate text-xs sm:text-[13px] tracking-tight text-white", children: lang === "sl" ? "Organizacija prevzema in razdeljevanja hrane KCK" : "Food pickup & distribution logistics KCK" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 sm:gap-4 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 sm:gap-1.5 border-r border-white/20 pr-2 sm:pr-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://www.youtube.com/@KCKalvarija",
              target: "_blank",
              rel: "noreferrer",
              className: "w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer",
              title: "YouTube",
              "aria-label": "YouTube",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Youtube, { className: "h-3.5 w-3.5 text-rose-300 hover:text-white" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://www.facebook.com/kck.celje",
              target: "_blank",
              rel: "noreferrer",
              className: "w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer",
              title: "Facebook",
              "aria-label": "Facebook",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Facebook, { className: "h-3.5 w-3.5 text-blue-200 hover:text-white" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://www.instagram.com/kalvarijacelje/",
              target: "_blank",
              rel: "noreferrer",
              className: "w-6 h-6 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer",
              title: "Instagram",
              "aria-label": "Instagram",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Instagram, { className: "h-3.5 w-3.5 text-pink-200 hover:text-white" })
            }
          ),
          !isPwaInstalled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group ml-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: handlePwaInstall,
                className: "flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] transition-all cursor-pointer shadow-xs border border-amber-300/80 hover:scale-105",
                title: lang === "sl" ? "Namesti aplikacijo Kruh Življenja" : "Install App",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5 text-slate-950 animate-bounce" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline font-black", children: lang === "sl" ? "Namesti APP" : "Install App" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-slate-950/95 backdrop-blur-md text-white text-[11px] font-semibold rounded-xl shadow-2xl border border-white/20 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "w-3.5 h-3.5 text-amber-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "sl" ? "Namesti na telefon / PC" : "Install to Home Screen" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center bg-black/25 rounded-lg p-0.5 border border-white/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setLang("sl"),
              className: `px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${lang === "sl" ? "bg-white text-[#93032E] shadow-sm font-black" : "text-white/80 hover:text-white"}`,
              title: "Slovenski jezik",
              children: "SL"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setLang("en"),
              className: `px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${lang === "en" ? "bg-white text-[#93032E] shadow-sm font-black" : "text-white/80 hover:text-white"}`,
              title: "English language",
              children: "EN"
            }
          )
        ] }),
        user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: `flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-lg transition cursor-pointer border text-xs font-bold ${isSimulating ? "bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300 shadow-xs" : "bg-white/15 hover:bg-white/25 text-white border-white/20"}`,
              title: userFullName,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `w-5 h-5 rounded-full font-black flex items-center justify-center text-[10px] shrink-0 ${isSimulating ? "bg-slate-950 text-amber-400" : "bg-white text-[#93032E]"}`,
                    children: initial
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline max-w-[160px] truncate", children: userFullName }),
                isSimulating && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline-block px-1.5 py-0.2 bg-slate-950 text-amber-300 rounded text-[9px] font-black uppercase tracking-wider", children: simulatedRole === "driver" ? t("driver") : simulatedRole === "coordinator" ? t("coordinator") : t("viewer") })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            DropdownMenuContent,
            {
              align: "end",
              className: "w-64 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2.5 border-b border-slate-100", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-slate-900 truncate", children: userFullName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-slate-500 truncate", children: user.email }),
                  realIsAdmin ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800", children: "Superadmin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700", children: t("volunteer") })
                ] }),
                realIsAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 border-b border-slate-100", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-2 text-[10px] font-black tracking-wider text-slate-400 uppercase", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-3 w-3 text-slate-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("adminSimulation") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-1.5", children: [
                    { id: "admin", label: t("adminRole") },
                    { id: "coordinator", label: t("coordinator") },
                    { id: "driver", label: t("driver") },
                    { id: "viewer", label: t("viewer") }
                  ].map((r) => {
                    const active = simulatedRole === r.id || !simulatedRole && r.id === "admin";
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setSimulatedRole(r.id === "admin" ? null : r.id),
                        className: `px-2 py-1.5 rounded-xl text-xs transition-all border text-center cursor-pointer ${active ? "bg-[#93032E] text-white border-[#93032E] shadow-xs font-bold" : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium"}`,
                        children: r.label
                      },
                      r.id
                    );
                  }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  DropdownMenuItem,
                  {
                    onClick: signOut,
                    className: "w-full flex items-center gap-2 px-2.5 py-1.5 mt-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-left",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5 mr-1" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("signOut") })
                    ]
                  }
                )
              ]
            }
          )
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/login",
            className: "flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white text-[#93032E] hover:bg-white/90 font-bold text-xs transition-all cursor-pointer shadow-xs",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogIn, { className: "w-3.5 h-3.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("signIn") })
            ]
          }
        )
      ] })
    ] }) }),
    isSimulating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-100 border-b border-amber-300/80 px-4 sm:px-6 py-1.5 text-xs text-amber-950 shadow-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 text-amber-700 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
          t("simulatingRole"),
          ":"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black bg-amber-200 text-amber-950 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wide", children: simulatedRole === "driver" ? t("driver") : simulatedRole === "coordinator" ? t("coordinator") : t("viewer") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-800 hidden sm:inline text-[11px]", children: [
          "(",
          lang === "sl" ? "Preizkušate pogled te vloge" : "Previewing page as this role",
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setSimulatedRole(null),
          className: "text-xs font-black text-amber-950 underline hover:text-black cursor-pointer shrink-0",
          children: [
            t("resetSimulation"),
            " (Admin) ×"
          ]
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 sm:py-3.5 border-b border-[#A6A15E]/20 shadow-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 xl:gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BrandLogo,
        {
          variant: "responsive",
          isLight: false,
          className: "shrink-0 cursor-pointer"
        }
      ),
      desktopNav,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 xl:gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors",
            title: "Obvestila",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(EcosystemAppsDropdown, { currentApp: "kruh", isLight: false })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6", children })
  ] });
}
export {
  AppShell as A
};
