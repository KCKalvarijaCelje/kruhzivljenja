import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { currentMinistryStartYear, ministryLabel, ministryMonths } from "@/lib/ministry-year";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, MapPin, Plus, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StopMessages } from "@/components/stop-messages";
import { LocationLogo } from "@/components/location-logo";
import {
  serverGetPlannerData,
  serverUpdateScheduleStopAssignment,
  serverToggleStopCompletion,
} from "@/lib/planner.functions";

export const Route = createFileRoute("/_authenticated/planner/")({
  component: Planner,
});

type Stop = {
  id: string;
  sort_order: number;
  driver_id: string | null;
  coordinator_id: string | null;
  completed_at: string | null;
  completed_by: string | null;
  locations: { name: string } | null;
  driver: { full_name: string } | null;
  coordinator: { full_name: string } | null;
  completer: { full_name: string } | null;
};

type Row = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  schedule_stops: Stop[];
  date_recipients: { id: string }[];
};

function Planner() {
  const { t, tArr } = useI18n();
  const { isAdmin, roles, user } = useAuth();
  const isDriver = roles.includes("driver");
  const isCoord = roles.includes("coordinator");
  const canAdd = isAdmin;
  const [years, setYears] = useState<{ id: string; start_year: number; label: string }[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonthIdx, setActiveMonthIdx] = useState(0);
  const monthRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addLocId, setAddLocId] = useState("");
  const [addDriverId, setAddDriverId] = useState("");
  const [addCoordId, setAddCoordId] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addHhIds, setAddHhIds] = useState<Set<string>>(new Set());
  const [addSaving, setAddSaving] = useState(false);
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [people, setPeople] = useState<{ id: string; full_name: string }[]>([]);
  const [households, setHouseholds] = useState<{ id: string; name: string }[]>([]);
  const [myPersonId, setMyPersonId] = useState<string | null>(null);
  const [selfAssign, setSelfAssign] = useState<{ stopId: string; field: "driver" | "coordinator" } | null>(null);
  const [selfAssignSaving, setSelfAssignSaving] = useState(false);

  const loadPlanner = async (targetYearId?: string | null) => {
    setLoading(true);
    try {
      const res = await serverGetPlannerData({ data: { yearId: targetYearId ?? selectedYearId } });
      if (res.success) {
        setYears(res.years ?? []);
        const chosenYearId = targetYearId || selectedYearId || res.selectedYear?.id || null;
        if (chosenYearId && chosenYearId !== selectedYearId) {
          setSelectedYearId(chosenYearId);
        }
        setRows((res.dates ?? []) as any);
        setLocations(res.locations ?? []);
        setPeople(res.people ?? []);
        setHouseholds(res.households ?? []);
      }
    } catch (err) {
      console.error("loadPlanner error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner(selectedYearId);
  }, [selectedYearId]);

  useEffect(() => {
    if (!user) {
      setMyPersonId(null);
      return;
    }

    let cancelled = false;
    (async () => {
      const { data: profileMatches } = await supabase
        .from("people")
        .select("id")
        .eq("profile_id", user.id)
        .limit(1);
      const profileMatch = (profileMatches as any)?.[0];
      if (profileMatch?.id) {
        if (!cancelled) setMyPersonId(profileMatch.id);
        return;
      }

      const email = user.email?.trim();
      if (email) {
        const { data: emailMatches } = await supabase
          .from("people")
          .select("id")
          .eq("active", true)
          .ilike("email", email)
          .limit(1);
        const emailMatch = (emailMatches as any)?.[0];
        if (emailMatch?.id) {
          if (!cancelled) setMyPersonId(emailMatch.id);
          return;
        }
      }

      if (!cancelled) setMyPersonId(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    const today = new Date();
    const sy = years.find((y) => y.id === selectedYearId)?.start_year ?? 2026;
    const months = ministryMonths(sy);
    const idx = months.findIndex((m) => m.year === today.getFullYear() && m.month === today.getMonth());
    if (idx >= 0) setActiveMonthIdx(idx);
    else setActiveMonthIdx(0);
  }, [selectedYearId, years]);

  useEffect(() => {
    const el = monthRefs.current[activeMonthIdx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeMonthIdx]);

  const didScrollToUpcomingRef = useRef(false);

  const resetAddForm = () => {
    setAddDate("");
    setAddLocId("");
    setAddDriverId("");
    setAddCoordId("");
    setAddNotes("");
    setAddHhIds(new Set());
  };

  const addEntry = async () => {
    if (!selectedYearId || !addDate || !addLocId) return;
    setAddSaving(true);
    try {
      // 1) Find or create the schedule_date for this date
      let dateId: string | null = null;
      const { data: existing } = await supabase
        .from("schedule_dates")
        .select("id,notes")
        .eq("ministry_year_id", selectedYearId)
        .eq("date", addDate)
        .maybeSingle();
      if (existing) {
        dateId = existing.id;
        if (addNotes.trim()) {
          const merged = existing.notes ? `${existing.notes}\n${addNotes.trim()}` : addNotes.trim();
          await supabase.from("schedule_dates").update({ notes: merged }).eq("id", dateId);
        }
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from("schedule_dates")
          .insert({ ministry_year_id: selectedYearId, date: addDate, notes: addNotes.trim() || null })
          .select("id")
          .single();
        if (insErr || !inserted) {
          setAddSaving(false);
          return toast.error(insErr?.message ?? "Error");
        }
        dateId = inserted.id;
      }

      // 2) Determine sort_order for the new manual stop
      const { data: existingStops } = await supabase
        .from("schedule_stops")
        .select("sort_order")
        .eq("schedule_date_id", dateId)
        .order("sort_order", { ascending: false })
        .limit(1);
      const nextOrder = ((existingStops?.[0]?.sort_order as number | undefined) ?? -1) + 1;

      // 3) Insert manual one-off stop (rule_stop_id stays NULL → distinguishes from recurring)
      const { error: stopErr } = await supabase.from("schedule_stops").insert({
        schedule_date_id: dateId,
        location_id: addLocId,
        driver_id: addDriverId || null,
        coordinator_id: addCoordId || null,
        rule_stop_id: null,
        sort_order: nextOrder,
      });
      if (stopErr) {
        setAddSaving(false);
        return toast.error(stopErr.message);
      }

      // 4) Add selected recipient households (skip ones already present)
      if (addHhIds.size > 0) {
        const { data: existingRec } = await supabase
          .from("date_recipients")
          .select("household_id")
          .eq("schedule_date_id", dateId);
        const have = new Set((existingRec ?? []).map((r: any) => r.household_id).filter(Boolean));
        const toInsert = Array.from(addHhIds)
          .filter((hid) => !have.has(hid))
          .map((hid) => ({ schedule_date_id: dateId!, household_id: hid }));
        if (toInsert.length) await supabase.from("date_recipients").insert(toInsert);
      }

      toast.success(t("entryAdded"));
      setAddOpen(false);
      resetAddForm();
      loadPlanner(selectedYearId);
    } finally {
      setAddSaving(false);
    }
  };

  const currentYear = years.find((y) => y.id === selectedYearId);
  const months = useMemo(() => (currentYear ? ministryMonths(currentYear.start_year) : []), [currentYear]);
  const activeMonth = months[activeMonthIdx];

  const monthRows = useMemo(() => {
    if (!activeMonth) return [];
    return rows.filter((r) => {
      const d = new Date(r.date + "T00:00:00");
      return d.getFullYear() === activeMonth.year && d.getMonth() === activeMonth.month;
    });
  }, [rows, activeMonth]);

  // Next upcoming date (across full year) with at least one incomplete stop
  const nextUpcomingDateId = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = rows.find((r) => {
      const d = new Date(r.date + "T00:00:00");
      if (d < today) return false;
      const stops = r.schedule_stops ?? [];
      return stops.length > 0 && stops.some((s) => !s.completed_at);
    });
    return candidate?.id ?? null;
  }, [rows]);

  useEffect(() => {
    if (loading || didScrollToUpcomingRef.current || !nextUpcomingDateId || !activeMonth) return;
    const target = rows.find((r) => r.id === nextUpcomingDateId);
    if (!target) return;
    const d = new Date(target.date + "T00:00:00");
    if (d.getFullYear() !== activeMonth.year || d.getMonth() !== activeMonth.month) return;
    const id = window.setTimeout(() => {
      const el = document.getElementById(`stop-date-${nextUpcomingDateId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        didScrollToUpcomingRef.current = true;
      }
    }, 150);
    return () => window.clearTimeout(id);
  }, [loading, nextUpcomingDateId, rows, activeMonth]);

  const toggleComplete = async (stop: Stop) => {
    if (!selectedYearId) return;
    const completing = !stop.completed_at;
    if (completing && !isAdmin && !myPersonId) {
      toast.error(t("notLinkedToPerson"));
      return;
    }
    const patch = completing
      ? { completed_at: new Date().toISOString(), completed_by: isAdmin ? (stop.driver_id ?? stop.coordinator_id ?? myPersonId) : myPersonId }
      : { completed_at: null, completed_by: null };
    const { error } = await supabase.from("schedule_stops").update(patch as any).eq("id", stop.id);
    if (error) return toast.error(error.message);
    toast.success(t("saved"));
    loadPlanner(selectedYearId);
  };

  const confirmSelfAssign = async () => {
    if (!selfAssign || !selectedYearId) return;
    if (!myPersonId) {
      toast.error(t("notLinkedToPerson"));
      return;
    }

    setSelfAssignSaving(true);
    const patch = selfAssign.field === "driver" ? { driver_id: myPersonId } : { coordinator_id: myPersonId };
    const { data, error } = await supabase.from("schedule_stops").update(patch).eq("id", selfAssign.stopId).select("id").maybeSingle();
    setSelfAssignSaving(false);

    if (error) return toast.error(error.message);
    if (!data) return toast.error(t("alreadyAssigned"));
    toast.success(t("saved"));
    setSelfAssign(null);
    loadPlanner(selectedYearId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold">{t("planner")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {canAdd && currentYear && (
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />{t("addOneOffEntry")}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">{t("ministryYear")}:</span>
          <Select value={selectedYearId ?? undefined} onValueChange={setSelectedYearId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              {years.map((y) => <SelectItem key={y.id} value={y.id}>{ministryLabel(y.start_year)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!currentYear ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">{t("noDates")}</CardContent></Card>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 bg-card border rounded-xl p-2">
            <Button variant="ghost" size="icon" disabled={activeMonthIdx === 0} onClick={() => setActiveMonthIdx((i) => Math.max(0, i - 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-1 justify-center min-w-max">
                {months.map((m, i) => (
                  <button
                    key={`${m.year}-${m.month}`}
                    ref={(el) => { monthRefs.current[i] = el; }}
                    onClick={() => setActiveMonthIdx(i)}
                    className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${i === activeMonthIdx ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    {tArr("monthsShort")[m.month]}{m.month === 0 || i === 0 ? ` ${m.year}` : ""}
                  </button>
                ))}
              </div>
            </div>
            <Button variant="ghost" size="icon" disabled={activeMonthIdx === months.length - 1} onClick={() => setActiveMonthIdx((i) => Math.min(months.length - 1, i + 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-xl font-semibold capitalize">
            {activeMonth ? `${tArr("monthsLong")[activeMonth.month]} ${activeMonth.year}` : ""}
          </h2>

          {loading ? (
            <p className="text-muted-foreground">{t("loading")}</p>
          ) : monthRows.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">—</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {monthRows.map((r) => (
                <div key={r.id} id={`stop-date-${r.id}`} style={{ scrollMarginTop: 80 }}>
                  <DateCard
                    row={r}
                    isAdmin={isAdmin}
                    canSelfDriver={isDriver}
                    canSelfCoord={isCoord}
                    hasLinkedPerson={!!myPersonId}
                    myPersonId={myPersonId}
                    isNextUpcoming={r.id === nextUpcomingDateId}
                    onSelfAssign={(stopId: string, field: "driver" | "coordinator") => setSelfAssign({ stopId, field })}
                    onToggleComplete={toggleComplete}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) resetAddForm(); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("addOneOffEntry")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{t("date")}</Label>
              <Input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
            </div>
            <div>
              <Label>{t("location")}</Label>
              <Select value={addLocId || undefined} onValueChange={setAddLocId}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">{t("driver")} <span className="text-muted-foreground">({t("optional")})</span></Label>
                <Select value={addDriverId || "_none"} onValueChange={(v) => setAddDriverId(v === "_none" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                    {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">{t("coordinator")} <span className="text-muted-foreground">({t("optional")})</span></Label>
                <Select value={addCoordId || "_none"} onValueChange={(v) => setAddCoordId(v === "_none" ? "" : v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">— {t("unassigned")} —</SelectItem>
                    {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>{t("recipientsLabel")} <span className="text-muted-foreground">({t("optional")})</span></Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {households.length === 0 ? (
                  <p className="text-xs text-muted-foreground">—</p>
                ) : households.map((h) => {
                  const checked = addHhIds.has(h.id);
                  return (
                    <label key={h.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = new Set(addHhIds);
                          if (v) next.add(h.id); else next.delete(h.id);
                          setAddHhIds(next);
                        }}
                      />
                      <span>{h.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>{t("notesLabel")} <span className="text-muted-foreground">({t("optional")})</span></Label>
              <Textarea rows={2} value={addNotes} onChange={(e) => setAddNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>{t("cancel")}</Button>
            <Button onClick={addEntry} disabled={!addDate || !addLocId || addSaving}>{t("addEntry")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selfAssign} onOpenChange={(o) => !o && setSelfAssign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmSelfAssignTitle")}</DialogTitle>
            <DialogDescription>
              {selfAssign?.field === "driver" ? t("confirmSelfAssignDriver") : t("confirmSelfAssignDistributor")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelfAssign(null)} disabled={selfAssignSaving}>{t("cancel")}</Button>
            <Button onClick={confirmSelfAssign} disabled={selfAssignSaving}>{t("confirmAssign")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DateCard({
  row,
  isAdmin,
  canSelfDriver,
  canSelfCoord,
  hasLinkedPerson,
  myPersonId,
  isNextUpcoming,
  onSelfAssign,
  onToggleComplete,
}: {
  row: Row;
  isAdmin: boolean;
  canSelfDriver: boolean;
  canSelfCoord: boolean;
  hasLinkedPerson: boolean;
  myPersonId: string | null;
  isNextUpcoming: boolean;
  onSelfAssign: (stopId: string, field: "driver" | "coordinator") => void;
  onToggleComplete: (stop: Stop) => void;
}) {
  const { t, tArr } = useI18n();
  const d = new Date(row.date + "T00:00:00");
  const stops = (row.schedule_stops ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const allDone = stops.length > 0 && stops.every((s) => s.completed_at);
  const complete = stops.length > 0 && stops.every((s) => s.driver && s.coordinator);
  const totalRecipients = row.date_recipients?.length ?? 0;
  const highlightClasses = isNextUpcoming
    ? "ring-2 ring-accent ring-offset-2 ring-offset-background border-accent/60 bg-accent/5"
    : "";
  const content = (
    <Card className={`${isAdmin ? "hover:border-primary transition-colors " : ""}${highlightClasses}`}>
      <CardContent className="p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
        <div className="text-center w-10 sm:w-12 shrink-0">
          <div className="text-xs text-muted-foreground uppercase">{tArr("weekdaysShort")[d.getDay()]}</div>
          <div className="text-2xl font-bold leading-none">{d.getDate()}</div>
          {isNextUpcoming && (
            <div className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-foreground bg-accent rounded px-1 py-0.5">
              <Sparkles className="h-2.5 w-2.5" />
              <span className="whitespace-pre-line">{t("nextUpcoming")}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          {stops.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t("noStops")}</div>
          ) : (
            stops.map((s) => {
              const done = !!s.completed_at;
              const isAssigned = !!myPersonId && (s.driver_id === myPersonId || s.coordinator_id === myPersonId);
              // Admins do NOT see a mark-complete button on the planner card —
              // completion is primarily a driver/distributor operational action.
              const canToggle = !isAdmin && isAssigned;
              return (
                <div key={s.id} className={`text-sm space-y-2 min-w-0 ${done ? "opacity-70" : ""}`}>
                  <div className="flex items-center gap-2 font-semibold text-slate-900 min-w-0">
                    <LocationLogo name={s.locations?.name} size="sm" />
                    <span className={`break-words min-w-0 ${done ? "line-through decoration-muted-foreground/60" : ""}`}>
                      {s.locations?.name ?? "—"}
                    </span>
                    {done && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 ml-1" />}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 sm:ml-5 min-w-0">
                    <SelfAssignSlot
                      label={t("driver")}
                      assignedName={s.driver?.full_name ?? null}
                      canAssign={canSelfDriver && hasLinkedPerson && !s.driver_id}
                      buttonLabel={t("unassigned")}
                      onAssign={() => onSelfAssign(s.id, "driver")}
                    />
                    <SelfAssignSlot
                      label={t("coordinator")}
                      assignedName={s.coordinator?.full_name ?? null}
                      canAssign={canSelfCoord && hasLinkedPerson && !s.coordinator_id}
                      buttonLabel={t("unassigned")}
                      onAssign={() => onSelfAssign(s.id, "coordinator")}
                    />
                  </div>
                  {canToggle && (
                    <div className="sm:ml-5 flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={done ? "outline" : "default"}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleComplete(s); }}
                        className={done ? "" : "bg-success text-success-foreground hover:bg-success/90"}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {done ? t("markIncomplete") : t("markComplete")}
                      </Button>
                    </div>
                  )}
                  {done && s.completer?.full_name && (
                    <div className="sm:ml-5 text-xs text-muted-foreground">
                      {t("completedBy")}: {s.completer.full_name}
                    </div>
                  )}
                  {!isAdmin && (
                    <div className="sm:ml-5 pt-2 border-t border-border/40">
                      <StopMessages
                        stopId={s.id}
                        canPost={Boolean(
                          myPersonId &&
                            (s.driver_id === myPersonId || s.coordinator_id === myPersonId)
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {allDone ? (
            <Badge className="bg-success text-success-foreground whitespace-nowrap">{t("pickupCompleted")}</Badge>
          ) : (
            <Badge className={`${complete ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground font-bold ring-1 ring-destructive/40"} whitespace-nowrap`}>
              {complete ? t("complete") : t("incomplete")}
            </Badge>
          )}
          {isAdmin && <span className="text-xs text-muted-foreground">{totalRecipients} 🍞</span>}
        </div>
      </CardContent>
    </Card>
  );

  return isAdmin ? <Link to="/planner/$id" params={{ id: row.id }}>{content}</Link> : content;
}


function SelfAssignSlot({
  label,
  assignedName,
  canAssign,
  buttonLabel,
  onAssign,
}: {
  label: string;
  assignedName: string | null;
  canAssign: boolean;
  buttonLabel: string;
  onAssign: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-1 min-w-0">
      <div className="text-xs font-medium text-foreground">{label}</div>
      {assignedName ? (
        <Badge variant="secondary" className="max-w-full whitespace-normal break-words text-left">{assignedName}</Badge>
      ) : canAssign ? (
        <Button
          size="sm"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAssign(); }}
          className="h-auto min-h-8 py-1 whitespace-normal text-left bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold shadow-sm ring-1 ring-destructive/50"
        >
          {buttonLabel}
        </Button>
      ) : (
        <span className="text-xs italic text-muted-foreground">{t("unassigned")}</span>
      )}
    </div>
  );
}
