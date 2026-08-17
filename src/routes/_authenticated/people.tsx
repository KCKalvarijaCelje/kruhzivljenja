import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Heart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "@/components/delete-confirm";

export const Route = createFileRoute("/_authenticated/people")({ component: PeoplePage });

const ROLES = ["driver", "coordinator", "admin"] as const;

function PeoplePage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [allHouseholds, setAllHouseholds] = useState<any[]>([]);

  const checkPersonInUse = async (personId: string) => {
    const [sd, rules, dr, hh, hm] = await Promise.all([
      supabase.from("schedule_dates").select("id", { count: "exact", head: true }).or(`driver_id.eq.${personId},coordinator_id.eq.${personId}`),
      supabase.from("recurring_schedule_rules").select("id", { count: "exact", head: true }).or(`default_driver_id.eq.${personId},default_coordinator_id.eq.${personId}`),
      supabase.from("date_recipients").select("id", { count: "exact", head: true }).eq("person_id", personId),
      supabase.from("recipient_households").select("id", { count: "exact", head: true }).eq("person_id", personId),
      supabase.from("household_members").select("id", { count: "exact", head: true }).eq("person_id", personId),
    ]);
    return (sd.count ?? 0) + (rules.count ?? 0) + (dr.count ?? 0) + (hh.count ?? 0) + (hm.count ?? 0) > 0;
  };

  const doDeletePerson = async (mode: "hard" | "soft") => {
    if (!deleting) return;
    if (mode === "soft") {
      const { error } = await supabase.from("people").update({ active: false }).eq("id", deleting.id);
      if (error) { toast.error(error.message); return; }
      await supabase.from("recipient_households").update({ active: false }).eq("person_id", deleting.id);
      toast.success(t("archived"));
    } else {
      await supabase.from("people_roles").delete().eq("person_id", deleting.id);
      const { error } = await supabase.from("people").delete().eq("id", deleting.id);
      if (error) { toast.error(error.message); return; }
      toast.success(t("deleted"));
    }
    load();
  };

  const load = async () => {
    const [{ data }, { data: hh }] = await Promise.all([
      supabase
        .from("people")
        .select("*,people_roles(role),recipient_households!recipient_households_person_id_fkey(id,name,address,phone,notes,size,active)")
        .order("full_name"),
      supabase.from("recipient_households").select("id,name").eq("active", true).order("name"),
    ]);
    setList(data ?? []);
    setAllHouseholds(hh ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing({
      full_name: "", first_name: "", last_name: "", phone: "", email: "", notes: "", active: true, roles: [],
      isRecipient: false,
      household: { id: null, name: "", address: "", phone: "", notes: "", size: 1, active: true },
      pickupHhIds: [] as string[],
    });
    setOpen(true);
  };
  const startEdit = async (p: any) => {
    const hhEmbed = p.recipient_households;
    const hh = (Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed) ?? null;
    const { data: pickups } = await (supabase as any).from("driver_pickup_households").select("household_id").eq("person_id", p.id);
    setEditing({
      ...p,
      roles: (p.people_roles ?? []).map((r: any) => r.role),
      isRecipient: !!hh,
      household: hh
        ? { id: hh.id, name: hh.name, address: hh.address ?? "", phone: hh.phone ?? "", notes: hh.notes ?? "", size: hh.size ?? 1, active: hh.active }
        : { id: null, name: p.full_name, address: "", phone: p.phone ?? "", notes: "", size: 1, active: true },
      pickupHhIds: ((pickups ?? []) as any[]).map((x) => x.household_id),
    });
    setOpen(true);
  };

  const save = async () => {
    const first = (editing.first_name ?? "").trim();
    const last = (editing.last_name ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || (editing.full_name ?? "").trim();
    if (!fullName) return toast.error(t("firstName"));
    const payload = { full_name: fullName, first_name: first || null, last_name: last || null, needs_name_review: !last, phone: editing.phone, email: editing.email, notes: editing.notes, active: editing.active };
    let id = editing.id;
    if (id) {
      const { error } = await supabase.from("people").update(payload).eq("id", id);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("people").insert(payload).select("id").single();
      if (error) return toast.error(error.message);
      id = data.id;
    }
    await supabase.from("people_roles").delete().eq("person_id", id);
    if (editing.roles.length) {
      await supabase.from("people_roles").insert(editing.roles.map((r: string) => ({ person_id: id, role: r })));
    }

    // Recipient sync
    const existingHhId = editing.household?.id ?? null;
    if (editing.isRecipient) {
      const h = editing.household;
      const hhPayload = {
        person_id: id,
        name: (h.name || fullName).trim(),
        contact_name: fullName,
        address: h.address || null,
        phone: h.phone || editing.phone || null,
        notes: h.notes || null,
        size: Number(h.size) || 1,
        active: !!h.active,
      };
      if (existingHhId) {
        const { error } = await supabase.from("recipient_households").update(hhPayload).eq("id", existingHhId);
        if (error) return toast.error(error.message);
      } else {
        const { error } = await supabase.from("recipient_households").insert(hhPayload);
        if (error) return toast.error(error.message);
      }
    } else if (existingHhId) {
      // Unlink: unset person_id but keep household to preserve planner assignments
      await supabase.from("recipient_households").update({ person_id: null }).eq("id", existingHhId);
    }

    // Driver pickup household links
    await (supabase as any).from("driver_pickup_households").delete().eq("person_id", id);
    const pickupIds: string[] = editing.pickupHhIds ?? [];
    if (pickupIds.length) {
      await (supabase as any).from("driver_pickup_households").insert(pickupIds.map((hid) => ({ person_id: id, household_id: hid })));
    }

    toast.success(t("saved"));
    setOpen(false);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("people")}</h1>
        {isAdmin && <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />{t("addPerson")}</Button>}
      </div>

      {loading ? <p>{t("loading")}</p> : (
        <div className="grid gap-2">
          {list.map((p) => {
            const hhEmbed = p.recipient_households;
            const hhRow = Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed;
            const isRecipient = !!hhRow;
            return (
              <Card key={p.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{p.full_name}</span>
                      {p.needs_name_review && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">{t("nameNeedsReview")}</Badge>}
                      {!p.active && <Badge variant="outline">{t("inactive")}</Badge>}
                      {(p.people_roles ?? []).map((r: any) => (
                        <Badge key={r.role} variant="secondary" className="text-xs">{t((r.role === "admin" ? "adminRole" : r.role) as any)}</Badge>
                      ))}
                      {isRecipient && (
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20" variant="outline">
                          <Heart className="h-3 w-3 mr-1" />{t("recipient")}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {[p.phone, p.email].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleting(p)} aria-label={t("delete")}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? t("edit") : t("addPerson")}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{t("firstName")}</Label><Input value={editing.first_name ?? ""} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} /></div>
                <div><Label>{t("lastName")}</Label><Input value={editing.last_name ?? ""} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{t("phone")}</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
                <div><Label>{t("email")}</Label><Input value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              </div>
              <div><Label>{t("notes")}</Label><Textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
              <div>
                <Label>{t("roles")}</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ROLES.map((r) => {
                    const on = editing.roles.includes(r);
                    return (
                      <button key={r} type="button"
                        onClick={() => setEditing({ ...editing, roles: on ? editing.roles.filter((x: string) => x !== r) : [...editing.roles, r] })}
                        className={`px-3 py-1 rounded-full text-sm border ${on ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                        {t((r === "admin" ? "adminRole" : r) as any)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>{t("active")}</Label></div>

              <div className="border-t pt-3">
                <label
                  htmlFor="also-recipient-switch"
                  className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    editing.isRecipient
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Heart className={`h-4 w-4 ${editing.isRecipient ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                    {t("alsoRecipient")}
                  </span>
                  <Switch
                    id="also-recipient-switch"
                    className="h-6 w-11 data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/40 [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5"
                    checked={!!editing.isRecipient}
                    onCheckedChange={(v) => setEditing({ ...editing, isRecipient: v })}
                  />
                </label>
                {editing.isRecipient && (
                  <div className="space-y-3 mt-3 pl-2 border-l-2 border-primary/30">
                    <div className="text-sm font-medium text-muted-foreground">{t("recipientDetails")}</div>
                    <div><Label>{t("household")}</Label><Input value={editing.household.name} onChange={(e) => setEditing({ ...editing, household: { ...editing.household, name: e.target.value } })} placeholder={editing.full_name} /></div>
                    <div><Label>{t("address")}</Label><Input value={editing.household.address} onChange={(e) => setEditing({ ...editing, household: { ...editing.household, address: e.target.value } })} /></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>{t("phone")}</Label><Input value={editing.household.phone} onChange={(e) => setEditing({ ...editing, household: { ...editing.household, phone: e.target.value } })} /></div>
                      <div><Label>{t("size")}</Label><Input type="number" min={1} value={editing.household.size} onChange={(e) => setEditing({ ...editing, household: { ...editing.household, size: e.target.value } })} /></div>
                    </div>
                    <div><Label>{t("notes")}</Label><Textarea value={editing.household.notes} onChange={(e) => setEditing({ ...editing, household: { ...editing.household, notes: e.target.value } })} /></div>
                    <div className="flex items-center gap-2"><Switch checked={editing.household.active} onCheckedChange={(v) => setEditing({ ...editing, household: { ...editing.household, active: v } })} /><Label>{t("recipientActive")}</Label></div>
                  </div>
                )}
              </div>

              {editing.roles?.includes("driver") && (
                <div className="border-t pt-3 space-y-2">
                  <Label className="text-sm font-semibold">{t("linkedPickupHouseholds")}</Label>
                  <p className="text-xs text-muted-foreground">{t("linkedPickupHint")}</p>
                  <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
                    {allHouseholds
                      .filter((h: any) => h.id !== editing.household?.id)
                      .map((h: any) => {
                        const on = (editing.pickupHhIds ?? []).includes(h.id);
                        return (
                          <label key={h.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/40">
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={(e) => {
                                const cur: string[] = editing.pickupHhIds ?? [];
                                setEditing({
                                  ...editing,
                                  pickupHhIds: e.target.checked ? [...cur, h.id] : cur.filter((x) => x !== h.id),
                                });
                              }}
                            />
                            <span className="text-sm">{h.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button onClick={save}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirm
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={deleting ? `${t("delete")}: ${deleting.full_name}` : undefined}
        checkInUse={() => (deleting ? checkPersonInUse(deleting.id) : Promise.resolve(false))}
        onConfirm={doDeletePerson}
      />
    </div>
  );
}
