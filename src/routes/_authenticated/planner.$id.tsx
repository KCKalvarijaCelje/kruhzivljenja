import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { sendDriverNotification } from "@/lib/driver-emails.functions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, Plus, Loader2, MapPin, Repeat } from "lucide-react";
import { toast } from "sonner";
import { StopMessages } from "@/components/stop-messages";

export const Route = createFileRoute("/_authenticated/planner/$id")({
  component: DateDetail,
});

type Recipient = {
  id: string;
  schedule_date_id: string;
  manual_name: string | null;
  household_id: string | null;
  person_id: string | null;
  force_include: boolean;
  recipient_households: { name: string; person_id: string | null } | null;
  people: { full_name: string } | null;
};

type Stop = {
  id: string;
  schedule_date_id: string;
  sort_order: number;
  location_id: string | null;
  driver_id: string | null;
  coordinator_id: string | null;
  rule_stop_id: string | null;
  notes: string | null;
  locations: { name: string } | null;
};

function DateDetail() {
  const { id } = useParams({ from: "/_authenticated/planner/$id" });
  const { t, tArr } = useI18n();
  const { isAdmin, roles, user } = useAuth();
  const isDriver = roles.includes("driver");
  const isCoord = roles.includes("coordinator");
  const [myPersonId, setMyPersonId] = useState<string | null>(null);
  const [row, setRow] = useState<any>(null);
  const [stops, setStops] = useState<Stop[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [ruleStopMap, setRuleStopMap] = useState<Record<string, string>>({}); // rule_stop_id -> rule_id
  const [templateHhIds, setTemplateHhIds] = useState<Set<string>>(new Set());
  const [dayRuleIds, setDayRuleIds] = useState<string[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [addStopLoc, setAddStopLoc] = useState("");
  const [manual, setManual] = useState("");
  const [hhPick, setHhPick] = useState("");
  const [scopePrompt, setScopePrompt] = useState<{
    stopId: string;
    ruleStopId: string;
    field: "driver" | "coordinator";
    personId: string | null;
  } | null>(null);
  const [pickupMap, setPickupMap] = useState<Map<string, Set<string>>>(new Map()); // person_id -> household_ids
  const [prevId, setPrevId] = useState<string | null>(null);
  const [nextId, setNextId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase.from("people").select("id").eq("profile_id", user.id).maybeSingle().then(({ data }) => {
      setMyPersonId((data as any)?.id ?? null);
    });
  }, [user]);


  const load = async () => {
    const [{ data: r }, { data: st }, { data: dr }, { data: ppl }, { data: hh }, { data: locs }] = await Promise.all([
      supabase.from("schedule_dates").select("*").eq("id", id).single(),
      supabase.from("schedule_stops").select("*,locations(name)").eq("schedule_date_id", id).order("sort_order"),
      supabase.from("date_recipients").select("id,schedule_date_id,manual_name,household_id,person_id,force_include,recipient_households(name,person_id),people(full_name)").eq("schedule_date_id", id),
      supabase.from("people").select("id,full_name").eq("active", true).order("full_name"),
      supabase.from("recipient_households").select("id,name,size").eq("active", true).order("name"),
      supabase.from("locations").select("id,name").eq("active", true).order("name"),
    ]);
    setRow(r);
    setNotes(r?.notes ?? "");
    setStops((st ?? []) as any);
    setRecipients((dr ?? []) as any);
    setPeople(ppl ?? []);
    setHouseholds(hh ?? []);
    setLocations(locs ?? []);

    if (r) {
      const [{ data: prevRow }, { data: nextRow }] = await Promise.all([
        supabase.from("schedule_dates").select("id").eq("ministry_year_id", r.ministry_year_id).lt("date", r.date).order("date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("schedule_dates").select("id").eq("ministry_year_id", r.ministry_year_id).gt("date", r.date).order("date", { ascending: true }).limit(1).maybeSingle(),
      ]);
      setPrevId(prevRow?.id ?? null);
      setNextId(nextRow?.id ?? null);
    } else {
      setPrevId(null);
      setNextId(null);
    }

    const { data: pickup } = await (supabase as any).from("driver_pickup_households").select("person_id,household_id");
    const pm = new Map<string, Set<string>>();
    for (const p of (pickup ?? []) as Array<{ person_id: string; household_id: string }>) {
      if (!pm.has(p.person_id)) pm.set(p.person_id, new Set());
      pm.get(p.person_id)!.add(p.household_id);
    }
    setPickupMap(pm);


    const ruleStopIds = Array.from(new Set((st ?? []).map((s: any) => s.rule_stop_id).filter(Boolean))) as string[];
    if (ruleStopIds.length) {
      const { data: rs } = await supabase.from("recurring_schedule_rule_stops").select("id,rule_id").in("id", ruleStopIds);
      const map: Record<string, string> = {};
      (rs ?? []).forEach((x: any) => { map[x.id] = x.rule_id; });
      setRuleStopMap(map);
      const ruleIds = Array.from(new Set(Object.values(map)));
      setDayRuleIds(ruleIds);
      if (ruleIds.length) {
        const { data: tpl } = await supabase.from("recurring_recipient_templates").select("household_id").in("rule_id", ruleIds);
        setTemplateHhIds(new Set((tpl ?? []).map((t: any) => t.household_id)));
      } else setTemplateHhIds(new Set());
    } else {
      setRuleStopMap({});
      setDayRuleIds([]);
      setTemplateHhIds(new Set());
    }

    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    const { error } = await supabase.from("schedule_dates").update({ notes }).eq("id", id);
    setSavingNotes(false);
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
  };

  const addStop = async () => {
    if (!addStopLoc) return;
    const nextOrder = (stops[stops.length - 1]?.sort_order ?? -1) + 1;
    const { error } = await supabase.from("schedule_stops").insert({
      schedule_date_id: id,
      location_id: addStopLoc,
      sort_order: nextOrder,
    });
    if (error) {
      if (error.code === "23505") return toast.error(t("stopExists"));
      return toast.error(error.message);
    }
    setAddStopOpen(false);
    setAddStopLoc("");
    toast.success(t("saved"));
    load();
  };

  const removeStop = async (stopId: string) => {
    if (!confirm(t("removeStop") + "?")) return;
    const { error } = await supabase.from("schedule_stops").delete().eq("id", stopId);
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
    load();
  };

  const updateStop = async (stopId: string, patch: any) => {
    const { error } = await supabase.from("schedule_stops").update(patch).eq("id", stopId);
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
    load();
  };

  // Intercept driver/coordinator changes on stops linked to a recurring template:
  // ask whether to apply only here, to future dates too, or also update the template.
  const notifyDriver = useServerFn(sendDriverNotification);
  const fireNotify = async (stopId: string, type: "assignment" | "change", personId: string | null) => {
    if (!personId) return;
    try { await notifyDriver({ data: { stopIds: [stopId], type } }); } catch (e) { console.error(e); }
  };

  const handlePersonChange = (stop: Stop, field: "driver" | "coordinator", personId: string | null) => {
    const prevDriverId = stop.driver_id;
    return updateStop(stop.id, field === "driver" ? { driver_id: personId } : { coordinator_id: personId })
      .then(() => {
        if (field === "driver") {
          const type = prevDriverId ? "change" : "assignment";
          fireNotify(stop.id, type, personId);
        }
      });
  };

  const applyScope = async (scope: "only" | "future" | "template") => {
    if (!scopePrompt || !row) return;
    const { stopId, ruleStopId, field, personId } = scopePrompt;
    const prevDriverId = stops.find((s) => s.id === stopId)?.driver_id ?? null;
    setScopePrompt(null);
    if (scope === "only") {
      await updateStop(stopId, field === "driver" ? { driver_id: personId } : { coordinator_id: personId });
      if (field === "driver") {
        await fireNotify(stopId, prevDriverId ? "change" : "assignment", personId);
      }
      return;
    }
    const { error } = await supabase.rpc("apply_person_to_future", {
      _rule_stop_id: ruleStopId,
      _from_date: row.date,
      _field: field,
      _person_id: personId as any,
      _update_template: scope === "template",
    });
    if (error) return toast.error(error.message);
    toast.success(t("scopeApplied"));
    load();
    if (field === "driver") {
      // Notify for this stop only; future-date sends will happen via the cron reminder
      // or when admin opens those dates.
      await fireNotify(stopId, prevDriverId ? "change" : "assignment", personId);
    }
  };

  const addHousehold = async (hid: string) => {
    const { error } = await supabase.from("date_recipients").insert({ schedule_date_id: id, household_id: hid });
    if (error) return toast.error(error.message);
    setHhPick("");
    load();
  };
  const addPerson = async (pid: string) => {
    const { error } = await supabase.from("date_recipients").insert({ schedule_date_id: id, person_id: pid });
    if (error) return toast.error(error.message);
    load();
  };
  const addManual = async () => {
    if (!manual.trim()) return;
    const { error } = await supabase.from("date_recipients").insert({ schedule_date_id: id, manual_name: manual.trim() });
    if (error) return toast.error(error.message);
    setManual("");
    load();
  };
  const removeRecipient = async (rid: string) => {
    await supabase.from("date_recipients").delete().eq("id", rid);
    load();
  };

  const addToTemplate = async (hid: string) => {
    const ruleId = dayRuleIds[0];
    if (!ruleId) return toast.error(t("noRule"));
    const { error } = await supabase.from("recurring_recipient_templates").insert({ rule_id: ruleId, household_id: hid });
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
    load();
  };
  const removeFromTemplate = async (hid: string) => {
    if (!dayRuleIds.length) return;
    await supabase.from("recurring_recipient_templates").delete().in("rule_id", dayRuleIds).eq("household_id", hid);
    toast.success(t("saved"));
    load();
  };
  const toggleForceInclude = async (rid: string, current: boolean) => {
    const { error } = await (supabase as any).from("date_recipients").update({ force_include: !current }).eq("id", rid);
    if (error) return toast.error(error.message);
    load();
  };
  const applyRecipientsToFuture = async () => {
    const ruleId = dayRuleIds[0];
    if (!ruleId || !row) return toast.error(t("noRule"));
    const { error } = await supabase.rpc("apply_template_to_future", { _rule_id: ruleId, _from_date: row.date });
    if (error) return toast.error(error.message);
    toast.success(t("appliedToFuture"));
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!row) return <p>—</p>;

  const d = new Date(row.date + "T00:00:00");
  const complete = stops.length > 0 && stops.every((s) => s.driver_id && s.coordinator_id);
  const usedHhIds = new Set(recipients.filter((r) => r.household_id).map((r) => r.household_id!));

  // Driver-based exclusion
  const driverIds = stops.map((s) => s.driver_id).filter(Boolean) as string[];
  const excludedHh = new Set<string>();
  for (const pid of driverIds) {
    const linked = pickupMap.get(pid);
    if (linked) for (const hid of linked) excludedHh.add(hid);
  }
  for (const r of recipients) {
    const ownerPid = r.recipient_households?.person_id;
    if (ownerPid && driverIds.includes(ownerPid) && r.household_id) excludedHh.add(r.household_id);
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Link to="/planner" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />{t("back")}
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!prevId} onClick={() => prevId && navigate({ to: "/planner/$id", params: { id: prevId } })}>
            <ChevronLeft className="h-4 w-4" />{t("previousDay")}
          </Button>
          <Button variant="outline" size="sm" disabled={!nextId} onClick={() => nextId && navigate({ to: "/planner/$id", params: { id: nextId } })}>
            {t("nextDay")}<ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h1 className="text-3xl font-bold capitalize">
          {tArr("weekdaysShort")[d.getDay()]} · {d.getDate()}. {tArr("monthsLong")[d.getMonth()]} {d.getFullYear()}
        </h1>
        <Badge className={complete ? "bg-success text-success-foreground" : ""} variant={complete ? "default" : "outline"}>
          {complete ? t("complete") : t("incomplete")}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">{t("stops")} ({stops.length})</h2>
        {isAdmin && (
          <Button size="sm" variant="outline" onClick={() => setAddStopOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />{t("addStop")}
          </Button>
        )}
      </div>

      {stops.length === 0 ? (
        <Card><CardContent className="py-6 text-center text-muted-foreground">{t("noStops")}</CardContent></Card>
      ) : (
        stops.map((stop) => (
          <Card key={stop.id}>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {stop.locations?.name ?? t("unassigned")}
                  {stop.rule_stop_id === null && (
                    <Badge variant="outline" className="text-xs">{t("oneOffEntry")}</Badge>
                  )}
                </span>
                {isAdmin && (
                  <Button size="icon" variant="ghost" onClick={() => removeStop(stop.id)} title={t("removeStop")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isAdmin ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">{t("location")}</Label>
                    <Select value={stop.location_id ?? "_none"} onValueChange={(v) => updateStop(stop.id, { location_id: v === "_none" ? null : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                        {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">{t("driver")}</Label>
                      <Select value={stop.driver_id ?? "_none"} onValueChange={(v) => handlePersonChange(stop, "driver", v === "_none" ? null : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                          {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">{t("coordinator")}</Label>
                      <Select value={stop.coordinator_id ?? "_none"} onValueChange={(v) => handlePersonChange(stop, "coordinator", v === "_none" ? null : v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                          {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ) : (
                <ReadOnlySlots
                  stop={stop}
                  people={people}
                  myPersonId={myPersonId}
                  canSelfDriver={isDriver}
                  canSelfCoord={isCoord}
                  onSelfAssign={(field) => {
                    if (!myPersonId) { toast.error(t("notLinkedToPerson")); return; }
                    updateStop(stop.id, field === "driver" ? { driver_id: myPersonId } : { coordinator_id: myPersonId })
                      .then(() => { if (field === "driver") fireNotify(stop.id, "assignment", myPersonId); });
                  }}
                />
              )}
              <div className="pt-3 border-t">
                <StopMessages
                  stopId={stop.id}
                  canPost={Boolean(
                    isAdmin ||
                      (myPersonId &&
                        (stop.driver_id === myPersonId || stop.coordinator_id === myPersonId))
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between gap-2 flex-wrap">
            <span>{t("sharedRecipients")} ({recipients.length})</span>
            {isAdmin && dayRuleIds.length > 0 && (
              <Button size="sm" variant="outline" onClick={applyRecipientsToFuture}>
                <Repeat className="h-3.5 w-3.5 mr-1" />{t("applyToFuture")}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recipients.length > 0 && (
            <ul className="divide-y">
              {recipients.map((r) => {
                const inTemplate = r.household_id && templateHhIds.has(r.household_id);
                const isExcluded = !!r.household_id && excludedHh.has(r.household_id) && !r.force_include;
                return (
                  <li key={r.id} className={`py-2 flex items-center justify-between gap-2 ${isExcluded ? "opacity-60" : ""}`}>
                    <span className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className={`truncate text-sm ${isExcluded ? "line-through" : ""}`}>{r.recipient_households?.name ?? r.people?.full_name ?? r.manual_name}</span>
                      {inTemplate && <Badge variant="secondary" className="shrink-0"><Repeat className="h-3 w-3 mr-1" />tpl</Badge>}
                      {isExcluded && <Badge variant="outline" className="shrink-0 text-xs border-warning/40 text-warning">{t("pickedUpByDriver")}</Badge>}
                      {r.force_include && r.household_id && excludedHh.has(r.household_id) && (
                        <Badge variant="outline" className="shrink-0 text-xs">{t("forceIncludeLabel")}</Badge>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {isAdmin && r.household_id && excludedHh.has(r.household_id) && (
                        <Button size="sm" variant="ghost" onClick={() => toggleForceInclude(r.id, r.force_include)} title={t("forceIncludeLabel")}>
                          {r.force_include ? "✓" : "+"}
                        </Button>
                      )}
                      {isAdmin && dayRuleIds.length > 0 && r.household_id && (
                        inTemplate ? (
                          <Button size="sm" variant="ghost" onClick={() => removeFromTemplate(r.household_id!)}>−tpl</Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => addToTemplate(r.household_id!)}>+tpl</Button>
                        )
                      )}
                      {isAdmin && (
                        <Button size="icon" variant="ghost" onClick={() => removeRecipient(r.id)}><Trash2 className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {isAdmin && (
            <div className="grid gap-2 pt-2">
              <Select value={hhPick} onValueChange={(v) => v && addHousehold(v)}>
                <SelectTrigger><SelectValue placeholder={t("selectHousehold")} /></SelectTrigger>
                <SelectContent>
                  {households.filter((h) => !usedHhIds.has(h.id)).map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name} ({h.size})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value="" onValueChange={(v) => v && addPerson(v)}>
                <SelectTrigger><SelectValue placeholder={t("selectPerson")} /></SelectTrigger>
                <SelectContent>
                  {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input placeholder={t("addManualName")} value={manual} onChange={(e) => setManual(e.target.value)} />
                <Button onClick={addManual}><Plus className="h-4 w-4 mr-1" />{t("addRecipient")}</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("notes")}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {isAdmin ? (
            <>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t("notePlaceholder")} />
              <Button onClick={saveNotes} disabled={savingNotes}>
                {savingNotes && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{t("saveNotes")}
              </Button>
            </>
          ) : (
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{notes || "—"}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={addStopOpen} onOpenChange={setAddStopOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("addStop")}</DialogTitle></DialogHeader>
          <div>
            <Label>{t("location")}</Label>
            <Select value={addStopLoc} onValueChange={setAddStopLoc}>
              <SelectTrigger><SelectValue placeholder={t("location")} /></SelectTrigger>
              <SelectContent>
                {locations.filter((l) => !stops.some((s) => s.location_id === l.id)).map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddStopOpen(false)}>{t("cancel")}</Button>
            <Button onClick={addStop} disabled={!addStopLoc}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!scopePrompt} onOpenChange={(o) => !o && setScopePrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("applyScopeTitle")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("applyScopeHint")}</p>
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="outline" onClick={() => applyScope("only")}>{t("scopeOnlyThis")}</Button>
            <Button variant="outline" onClick={() => applyScope("future")}>{t("scopeThisAndFuture")}</Button>
            <Button onClick={() => applyScope("template")}>{t("scopeUpdateTemplate")}</Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScopePrompt(null)}>{t("cancel")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <span className="hidden">{Object.keys(ruleStopMap).length}</span>
    </div>
  );
}

function ReadOnlySlots({
  stop,
  people,
  myPersonId,
  canSelfDriver,
  canSelfCoord,
  onSelfAssign,
}: {
  stop: Stop;
  people: { id: string; full_name: string }[];
  myPersonId: string | null;
  canSelfDriver: boolean;
  canSelfCoord: boolean;
  onSelfAssign: (field: "driver" | "coordinator") => void;
}) {
  const { t } = useI18n();
  const nameOf = (pid: string | null) => (pid ? people.find((p) => p.id === pid)?.full_name ?? "—" : null);
  const driverName = nameOf(stop.driver_id);
  const coordName = nameOf(stop.coordinator_id);
  const isMeDriver = !!myPersonId && stop.driver_id === myPersonId;
  const isMeCoord = !!myPersonId && stop.coordinator_id === myPersonId;
  return (
    <div className="grid sm:grid-cols-2 gap-3 text-sm">
      <div>
        <Label className="text-xs">{t("driver")}</Label>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {stop.driver_id ? (
            <Badge variant={isMeDriver ? "default" : "secondary"}>{driverName}</Badge>
          ) : (
            <span className="italic text-muted-foreground">{t("unassigned")}</span>
          )}
          {canSelfDriver && !stop.driver_id && (
            <Button size="sm" variant="outline" onClick={() => onSelfAssign("driver")}>
              {t("assignMeAsDriver")}
            </Button>
          )}
        </div>
      </div>
      <div>
        <Label className="text-xs">{t("coordinator")}</Label>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {stop.coordinator_id ? (
            <Badge variant={isMeCoord ? "default" : "secondary"}>{coordName}</Badge>
          ) : (
            <span className="italic text-muted-foreground">{t("unassigned")}</span>
          )}
          {canSelfCoord && !stop.coordinator_id && (
            <Button size="sm" variant="outline" onClick={() => onSelfAssign("coordinator")}>
              {t("assignMeAsDistributor")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

