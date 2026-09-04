import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-BqZHQrkq.mjs";
import { a as useI18n, u as useAuth } from "./router-Yc5lMt1t.mjs";
import { b as formatAppDateTime } from "./tz-CU05rO0J.mjs";
import { B as Button } from "./button-Dq7LlB-Y.mjs";
import { T as Textarea } from "./textarea-CEgdDdB9.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { f as formatDisplayName } from "./utils-BhSPcRjB.mjs";
import { R as RenderedMessage, F as FOOD_CHIPS, a as appendFoodLine, b as applyModifier } from "./stop-message-format-DLdNtFNN.mjs";
import { j as MessageSquare, c as LoaderCircle, T as Trash2, P as Plus, aa as Minus, a3 as Send } from "../_libs/lucide-react.mjs";
function StopMessages({
  stopId,
  canPost
}) {
  const { t } = useI18n();
  const { user, isAdmin, roles } = useAuth();
  const [messages, setMessages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [draft, setDraft] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [modifierHint, setModifierHint] = reactExports.useState(false);
  const textareaRef = reactExports.useRef(null);
  const load = async () => {
    const { data, error } = await supabase.from("stop_messages").select("id,author_id,author_name,body,created_at").eq("schedule_stop_id", stopId).order("created_at", { ascending: true });
    if (!error) setMessages(data ?? []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    void load();
  }, [stopId]);
  const addFood = (label) => {
    setDraft((d) => appendFoodLine(d, label));
    setModifierHint(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };
  const addModifier = (sign) => {
    setDraft((d) => {
      const next = applyModifier(d, sign);
      if (next === d) {
        setModifierHint(true);
        setTimeout(() => setModifierHint(false), 2e3);
      }
      return next;
    });
  };
  const send = async () => {
    const body = draft.trim();
    if (!body || !user) return;
    setSending(true);
    const authorName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "—";
    const { error } = await supabase.from("stop_messages").insert({
      schedule_stop_id: stopId,
      author_id: user.id,
      author_name: authorName,
      body
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setDraft("");
    void load();
  };
  const remove = async (id) => {
    const { error } = await supabase.from("stop_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((m) => m.filter((x) => x.id !== id));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-3.5 w-3.5" }),
      t("messages")
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
      "…"
    ] }) : messages.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs italic text-muted-foreground", children: t("noMessages") }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: messages.map((m) => {
      const canDelete = isAdmin || user && m.author_id === user.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "rounded-md bg-muted/40 px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground truncate", children: formatDisplayName(m.author_name, { isAdmin, roles }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground shrink-0 tabular-nums", children: formatAppDateTime(new Date(m.created_at)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RenderedMessage, { body: m.body, className: "text-foreground/90 text-sm flex-1 min-w-0" }),
          canDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6 shrink-0", onClick: () => remove(m.id), title: t("delete"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, m.id);
    }) }),
    canPost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
        FOOD_CHIPS.map(({ key, Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => addFood(t(key)),
            className: "inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3 w-3" }),
              t(key)
            ]
          },
          key
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full h-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => addModifier("+"),
            className: "inline-flex items-center gap-1 rounded-full border bg-primary/10 text-primary px-2.5 py-1 text-xs hover:bg-primary/20 transition-colors",
            title: t("chipExtraAmount"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3 w-3" }),
              t("chipExtraAmount")
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => addModifier("-"),
            className: "inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors",
            title: t("chipSmallAmount"),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3 w-3" }),
              t("chipSmallAmount")
            ]
          }
        )
      ] }),
      modifierHint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground italic", children: t("modifierHint") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          ref: textareaRef,
          rows: 4,
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          placeholder: t("messagePlaceholder"),
          className: "font-mono text-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: send, disabled: !draft.trim() || sending, children: [
        sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 mr-1 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5 mr-1" }),
        t("send")
      ] }) })
    ] })
  ] });
}
export {
  StopMessages as S
};
