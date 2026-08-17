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

export const Route = createFileRoute("/_authenticated/recipients")({ component: RecipientsPage });

function RecipientsPage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);

  const checkHouseholdInUse = async (id: string) => {
    const [dr, tpl] = await Promise.all([
      supabase.from("date_recipients").select("id", { count: "exact", head: true }).eq("household_id", id),
      supabase.from("recurring_recipient_templates").select("id", { count: "exact", head: true }).eq("household_id", id),
    ]);
    return (dr.count ?? 0) + (tpl.count ?? 0) > 0;
  };

  const doDelete = async (mode: "hard" | "soft") => {
    if (!deleting) return;
    if (mode === "soft") {
      const { error } = await supabase.from("recipient_households").update({ active: false }).eq("id", deleting.id);
      if (error) { toast.error(error.message); return; }
      toast.success(t("archived"));
    } else {
      const { error } = await supabase.from("recipient_households").delete().eq("id", deleting.id);
      if (error) { toast.error(error.message); return; }
      toast.success(t("deleted"));
    }
    load();
  };

  const load = async () => {
    const { data } = await supabase.from("recipient_households").select("*").order("name");
    setList(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing({ first_name: "", last_name: "", name: "", contact_name: "", phone: "", address: "", notes: "", size: 1, active: true }); setOpen(true); };
  const startEdit = (h: any) => { setEditing({ ...h }); setOpen(true); };

  const save = async () => {
    const first = (editing.first_name ?? "").trim();
    const last = (editing.last_name ?? "").trim();
    const composed = [first, last].filter(Boolean).join(" ");
    const name = (editing.name?.trim() || composed);
    if (!name) return toast.error(t("firstName"));
    const p = { name, first_name: first || null, last_name: last || null, needs_name_review: !last && !composed.includes(" "), contact_name: editing.contact_name || null, phone: editing.phone || null, address: editing.address || null, notes: editing.notes || null, size: Number(editing.size) || 1, active: editing.active };
    if (editing.id) {
      const { error } = await supabase.from("recipient_households").update(p).eq("id", editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("recipient_households").insert(p);
      if (error) return toast.error(error.message);
    }
    toast.success(t("saved"));
    setOpen(false); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-7 w-7 text-primary" />{t("recipients")}</h1>
        {isAdmin && <Button onClick={startNew}><Plus className="h-4 w-4 mr-1" />{t("addHousehold")}</Button>}
      </div>

      {loading ? <p>{t("loading")}</p> : (
        <div className="grid gap-2">
          {list.length === 0 && <p className="text-muted-foreground text-sm">—</p>}
          {list.map((h) => (
            <Card key={h.id}>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{h.name}</span>
                    <Badge variant="secondary">{t("size")}: {h.size}</Badge>
                    {!h.active && <Badge variant="outline">{t("inactive")}</Badge>}
                    {h.needs_name_review && <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">{t("nameNeedsReview")}</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 space-x-2">
                    {h.contact_name && <span>{h.contact_name}</span>}
                    {h.phone && <span>· {h.phone}</span>}
                    {h.address && <span>· {h.address}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(h)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleting(h)} aria-label={t("delete")}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? t("edit") : t("addHousehold")}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{t("firstName")}</Label><Input value={editing.first_name ?? ""} onChange={(e) => setEditing({ ...editing, first_name: e.target.value })} /></div>
                <div><Label>{t("lastName")}</Label><Input value={editing.last_name ?? ""} onChange={(e) => setEditing({ ...editing, last_name: e.target.value })} /></div>
              </div>
              <div><Label>{t("household")}</Label><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder={[editing.first_name, editing.last_name].filter(Boolean).join(" ")} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>{t("contactName")}</Label><Input value={editing.contact_name ?? ""} onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })} /></div>
                <div><Label>{t("phone")}</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
              </div>
              <div><Label>{t("address")}</Label><Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
              <div><Label>{t("size")}</Label><Input type="number" min={1} value={editing.size ?? 1} onChange={(e) => setEditing({ ...editing, size: e.target.value })} className="w-24" /></div>
              <div><Label>{t("notes")}</Label><Textarea value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
              <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /><Label>{t("active")}</Label></div>
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
        title={deleting ? `${t("delete")}: ${deleting.name}` : undefined}
        checkInUse={() => (deleting ? checkHouseholdInUse(deleting.id) : Promise.resolve(false))}
        onConfirm={doDelete}
      />
    </div>
  );
}
