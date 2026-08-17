import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { currentMinistryStartYear, ministryLabel } from "@/lib/ministry-year";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

const ROLES = ["admin", "driver", "coordinator"] as const;
const WEEKDAYS_KEY = ["weekdaysShort"] as const;

function AdminPage() {
  const { t, tArr } = useI18n();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [newYear, setNewYear] = useState<number>(currentMinistryStartYear());
  const [newLoc, setNewLoc] = useState("");
  const [newRule, setNewRule] = useState<{ weekday: number; frequency: string }>({ weekday: 1, frequency: "weekly" });

  const loadAll = async () => {
    const [{ data: profs }, { data: yrs }, { data: locs }, { data: rls }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email,approval_status,created_at").order("created_at", { ascending: false }),
      supabase.from("ministry_years").select("*").order("start_year", { ascending: false }),
      supabase.from("locations").select("*").order("name"),
      supabase.from("recurring_schedule_rules").select("*").order("weekday"),
    ]);
    if (profs) {
      const { data: ur } = await supabase.from("user_roles").select("user_id,role");
      const map: Record<string, string[]> = {};
      (ur ?? []).forEach((r: any) => { (map[r.user_id] ||= []).push(r.role); });
      setUsers(profs.map((p: any) => ({ ...p, roles: map[p.id] ?? [] })));
    }
    setYears(yrs ?? []);
    setLocations(locs ?? []);
    setRules(rls ?? []);
  };
  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-warning" />
        Admin only.
      </CardContent></Card>
    );
  }
  const [matchDialog, setMatchDialog] = useState<{ userId: string; candidates: any[] } | null>(null);

  const syncPersonForApproved = async (userId: string, opts?: { linkTo?: string; forceCreate?: boolean }) => {
    const { data, error } = await supabase.rpc("link_or_create_person_for_profile", {
      _profile_id: userId,
      _link_to_person_id: opts?.linkTo ?? undefined,
      _force_create: opts?.forceCreate ?? false,
    });
    if (error) { toast.error(error.message); return; }
    const result = data as any;
    if (result?.status === "needs_choice") {
      setMatchDialog({ userId, candidates: result.candidates ?? [] });
    } else if (result?.status === "linked") {
      toast.success(opts?.forceCreate ? t("personCreated") : t("personLinked"));
    }
  };

  const toggleRole = async (userId: string, role: typeof ROLES[number], on: boolean) => {
    if (on) await supabase.from("user_roles").insert({ user_id: userId, role });
    else await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (role === "driver" || role === "coordinator") {
      await supabase.rpc("sync_person_role", { _profile_id: userId, _role: role, _enabled: on });
    }
    loadAll();
  };


  const generateYear = async () => {
    setBusy(true);
    const { error } = await supabase.rpc("generate_ministry_year", { _start_year: newYear });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("yearGenerated"));
    loadAll();
  };

  const addLocation = async () => {
    if (!newLoc.trim()) return;
    await supabase.from("locations").insert({ name: newLoc.trim() });
    setNewLoc("");
    loadAll();
  };

  const addRule = async () => {
    const { error } = await supabase.from("recurring_schedule_rules").insert({
      weekday: newRule.weekday,
      frequency: newRule.frequency,
    });
    if (error) {
      if (error.code === "23505") return toast.error(t("ruleExists"));
      return toast.error(error.message);
    }
    loadAll();
  };

  const removeRule = async (id: string) => { await supabase.from("recurring_schedule_rules").delete().eq("id", id); loadAll(); };
  const removeLoc = async (id: string) => { await supabase.from("locations").delete().eq("id", id); loadAll(); };

  const setApproval = async (userId: string, status: "approved" | "rejected" | "pending") => {
    const patch: any = { approval_status: status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? t("userApproved") : status === "rejected" ? t("userRejected") : "");
    if (status === "approved") {
      await syncPersonForApproved(userId);
    }
    loadAll();
  };

  const pendingUsers = users.filter((u) => u.approval_status === "pending");
  const otherUsers = users.filter((u) => u.approval_status !== "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("admin")}</h1>

      <Card>
        <CardHeader><CardTitle>{t("ministryYears")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-muted-foreground">{t("startYear")}</label>
              <Input type="number" value={newYear} onChange={(e) => setNewYear(Number(e.target.value))} className="w-32" />
            </div>
            <Button onClick={generateYear} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{t("generateYear")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {years.map((y) => <Badge key={y.id} variant="secondary">{ministryLabel(y.start_year)}</Badge>)}
            {years.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("locations")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={newLoc} onChange={(e) => setNewLoc(e.target.value)} placeholder={t("location")} />
            <Button onClick={addLocation}><Plus className="h-4 w-4 mr-1" />{t("addLocation")}</Button>
          </div>
          <ul className="divide-y">
            {locations.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <span>{l.name}</span>
                <Button size="icon" variant="ghost" onClick={() => removeLoc(l.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("recurringRules")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-2">
            <Select value={String(newRule.weekday)} onValueChange={(v) => setNewRule({ ...newRule, weekday: Number(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tArr(WEEKDAYS_KEY[0]).map((w, i) => <SelectItem key={i} value={String(i)}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={newRule.frequency} onValueChange={(v) => setNewRule({ ...newRule, frequency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">{t("weekly")}</SelectItem>
                <SelectItem value="biweekly">{t("biweekly")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addRule}><Plus className="h-4 w-4 mr-1" />{t("addRule")}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{t("ruleHint")}</p>
          <ul className="divide-y">
            {rules.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span>{tArr(WEEKDAYS_KEY[0])[r.weekday]} · {r.frequency === "weekly" ? t("weekly") : t("biweekly")}</span>
                <Button size="icon" variant="ghost" onClick={() => removeRule(r.id)}><Trash2 className="h-4 w-4" /></Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("pendingUsers")} {pendingUsers.length > 0 && <Badge variant="destructive" className="ml-2">{pendingUsers.length}</Badge>}</CardTitle></CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noPendingUsers")}</p>
          ) : (
            <ul className="divide-y">
              {pendingUsers.map((u) => (
                <li key={u.id} className="py-3 space-y-2">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-medium">{u.full_name ?? u.email}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      {u.created_at && (
                        <div className="text-xs text-muted-foreground">
                          {t("signedUpOn")}: {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setApproval(u.id, "approved")}>{t("approve")}</Button>
                      <Button size="sm" variant="outline" onClick={() => setApproval(u.id, "rejected")}>{t("reject")}</Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) => {
                      const on = u.roles.includes(r);
                      return (
                        <button key={r} onClick={() => toggleRole(u.id, r, !on)}
                          className={`px-2 py-1 rounded-full text-xs border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                          {t((r === "admin" ? "adminRole" : r) as any)}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("manageUsers")}</CardTitle></CardHeader>
        <CardContent>
          <ul className="divide-y">
            {otherUsers.map((u) => (
              <li key={u.id} className="py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {u.full_name ?? u.email}
                      {u.approval_status === "rejected" && (
                        <Badge variant="destructive" className="text-[10px]">{t("reject")}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-1 items-center">
                    {ROLES.map((r) => {
                      const on = u.roles.includes(r);
                      return (
                        <button key={r} onClick={() => toggleRole(u.id, r, !on)}
                          className={`px-2 py-1 rounded-full text-xs border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                          {t((r === "admin" ? "adminRole" : r) as any)}
                        </button>
                      );
                    })}
                    {u.approval_status === "approved" ? (
                      <Button size="sm" variant="ghost" onClick={() => setApproval(u.id, "rejected")}>{t("reject")}</Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => setApproval(u.id, "approved")}>{t("reactivate")}</Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Dialog open={!!matchDialog} onOpenChange={(o) => !o && setMatchDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("matchPersonTitle")}</DialogTitle>
            <DialogDescription>{t("matchPersonBody")}</DialogDescription>
          </DialogHeader>
          <ul className="divide-y">
            {matchDialog?.candidates.map((c) => (
              <li key={c.id} className="py-3 flex items-start justify-between gap-3">
                <div className="text-sm space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{c.full_name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.match_type === "email" ? t("matchByEmail") : t("matchByName")}
                    </Badge>
                    {c.active === false && (
                      <Badge variant="destructive" className="text-[10px]">{t("inactive")}</Badge>
                    )}
                    {(c.roles ?? []).map((r: string) => (
                      <Badge key={r} variant="secondary" className="text-[10px]">
                        {t((r === "admin" ? "adminRole" : r) as any)}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {c.email ?? "—"}{c.phone ? ` · ${c.phone}` : ""}
                  </div>
                  {c.notes && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{t("notesLabel")}:</span>{" "}
                      <span className="line-clamp-2">{c.notes}</span>
                    </div>
                  )}
                </div>
                <Button size="sm" onClick={async () => {
                  const uid = matchDialog!.userId;
                  setMatchDialog(null);
                  await syncPersonForApproved(uid, { linkTo: c.id });
                  loadAll();
                }}>{t("linkToThisPerson")}</Button>
              </li>
            ))}
          </ul>
          <DialogFooter>
            <Button variant="outline" onClick={async () => {
              const uid = matchDialog!.userId;
              setMatchDialog(null);
              await syncPersonForApproved(uid, { forceCreate: true });
              loadAll();
            }}>{t("createNewPerson")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
