import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BqZHQrkq.mjs";
import { a as useI18n, u as useAuth } from "./router-Yc5lMt1t.mjs";
import { C as Card, a as CardContent } from "./card-bGA65zU0.mjs";
import { B as Button } from "./button-Dq7LlB-Y.mjs";
import { I as Input, L as Label } from "./label-C37PovNU.mjs";
import { T as Textarea } from "./textarea-CEgdDdB9.mjs";
import { B as Badge } from "./badge-Fp7jkHpv.mjs";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-CaODblSL.mjs";
import { S as Switch } from "./switch-DSakz05O.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as DeleteConfirm } from "./delete-confirm-COwFKXYC.mjs";
import { s as serverGetPeopleData, a as serverSavePerson, b as serverDeletePerson } from "./people.functions-BaJhYbHb.mjs";
import "../_libs/seroval.mjs";
import { P as Plus, U as Users, K as UserCheck, N as Truck, O as Utensils, i as Heart, Q as Search, X, c as LoaderCircle, R as Crown, G as MapPin, J as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/lovable.dev__webhooks-js.mjs";
import "../_libs/react-email__render.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./tz-CU05rO0J.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "./server-Dm1gvL4M.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__img.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/react-email__text.mjs";
import "../_libs/lovable.dev__email-js.mjs";
import "./driver-emails.functions-CYCYga1W.mjs";
import "./createSsrRpc-Bob-CuPr.mjs";
import "../_libs/react-email__link.mjs";
import "../_libs/react-email__button.mjs";
import "./utils-BhSPcRjB.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
function PeoplePage() {
  const {
    t
  } = useI18n();
  const {
    isAdmin
  } = useAuth();
  const [list, setList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [editing, setEditing] = reactExports.useState(null);
  const [open, setOpen] = reactExports.useState(false);
  const [saving, setSaving] = reactExports.useState(false);
  const [deleting, setDeleting] = reactExports.useState(null);
  const [allHouseholds, setAllHouseholds] = reactExports.useState([]);
  const [activeTab, setActiveTab] = reactExports.useState("all");
  const [search, setSearch] = reactExports.useState("");
  const checkPersonInUse = async (personId) => {
    const [sd, rules, dr, hh, hm] = await Promise.all([supabase.from("schedule_dates").select("id", {
      count: "exact",
      head: true
    }).or(`driver_id.eq.${personId},coordinator_id.eq.${personId}`), supabase.from("recurring_schedule_rules").select("id", {
      count: "exact",
      head: true
    }).or(`default_driver_id.eq.${personId},default_coordinator_id.eq.${personId}`), supabase.from("date_recipients").select("id", {
      count: "exact",
      head: true
    }).eq("person_id", personId), supabase.from("recipient_households").select("id", {
      count: "exact",
      head: true
    }).eq("person_id", personId), supabase.from("household_members").select("id", {
      count: "exact",
      head: true
    }).eq("person_id", personId)]);
    return (sd.count ?? 0) + (rules.count ?? 0) + (dr.count ?? 0) + (hh.count ?? 0) + (hm.count ?? 0) > 0;
  };
  const doDeletePerson = async (mode) => {
    if (!deleting) return;
    const res = await serverDeletePerson({
      data: {
        id: deleting.id,
        mode
      }
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju");
      return;
    }
    toast.success(mode === "soft" ? t("archived") : t("deleted"));
    load();
  };
  const load = async () => {
    setLoading(true);
    try {
      const res = await serverGetPeopleData();
      if (res.success) {
        setList(res.people ?? []);
        setAllHouseholds(res.allHouseholds ?? []);
      } else {
        toast.error(res.error || "Napaka pri nalaganju oseb");
      }
    } catch (err) {
      console.error("load people error:", err);
      toast.error(err?.message || "Napaka pri nalaganju");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const counts = reactExports.useMemo(() => {
    let drivers = 0;
    let coordinators = 0;
    let recipients = 0;
    let team = 0;
    for (const p of list) {
      const roles = (p.people_roles ?? []).map((r) => r.role);
      const isDriver = roles.includes("driver");
      const isCoord = roles.includes("coordinator");
      const isAdminRole = roles.includes("admin");
      const hasHh = Array.isArray(p.recipient_households) ? p.recipient_households.length > 0 : !!p.recipient_households;
      if (isDriver) drivers++;
      if (isCoord) coordinators++;
      if (hasHh) recipients++;
      if (isDriver || isCoord || isAdminRole) team++;
    }
    return {
      all: list.length,
      team,
      drivers,
      coordinators,
      recipients
    };
  }, [list]);
  const filteredList = reactExports.useMemo(() => {
    let result = list;
    if (activeTab === "team") {
      result = result.filter((p) => (p.people_roles ?? []).some((r) => ["driver", "coordinator", "admin"].includes(r.role)));
    } else if (activeTab === "drivers") {
      result = result.filter((p) => (p.people_roles ?? []).some((r) => r.role === "driver"));
    } else if (activeTab === "coordinators") {
      result = result.filter((p) => (p.people_roles ?? []).some((r) => r.role === "coordinator"));
    } else if (activeTab === "recipients") {
      result = result.filter((p) => {
        const hh = p.recipient_households;
        return Array.isArray(hh) ? hh.length > 0 : !!hh;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const fullName = (p.full_name ?? "").toLowerCase();
        const email = (p.email ?? "").toLowerCase();
        const phone = (p.phone ?? "").toLowerCase();
        const address = (p.address ?? "").toLowerCase();
        const notes = (p.notes ?? "").toLowerCase();
        const hh = Array.isArray(p.recipient_households) ? p.recipient_households[0] : p.recipient_households;
        const hhName = (hh?.name ?? "").toLowerCase();
        const hhAddress = (hh?.address ?? "").toLowerCase();
        return fullName.includes(q) || email.includes(q) || phone.includes(q) || address.includes(q) || notes.includes(q) || hhName.includes(q) || hhAddress.includes(q);
      });
    }
    return result;
  }, [list, activeTab, search]);
  const startNew = () => {
    setEditing({
      full_name: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      active: true,
      roles: [],
      profile_id: null,
      isRecipient: false,
      household: {
        id: null,
        name: "",
        address: "",
        phone: "",
        notes: "",
        size: 1,
        active: true
      },
      pickupHhIds: []
    });
    setOpen(true);
  };
  const startEdit = (p) => {
    const hhEmbed = p.recipient_households;
    const hh = (Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed) ?? null;
    const roles = (p.people_roles ?? []).map((r) => r.role);
    const resolvedAddress = p.address || hh?.address || "";
    setEditing({
      ...p,
      roles,
      address: resolvedAddress,
      isRecipient: !!hh,
      household: hh ? {
        id: hh.id,
        name: hh.name,
        address: hh.address ?? resolvedAddress,
        phone: hh.phone ?? "",
        notes: hh.notes ?? "",
        size: hh.size ?? 1,
        active: hh.active
      } : {
        id: null,
        name: p.full_name,
        address: resolvedAddress,
        phone: p.phone ?? "",
        notes: "",
        size: 1,
        active: true
      },
      pickupHhIds: p.pickupHhIds ?? []
    });
    setOpen(true);
  };
  const save = async () => {
    const first = (editing.first_name ?? "").trim();
    const last = (editing.last_name ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || (editing.full_name ?? "").trim();
    if (!fullName) return toast.error(t("firstName"));
    setSaving(true);
    try {
      const res = await serverSavePerson({
        data: {
          id: editing.id,
          profile_id: editing.profile_id,
          first_name: first || null,
          last_name: last || null,
          full_name: fullName,
          phone: editing.phone || null,
          email: editing.email || null,
          address: editing.address || null,
          notes: editing.notes || null,
          active: editing.active !== false,
          roles: editing.roles ?? [],
          isRecipient: editing.isRecipient,
          household: editing.household,
          pickupHhIds: editing.pickupHhIds ?? []
        }
      });
      if (!res.success) {
        toast.error(res.error || "Napaka pri shranjevanju");
        return;
      }
      toast.success(t("saved"));
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-w-4xl mx-auto pb-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-slate-900", children: t("people") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-0.5", children: "Združen pregled vseh prostovoljcev, voznikov, razdeljevalcev in prejemnikov." })
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNew, className: "gap-1.5 bg-[#93032E] hover:bg-[#7b0226] text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        t("addPerson")
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab("all"), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "all" ? "bg-slate-900 text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("allMembersTab") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: `px-1.5 py-0 text-[10px] rounded-md ${activeTab === "all" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"}`, children: counts.all })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab("team"), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "team" ? "bg-primary text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("activeTeam") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: `px-1.5 py-0 text-[10px] rounded-md ${activeTab === "team" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"}`, children: counts.team })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab("drivers"), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "drivers" ? "bg-primary text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("driversTab") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: `px-1.5 py-0 text-[10px] rounded-md ${activeTab === "drivers" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"}`, children: counts.drivers })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab("coordinators"), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "coordinators" ? "bg-[#93032E] text-white shadow-xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Utensils, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("coordinatorsTab") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: `px-1.5 py-0 text-[10px] rounded-md ${activeTab === "coordinators" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"}`, children: counts.coordinators })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setActiveTab("recipients"), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "recipients" ? "bg-rose-700 text-white shadow-xs" : "bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-200/60"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("recipientsTab") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: `px-1.5 py-0 text-[10px] rounded-md ${activeTab === "recipients" ? "bg-white/20 text-white border-0" : "bg-white text-rose-900 border"}`, children: counts.recipients })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: search, onChange: (e) => setSearch(e.target.value), placeholder: t("searchUsersPlaceholder"), className: "pl-9 pr-8 text-xs h-9 bg-white" }),
      search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSearch(""), className: "absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filteredList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-dashed", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-10 w-10 mx-auto mb-2 opacity-50" }),
      "Ni najdenih oseb za izbran filter."
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: filteredList.map((p) => {
      const hhEmbed = p.recipient_households;
      const hh = (Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed) ?? null;
      const roles = (p.people_roles ?? []).map((r) => r.role);
      const address = p.address || hh?.address;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: !p.active ? "opacity-60 bg-slate-50/50" : "bg-white shadow-2xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-3.5 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-900", children: p.full_name }),
            hh && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs gap-1 border-rose-300 text-rose-700 bg-rose-50 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3 fill-rose-500 text-rose-500" }),
              t("recipient"),
              " (",
              hh.size ?? 1,
              ")"
            ] }),
            !p.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs", children: t("inactive") }),
            roles.map((r) => {
              if (r === "admin") {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs gap-1 border-amber-300 text-amber-800 bg-amber-50 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-3 w-3 text-amber-600" }),
                  t("adminRole")
                ] }, r);
              }
              if (r === "driver") {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs gap-1 border-emerald-300 text-emerald-800 bg-emerald-50 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3 text-emerald-600" }),
                  t("driver")
                ] }, r);
              }
              if (r === "coordinator") {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: "text-xs gap-1 border-rose-300 text-[#93032E] bg-rose-50 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Utensils, { className: "h-3 w-3 text-[#93032E]" }),
                  t("coordinator")
                ] }, r);
              }
              return null;
            })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap", children: [p.phone, p.email, address].filter(Boolean).map((info, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            idx > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-40", children: "·" }),
            idx === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-slate-400 shrink-0 inline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: info })
          ] }, idx)) }),
          hh && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-rose-800/80 mt-1 font-medium flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Gospodinjstvo: ",
              hh.name
            ] }),
            hh.size && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "(št. oseb: ",
              hh.size,
              ")"
            ] }),
            hh.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· ",
              hh.address
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => startEdit(p), className: "h-8 w-8 text-slate-700 hover:text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10", onClick: () => setDeleting(p), "aria-label": t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }) }, p.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? t("edit") : t("addPerson") }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("firstName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.first_name ?? "", onChange: (e) => setEditing({
              ...editing,
              first_name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("lastName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.last_name ?? "", onChange: (e) => setEditing({
              ...editing,
              last_name: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.phone ?? "", onChange: (e) => setEditing({
              ...editing,
              phone: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("email") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.email ?? "", onChange: (e) => setEditing({
              ...editing,
              email: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("address") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.address ?? "", onChange: (e) => setEditing({
            ...editing,
            address: e.target.value
          }), placeholder: "npr. Mariborska cesta 12, 3000 Celje" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editing.notes ?? "", onChange: (e) => setEditing({
            ...editing,
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("roles") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mt-1.5", children: [
            (() => {
              const on = (editing.roles ?? []).includes("admin");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setEditing({
                ...editing,
                roles: on ? editing.roles.filter((x) => x !== "admin") : [...editing.roles ?? [], "admin"]
              }), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? "bg-amber-600 text-white border-amber-600 shadow-2xs" : "border-amber-200/90 text-amber-800 bg-amber-50/50 hover:bg-amber-100/70"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: `h-3.5 w-3.5 ${on ? "text-white fill-white/20" : "text-amber-600"}` }),
                t("adminRole")
              ] });
            })(),
            (() => {
              const on = (editing.roles ?? []).includes("driver");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setEditing({
                ...editing,
                roles: on ? editing.roles.filter((x) => x !== "driver") : [...editing.roles ?? [], "driver"]
              }), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "border-emerald-200/90 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: `h-3.5 w-3.5 ${on ? "text-white" : "text-emerald-600"}` }),
                t("driver")
              ] });
            })(),
            (() => {
              const on = (editing.roles ?? []).includes("coordinator");
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setEditing({
                ...editing,
                roles: on ? editing.roles.filter((x) => x !== "coordinator") : [...editing.roles ?? [], "coordinator"]
              }), className: `inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${on ? "bg-[#93032E] text-white border-[#93032E] shadow-2xs" : "border-rose-200/90 text-[#93032E] bg-rose-50/50 hover:bg-rose-100/70"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Utensils, { className: `h-3.5 w-3.5 ${on ? "text-white" : "text-[#93032E]"}` }),
                t("coordinator")
              ] });
            })()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.active, onCheckedChange: (v) => setEditing({
            ...editing,
            active: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("active") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "also-recipient-switch", className: `flex items-center justify-between gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${editing.isRecipient ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:bg-muted/50"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `h-4 w-4 ${editing.isRecipient ? "text-primary fill-primary" : "text-muted-foreground"}` }),
            t("alsoRecipient")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { id: "also-recipient-switch", checked: editing.isRecipient, onCheckedChange: (v) => setEditing({
            ...editing,
            isRecipient: v
          }) })
        ] }) }),
        editing.isRecipient && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border p-3 bg-muted/20 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: t("recipientDetails") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("householdName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.household?.name ?? "", onChange: (e) => setEditing({
              ...editing,
              household: {
                ...editing.household,
                name: e.target.value
              }
            }), placeholder: editing.full_name || t("name") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("address") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.household?.address ?? editing.address ?? "", onChange: (e) => setEditing({
              ...editing,
              household: {
                ...editing.household,
                address: e.target.value
              },
              address: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("householdSize") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: editing.household?.size ?? 1, onChange: (e) => setEditing({
                ...editing,
                household: {
                  ...editing.household,
                  size: Number(e.target.value) || 1
                }
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("phone") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.household?.phone ?? editing.phone ?? "", onChange: (e) => setEditing({
                ...editing,
                household: {
                  ...editing.household,
                  phone: e.target.value
                }
              }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("notes") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editing.household?.notes ?? "", onChange: (e) => setEditing({
              ...editing,
              household: {
                ...editing.household,
                notes: e.target.value
              }
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.household?.active !== false, onCheckedChange: (v) => setEditing({
              ...editing,
              household: {
                ...editing.household,
                active: v
              }
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("recipientActive") })
          ] })
        ] }),
        (editing.roles ?? []).includes("driver") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-semibold text-sm", children: t("driverPickupHouseholdsTitle") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("driverPickupHouseholdsHelp") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-44 overflow-y-auto border rounded-md p-2 space-y-1.5 bg-background", children: [
            allHouseholds.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("noRecipients") }),
            allHouseholds.map((h) => {
              const checked = (editing.pickupHhIds ?? []).includes(h.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-muted/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked, onChange: (e) => {
                  const cur = editing.pickupHhIds ?? [];
                  const next = e.target.checked ? [...cur, h.id] : cur.filter((x) => x !== h.id);
                  setEditing({
                    ...editing,
                    pickupHhIds: next
                  });
                }, className: "rounded border-border" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h.name })
              ] }, h.id);
            })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), disabled: saving, children: t("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, className: "bg-[#93032E] hover:bg-[#7b0226] text-white", children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin mr-1.5" }) : null,
          t("save")
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirm, { open: !!deleting, onOpenChange: (v) => !v && setDeleting(null), title: t("confirmDelete") + (deleting?.full_name ? `: ${deleting.full_name}` : ""), checkInUse: () => deleting ? checkPersonInUse(deleting.id) : Promise.resolve(false), onConfirm: doDeletePerson })
  ] });
}
export {
  PeoplePage as component
};
