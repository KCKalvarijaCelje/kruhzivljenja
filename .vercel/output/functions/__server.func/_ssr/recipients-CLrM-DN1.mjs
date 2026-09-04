import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BqZHQrkq.mjs";
import { a as useI18n, u as useAuth } from "./router-Yc5lMt1t.mjs";
import { C as Card, a as CardContent } from "./card-bGA65zU0.mjs";
import { B as Button } from "./button-Dq7LlB-Y.mjs";
import { L as Label, I as Input } from "./label-C37PovNU.mjs";
import { T as Textarea } from "./textarea-CEgdDdB9.mjs";
import { B as Badge } from "./badge-Fp7jkHpv.mjs";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle, e as DialogFooter } from "./dialog-CaODblSL.mjs";
import { S as Switch } from "./switch-DSakz05O.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { D as DeleteConfirm } from "./delete-confirm-COwFKXYC.mjs";
import "../_libs/seroval.mjs";
import { i as Heart, P as Plus, J as Pencil, T as Trash2 } from "../_libs/lucide-react.mjs";
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
function RecipientsPage() {
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
  const [deleting, setDeleting] = reactExports.useState(null);
  const checkHouseholdInUse = async (id) => {
    const [dr, tpl] = await Promise.all([supabase.from("date_recipients").select("id", {
      count: "exact",
      head: true
    }).eq("household_id", id), supabase.from("recurring_recipient_templates").select("id", {
      count: "exact",
      head: true
    }).eq("household_id", id)]);
    return (dr.count ?? 0) + (tpl.count ?? 0) > 0;
  };
  const doDelete = async (mode) => {
    if (!deleting) return;
    if (mode === "soft") {
      const {
        error
      } = await supabase.from("recipient_households").update({
        active: false
      }).eq("id", deleting.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t("archived"));
    } else {
      const {
        error
      } = await supabase.from("recipient_households").delete().eq("id", deleting.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(t("deleted"));
    }
    load();
  };
  const load = async () => {
    const {
      data
    } = await supabase.from("recipient_households").select("*").order("name");
    setList(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    load();
  }, []);
  const startNew = () => {
    setEditing({
      first_name: "",
      last_name: "",
      name: "",
      contact_name: "",
      phone: "",
      address: "",
      notes: "",
      size: 1,
      active: true
    });
    setOpen(true);
  };
  const startEdit = (h) => {
    setEditing({
      ...h
    });
    setOpen(true);
  };
  const save = async () => {
    const first = (editing.first_name ?? "").trim();
    const last = (editing.last_name ?? "").trim();
    const composed = [first, last].filter(Boolean).join(" ");
    const name = editing.name?.trim() || composed;
    if (!name) return toast.error(t("firstName"));
    const p = {
      name,
      first_name: first || null,
      last_name: last || null,
      needs_name_review: !last && !composed.includes(" "),
      contact_name: editing.contact_name || null,
      phone: editing.phone || null,
      address: editing.address || null,
      notes: editing.notes || null,
      size: Number(editing.size) || 1,
      active: editing.active
    };
    if (editing.id) {
      const {
        error
      } = await supabase.from("recipient_households").update(p).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const {
        error
      } = await supabase.from("recipient_households").insert(p);
      if (error) return toast.error(error.message);
    }
    toast.success(t("saved"));
    setOpen(false);
    load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-7 w-7 text-primary" }),
        t("recipients")
      ] }),
      isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: startNew, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-1" }),
        t("addHousehold")
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("loading") }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
      list.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "—" }),
      list.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: h.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", children: [
              t("size"),
              ": ",
              h.size
            ] }),
            !h.active && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", children: t("inactive") }),
            h.needs_name_review && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs border-amber-500 text-amber-600", children: t("nameNeedsReview") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 space-x-2", children: [
            h.contact_name && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h.contact_name }),
            h.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· ",
              h.phone
            ] }),
            h.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "· ",
              h.address
            ] })
          ] })
        ] }),
        isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => startEdit(h), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "text-destructive hover:text-destructive hover:bg-destructive/10", onClick: () => setDeleting(h), "aria-label": t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
        ] })
      ] }) }, h.id))
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing?.id ? t("edit") : t("addHousehold") }) }),
      editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("household") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.name ?? "", onChange: (e) => setEditing({
            ...editing,
            name: e.target.value
          }), placeholder: [editing.first_name, editing.last_name].filter(Boolean).join(" ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("contactName") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.contact_name ?? "", onChange: (e) => setEditing({
              ...editing,
              contact_name: e.target.value
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("phone") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.phone ?? "", onChange: (e) => setEditing({
              ...editing,
              phone: e.target.value
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("address") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: editing.address ?? "", onChange: (e) => setEditing({
            ...editing,
            address: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("size") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: editing.size ?? 1, onChange: (e) => setEditing({
            ...editing,
            size: e.target.value
          }), className: "w-24" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("notes") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: editing.notes ?? "", onChange: (e) => setEditing({
            ...editing,
            notes: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: editing.active, onCheckedChange: (v) => setEditing({
            ...editing,
            active: v
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: t("active") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setOpen(false), children: t("cancel") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, children: t("save") })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteConfirm, { open: !!deleting, onOpenChange: (v) => !v && setDeleting(null), title: deleting ? `${t("delete")}: ${deleting.name}` : void 0, checkInUse: () => deleting ? checkHouseholdInUse(deleting.id) : Promise.resolve(false), onConfirm: doDelete })
  ] });
}
export {
  RecipientsPage as component
};
