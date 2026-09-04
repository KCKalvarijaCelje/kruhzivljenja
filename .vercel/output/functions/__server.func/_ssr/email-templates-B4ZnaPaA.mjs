import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { a as useI18n, u as useAuth } from "./router-Yc5lMt1t.mjs";
import { u as upsertEmailBrandSettings, l as listEmailTemplatesAdmin, g as getEmailBrandSettings, p as previewTemplateWithSample, a as upsertEmailTemplateAdmin, r as resetEmailTemplateAdmin } from "./email-admin.functions-D4VZuzg4.mjs";
import { C as Card, a as CardContent, b as CardHeader, c as CardTitle } from "./card-bGA65zU0.mjs";
import { B as Button } from "./button-Dq7LlB-Y.mjs";
import { B as Badge } from "./badge-Fp7jkHpv.mjs";
import { L as Label, I as Input } from "./label-C37PovNU.mjs";
import { T as Textarea } from "./textarea-CEgdDdB9.mjs";
import { R as Root2, L as List, T as Trigger, C as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { c as cn } from "./utils-BhSPcRjB.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/seroval.mjs";
import { V as ShieldAlert, M as Mail, c as LoaderCircle, J as Pencil, E as Eye, Z as Save, _ as RotateCcw, $ as Image } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./client-BqZHQrkq.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/tailwind-merge.mjs";
const Tabs = Root2;
const TabsList = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = List.displayName;
const TabsTrigger = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = Trigger.displayName;
const TabsContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = Content.displayName;
const TEMPLATE_META = {
  driver_assignment: {
    titleKey: "etAssignment",
    subtitleKey: "etAssignmentSub"
  },
  driver_change: {
    titleKey: "etChange",
    subtitleKey: "etChangeSub"
  },
  driver_reminder: {
    titleKey: "etReminder",
    subtitleKey: "etReminderSub"
  },
  test_email: {
    titleKey: "etTest",
    subtitleKey: "etTestSub"
  }
};
const KEY_ORDER = ["driver_assignment", "driver_change", "driver_reminder", "test_email"];
function EmailTemplatesPage() {
  const {
    t
  } = useI18n();
  const {
    isAdmin
  } = useAuth();
  const listFn = useServerFn(listEmailTemplatesAdmin);
  const saveFn = useServerFn(upsertEmailTemplateAdmin);
  const resetFn = useServerFn(resetEmailTemplateAdmin);
  const brandGetFn = useServerFn(getEmailBrandSettings);
  const brandSaveFn = useServerFn(upsertEmailBrandSettings);
  const previewFn = useServerFn(previewTemplateWithSample);
  const [rows, setRows] = reactExports.useState([]);
  const [brand, setBrand] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [selectedKey, setSelectedKey] = reactExports.useState("driver_assignment");
  const [language, setLanguage] = reactExports.useState("sl");
  const [draft, setDraft] = reactExports.useState({
    subject: "",
    body: "",
    footer: ""
  });
  const [previewHtml, setPreviewHtml] = reactExports.useState("");
  const [previewSubject, setPreviewSubject] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [tab, setTab] = reactExports.useState("edit");
  const bodyRef = reactExports.useRef(null);
  const subjectRef = reactExports.useRef(null);
  const footerRef = reactExports.useRef(null);
  const [focusField, setFocusField] = reactExports.useState("body");
  const load = async () => {
    setLoading(true);
    try {
      const [list, b] = await Promise.all([listFn(), brandGetFn()]);
      setRows(list);
      setBrand(b);
    } catch (e) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };
  reactExports.useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);
  const current = reactExports.useMemo(() => rows.find((r) => r.template_key === selectedKey && r.language === language), [rows, selectedKey, language]);
  reactExports.useEffect(() => {
    if (current) {
      setDraft({
        subject: current.subject,
        body: current.body,
        footer: current.footer ?? ""
      });
    }
  }, [current?.template_key, current?.language, current?.updated_at]);
  const runPreview = async () => {
    if (!current) return;
    try {
      const res = await previewFn({
        data: {
          template_key: selectedKey,
          language,
          draft: {
            subject: draft.subject,
            body: draft.body,
            footer: draft.footer.trim() ? draft.footer : null
          }
        }
      });
      setPreviewHtml(res.html);
      setPreviewSubject(res.subject);
    } catch (e) {
      toast.error(e?.message ?? "Preview failed");
    }
  };
  reactExports.useEffect(() => {
    if (tab === "preview") runPreview();
  }, [tab]);
  const insertPlaceholder = (ph) => {
    const token = `{{${ph}}}`;
    const target = focusField === "subject" ? subjectRef.current : focusField === "footer" ? footerRef.current : bodyRef.current;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const v = target.value;
    const next = v.slice(0, start) + token + v.slice(end);
    setDraft((d) => ({
      ...d,
      [focusField]: next
    }));
    requestAnimationFrame(() => {
      target.focus();
      const pos = start + token.length;
      target.setSelectionRange(pos, pos);
    });
  };
  const onSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      await saveFn({
        data: {
          template_key: selectedKey,
          language,
          subject: draft.subject,
          body: draft.body,
          footer: draft.footer.trim() ? draft.footer : null
        }
      });
      toast.success(t("etSaved"));
      await load();
    } catch (e) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const onReset = async () => {
    if (!current) return;
    if (!confirm(t("etConfirmReset"))) return;
    try {
      await resetFn({
        data: {
          template_key: selectedKey,
          language
        }
      });
      toast.success(t("etReset"));
      await load();
    } catch (e) {
      toast.error(e?.message ?? "Reset failed");
    }
  };
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "py-12 text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-10 w-10 mx-auto mb-2 text-warning" }),
      "Admin only."
    ] }) });
  }
  const placeholders = current?.placeholders?.length ? current.placeholders : ["person_name", "driver_name", "date", "location", "app_name"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-7 w-7 text-primary" }),
      t("etTitle")
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[260px,1fr] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: t("etTemplates") }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: KEY_ORDER.map((k) => {
          const meta = TEMPLATE_META[k];
          const slRow = rows.find((r) => r.template_key === k && r.language === "sl");
          const enRow = rows.find((r) => r.template_key === k && r.language === "en");
          const slMissing = slRow?.missing;
          const enMissing = enRow?.missing;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedKey(k), className: `w-full text-left rounded-md px-3 py-2 transition-colors ${selectedKey === k ? "bg-muted font-medium" : "hover:bg-muted/60"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: t(meta.titleKey) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground line-clamp-1", children: t(meta.subtitleKey) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: slMissing ? "outline" : "secondary", className: "text-[10px] px-1.5 py-0", children: [
                "SL ",
                slMissing ? "·" : "✓"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: enMissing ? "outline" : "secondary", className: "text-[10px] px-1.5 py-0", children: [
                "EN ",
                enMissing ? "·" : "✓"
              ] })
            ] })
          ] }) }, k);
        }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base", children: [
                t(TEMPLATE_META[selectedKey].titleKey),
                current?.missing && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "ml-2 text-xs", children: t("etUsingDefault") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: language === "sl" ? "default" : "outline", onClick: () => setLanguage("sl"), children: "SL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: language === "en" ? "default" : "outline", onClick: () => setLanguage("en"), children: "EN" })
              ] })
            ] }),
            current?.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: current.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { value: tab, onValueChange: (v) => setTab(v), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "edit", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-3.5 w-3.5 mr-1" }),
                t("etEdit")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "preview", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1" }),
                t("etPreview")
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "edit", className: "space-y-4 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr,200px] gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etSubject") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { ref: subjectRef, value: draft.subject, onFocus: () => setFocusField("subject"), onChange: (e) => setDraft((d) => ({
                      ...d,
                      subject: e.target.value
                    })) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etBody") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { ref: bodyRef, rows: 12, value: draft.body, onFocus: () => setFocusField("body"), onChange: (e) => setDraft((d) => ({
                      ...d,
                      body: e.target.value
                    })), className: "font-mono text-sm" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etFooter") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { ref: footerRef, rows: 3, value: draft.footer, onFocus: () => setFocusField("footer"), onChange: (e) => setDraft((d) => ({
                      ...d,
                      footer: e.target.value
                    })), placeholder: t("etFooterPlaceholder") })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etPlaceholders") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: t("etPlaceholdersHelp") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: placeholders.map((ph) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => insertPlaceholder(ph), className: "text-[11px] font-mono px-2 py-1 rounded border bg-muted/40 hover:bg-muted", children: `{{${ph}}}` }, ph)) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onSave, disabled: saving, children: [
                  saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1" }),
                  t("etSave")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: onReset, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-4 w-4 mr-1" }),
                  t("etResetDefault")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => {
                  setTab("preview");
                }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-1" }),
                  t("etPreview")
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "preview", className: "mt-4 space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  t("etSubject"),
                  ": "
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: previewSubject || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-hidden bg-white", children: previewHtml ? /* @__PURE__ */ jsxRuntimeExports.jsx("iframe", { title: "preview", srcDoc: previewHtml, className: "w-full h-[520px] bg-white", sandbox: "" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-sm text-muted-foreground", children: "…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: runPreview, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-1" }),
                t("etRefreshPreview")
              ] })
            ] })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(BrandCard, { brand, onSaved: load, brandSaveFn, t }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { className: "pb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-sm", children: t("etProviderManaged") }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm text-muted-foreground space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: t("etProviderManagedDesc") }) })
        ] })
      ] })
    ] })
  ] });
}
function BrandCard({
  brand,
  onSaved,
  brandSaveFn,
  t
}) {
  const [b, setB] = reactExports.useState(brand);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setB(brand);
  }, [brand?.updated_at, brand?.app_name]);
  if (!b) return null;
  const save = async () => {
    setSaving(true);
    try {
      await brandSaveFn({
        data: {
          app_name: b.app_name,
          logo_url: b.logo_url,
          header_image_url: b.header_image_url,
          primary_color: b.primary_color,
          footer_text: b.footer_text
        }
      });
      toast.success(t("etBrandSaved"));
      onSaved();
    } catch (e) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(CardTitle, { className: "text-base flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-4 w-4" }),
        t("etBrand")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t("etBrandHelp") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etAppName") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: b.app_name, onChange: (e) => setB({
            ...b,
            app_name: e.target.value
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etPrimaryColor") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: b.primary_color, onChange: (e) => setB({
              ...b,
              primary_color: e.target.value
            }), placeholder: "#0a0a0a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-9 w-9 rounded border shrink-0", style: {
              backgroundColor: b.primary_color
            } })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etLogoUrl") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: b.logo_url ?? "", onChange: (e) => setB({
            ...b,
            logo_url: e.target.value || null
          }), placeholder: "https://…/logo.png" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etHeaderUrl") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: b.header_image_url ?? "", onChange: (e) => setB({
            ...b,
            header_image_url: e.target.value || null
          }), placeholder: "https://…/banner.jpg" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: t("etGlobalFooter") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, value: b.footer_text ?? "", onChange: (e) => setB({
            ...b,
            footer_text: e.target.value || null
          }), placeholder: t("etGlobalFooterPlaceholder") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, children: [
        saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1" }),
        t("etSaveBrand")
      ] })
    ] })
  ] });
}
export {
  EmailTemplatesPage as component
};
