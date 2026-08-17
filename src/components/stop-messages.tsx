import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { formatAppDateTime } from "@/lib/tz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, Trash2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import {
  FOOD_CHIPS,
  appendFoodLine,
  applyModifier,
  RenderedMessage,
} from "@/lib/stop-message-format";

type Msg = {
  id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
};

export function StopMessages({
  stopId,
  canPost,
}: {
  stopId: string;
  canPost: boolean;
}) {
  const { t } = useI18n();
  const { user, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [modifierHint, setModifierHint] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const load = async () => {
    const { data, error } = await supabase
      .from("stop_messages")
      .select("id,author_id,author_name,body,created_at")
      .eq("schedule_stop_id", stopId)
      .order("created_at", { ascending: true });
    if (!error) setMessages((data ?? []) as Msg[]);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopId]);

  const addFood = (label: string) => {
    setDraft((d) => appendFoodLine(d, label));
    setModifierHint(false);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const addModifier = (sign: "+" | "-") => {
    setDraft((d) => {
      const next = applyModifier(d, sign);
      if (next === d) {
        setModifierHint(true);
        setTimeout(() => setModifierHint(false), 2000);
      }
      return next;
    });
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || !user) return;
    setSending(true);
    const authorName =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      "—";
    const { error } = await supabase.from("stop_messages").insert({
      schedule_stop_id: stopId,
      author_id: user.id,
      author_name: authorName,
      body,
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setDraft("");
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("stop_messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setMessages((m) => m.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        <MessageSquare className="h-3.5 w-3.5" />
        {t("messages")}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" />…</div>
      ) : messages.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">{t("noMessages")}</p>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => {
            const canDelete = isAdmin || (user && m.author_id === user.id);
            return (
              <li key={m.id} className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground truncate">{m.author_name}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">{formatAppDateTime(new Date(m.created_at))}</span>
                </div>
                <div className="flex items-start justify-between gap-2 mt-1">
                  <RenderedMessage body={m.body} className="text-foreground/90 text-sm flex-1 min-w-0" />
                  {canDelete && (
                    <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => remove(m.id)} title={t("delete")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {canPost && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {FOOD_CHIPS.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => addFood(t(key))}
                className="inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Icon className="h-3 w-3" />
                {t(key)}
              </button>
            ))}
            <span className="w-full h-0" />
            <button
              type="button"
              onClick={() => addModifier("+")}
              className="inline-flex items-center gap-1 rounded-full border bg-primary/10 text-primary px-2.5 py-1 text-xs hover:bg-primary/20 transition-colors"
              title={t("chipExtraAmount")}
            >
              <Plus className="h-3 w-3" />
              {t("chipExtraAmount")}
            </button>
            <button
              type="button"
              onClick={() => addModifier("-")}
              className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              title={t("chipSmallAmount")}
            >
              <Minus className="h-3 w-3" />
              {t("chipSmallAmount")}
            </button>
          </div>
          {modifierHint && (
            <p className="text-[11px] text-muted-foreground italic">{t("modifierHint")}</p>
          )}
          <Textarea
            ref={textareaRef}
            rows={4}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("messagePlaceholder")}
            className="font-mono text-sm"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={send} disabled={!draft.trim() || sending}>
              {sending ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
              {t("send")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
