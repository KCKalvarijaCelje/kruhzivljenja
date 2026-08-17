import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Repeat, ShieldAlert, MapPin } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/templates")({ component: TemplatesPage });

type Rule = { id: string; weekday: number; frequency: string; active: boolean };
type RuleStop = {
  id: string;
  rule_id: string;
  location_id: string;
  default_driver_id: string | null;
  default_coordinator_id: string | null;
  sort_order: number;
  locations: { name: string } | null;
};
type Template = { id: string; rule_id: string; household_id: string; recipient_households: { name: string; size: number } | null };

function TemplatesPage() {
  const { t, tArr } = useI18n();
  const { isAdmin } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleStops, setRuleStops] = useState<RuleStop[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [hhPick, setHhPick] = useState<Record<string, string>>({});
  const [locPick, setLocPick] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: rls }, { data: rs }, { data: ppl }, { data: hh }, { data: locs }, { data: tpl }] = await Promise.all([
      supabase.from("recurring_schedule_rules").select("*").order("weekday").order("frequency"),
      supabase.from("recurring_schedule_rule_stops").select("*,locations(name)").order("sort_order"),
      supabase.from("people").select("id,full_name").eq("active", true).order("full_name"),
      supabase.from("recipient_households").select("id,name,size").eq("active", true).order("name"),
      supabase.from("locations").select("id,name").eq("active", true).order("name"),
      supabase.from("recurring_recipient_templates").select("id,rule_id,household_id,recipient_households(name,size)"),
    ]);
    setRules((rls ?? []) as any);
    setRuleStops((rs ?? []) as any);
    setPeople(ppl ?? []);
    setHouseholds(hh ?? []);
    setLocations(locs ?? []);
    setTemplates((tpl ?? []) as any);
  };
  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  if (!isAdmin) {
    return <Card><CardContent className="py-12 text-center text-muted-foreground">
      <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-warning" />Admin only.
    </CardContent></Card>;
  }

  const addRecipient = async (rule_id: string) => {
    const hid = hhPick[rule_id];
    if (!hid) return;
    const { error } = await supabase.from("recurring_recipient_templates").insert({ rule_id, household_id: hid });
    if (error) return toast.error(error.message);
    setHhPick({ ...hhPick, [rule_id]: "" });
    load();
  };
  const removeRecipient = async (id: string) => {
    await supabase.from("recurring_recipient_templates").delete().eq("id", id);
    load();
  };
  const applyRecipients = async (rule_id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase.rpc("apply_template_to_future", { _rule_id: rule_id, _from_date: today });
    if (error) return toast.error(error.message);
    const result = (data ?? {}) as { inserted?: number; deleted?: number };
    const ins = result.inserted ?? 0;
    const del = result.deleted ?? 0;
    toast.success(`${t("appliedToFuture")} (+${ins} / -${del})`);
  };

  const addStop = async (rule_id: string) => {
    const lid = locPick[rule_id];
    if (!lid) return;
    const existing = ruleStops.filter((s) => s.rule_id === rule_id);
    const nextOrder = (existing[existing.length - 1]?.sort_order ?? -1) + 1;
    const { error } = await supabase.from("recurring_schedule_rule_stops").insert({
      rule_id, location_id: lid, sort_order: nextOrder,
    });
    if (error) {
      if (error.code === "23505") return toast.error(t("stopExists"));
      return toast.error(error.message);
    }
    setLocPick({ ...locPick, [rule_id]: "" });
    load();
  };
  const removeStop = async (id: string) => {
    if (!confirm(t("removeStop") + "?")) return;
    const { error } = await supabase.from("recurring_schedule_rule_stops").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  const updateStop = async (id: string, patch: Partial<RuleStop>) => {
    const { error } = await supabase.from("recurring_schedule_rule_stops").update(patch as any).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(t("defaultsSaved"));
    load();
  };
  const applyAssignments = async (rule_stop_id: string, override: boolean) => {
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.rpc("apply_assignments_to_future", { _rule_stop_id: rule_stop_id, _from_date: today, _override: override });
    if (error) return toast.error(error.message);
    toast.success(t("appliedToFuture"));
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold flex items-center gap-2"><Repeat className="h-7 w-7 text-primary" />{t("recurringTemplates")}</h1>

      {rules.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">—</CardContent></Card>
      ) : rules.map((r) => {
        const stops = ruleStops.filter((s) => s.rule_id === r.id);
        const items = templates.filter((tp) => tp.rule_id === r.id);
        const usedHhIds = new Set(items.map((i) => i.household_id));
        const availableHh = households.filter((h) => !usedHhIds.has(h.id));
        const usedLocIds = new Set(stops.map((s) => s.location_id));
        const availableLoc = locations.filter((l) => !usedLocIds.has(l.id));
        return (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                <span>
                  {tArr("weekdaysShort")[r.weekday]}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {r.frequency === "weekly" ? t("weekly") : t("biweekly")}
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{t("locationStops")} ({stops.length})</Label>
                {stops.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noStops")}</p>
                ) : stops.map((s) => (
                  <div key={s.id} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 font-medium text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {s.locations?.name ?? "—"}
                      </span>
                      <Button size="icon" variant="ghost" onClick={() => removeStop(s.id)} title={t("removeStop")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">{t("defaultDriver")}</Label>
                        <Select value={s.default_driver_id ?? "_none"} onValueChange={(v) => updateStop(s.id, { default_driver_id: v === "_none" ? null : v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                            {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">{t("defaultCoordinator")}</Label>
                        <Select value={s.default_coordinator_id ?? "_none"} onValueChange={(v) => updateStop(s.id, { default_coordinator_id: v === "_none" ? null : v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                            {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => applyAssignments(s.id, false)}>{t("fillBlanksOnly")}</Button>
                      <Button size="sm" variant="outline" onClick={() => applyAssignments(s.id, true)}>{t("overrideExisting")}</Button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Select value={locPick[r.id] ?? ""} onValueChange={(v) => setLocPick({ ...locPick, [r.id]: v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder={t("location")} /></SelectTrigger>
                    <SelectContent>
                      {availableLoc.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={() => addStop(r.id)} disabled={!locPick[r.id]}>
                    <Plus className="h-4 w-4 mr-1" />{t("addStopToTemplate")}
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <Label className="text-sm font-semibold">{t("sharedRecipients")} ({items.length})</Label>
                  <Button size="sm" variant="outline" onClick={() => applyRecipients(r.id)}>{t("applyToFuture")}</Button>
                </div>
                {items.length === 0 ? <p className="text-sm text-muted-foreground">—</p> : (
                  <ul className="divide-y">
                    {items.map((it) => (
                      <li key={it.id} className="py-2 flex items-center justify-between">
                        <span>{it.recipient_households?.name} <Badge variant="secondary" className="ml-2">{it.recipient_households?.size}</Badge></span>
                        <Button size="icon" variant="ghost" onClick={() => removeRecipient(it.id)}><Trash2 className="h-4 w-4" /></Button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Select value={hhPick[r.id] ?? ""} onValueChange={(v) => setHhPick({ ...hhPick, [r.id]: v })}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder={t("selectHousehold")} /></SelectTrigger>
                    <SelectContent>
                      {availableHh.map((h) => <SelectItem key={h.id} value={h.id}>{h.name} ({h.size})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => addRecipient(r.id)} disabled={!hhPick[r.id]}><Plus className="h-4 w-4 mr-1" />{t("addToTemplate")}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
