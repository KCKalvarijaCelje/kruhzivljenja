import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import {
  Plus,
  Pencil,
  Heart,
  Trash2,
  Loader2,
  Users,
  Search,
  X,
  Truck,
  UserCheck,
  MapPin,
  Crown,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirm } from "@/components/delete-confirm";
import {
  serverGetPeopleData,
  serverSavePerson,
  serverDeletePerson,
} from "@/lib/people.functions";

export const Route = createFileRoute("/_authenticated/people")({ component: PeoplePage });

const ROLES = ["driver", "coordinator", "admin"] as const;

type PeopleTab = "all" | "team" | "drivers" | "coordinators" | "recipients";

function PeoplePage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<any>(null);
  const [allHouseholds, setAllHouseholds] = useState<any[]>([]);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<PeopleTab>("all");
  const [search, setSearch] = useState("");

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
    const res = await serverDeletePerson({
      data: { id: deleting.id, mode },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju");
      return;
    }
    toast.success(mode === "soft" ? t("archived") : t("deleted"));
    load();
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await serverGetPeopleData();
      if (res.success) {
        setList(res.people ?? []);
        setAllHouseholds(res.allHouseholds ?? []);
      } else {
        toast.error(res.error || "Napaka pri nalaganju oseb");
      }
    } catch (err: any) {
      console.error("load people error:", err);
      toast.error(err?.message || "Napaka pri nalaganju");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Category counts
  const counts = useMemo(() => {
    let drivers = 0;
    let coordinators = 0;
    let recipients = 0;
    let team = 0;

    for (const p of list) {
      const roles = (p.people_roles ?? []).map((r: any) => r.role);
      const isDriver = roles.includes("driver");
      const isCoord = roles.includes("coordinator");
      const isAdminRole = roles.includes("admin");
      const hasHh = Array.isArray(p.recipient_households)
        ? p.recipient_households.length > 0
        : !!p.recipient_households;

      if (isDriver) drivers++;
      if (isCoord) coordinators++;
      if (hasHh) recipients++;
      if (isDriver || isCoord || isAdminRole) team++;
    }

    return {
      all: list.length,
      team,
      drivers,
      coordinators,
      recipients,
    };
  }, [list]);

  // Filtered List
  const filteredList = useMemo(() => {
    let result = list;

    if (activeTab === "team") {
      result = result.filter((p) =>
        (p.people_roles ?? []).some((r: any) => ["driver", "coordinator", "admin"].includes(r.role))
      );
    } else if (activeTab === "drivers") {
      result = result.filter((p) =>
        (p.people_roles ?? []).some((r: any) => r.role === "driver")
      );
    } else if (activeTab === "coordinators") {
      result = result.filter((p) =>
        (p.people_roles ?? []).some((r: any) => r.role === "coordinator")
      );
    } else if (activeTab === "recipients") {
      result = result.filter((p) => {
        const hh = p.recipient_households;
        return Array.isArray(hh) ? hh.length > 0 : !!hh;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const fullName = (p.full_name ?? "").toLowerCase();
        const email = (p.email ?? "").toLowerCase();
        const phone = (p.phone ?? "").toLowerCase();
        const address = (p.address ?? "").toLowerCase();
        const notes = (p.notes ?? "").toLowerCase();
        const hh = Array.isArray(p.recipient_households) ? p.recipient_households[0] : p.recipient_households;
        const hhName = (hh?.name ?? "").toLowerCase();
        const hhAddress = (hh?.address ?? "").toLowerCase();

        return (
          fullName.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          address.includes(q) ||
          notes.includes(q) ||
          hhName.includes(q) ||
          hhAddress.includes(q)
        );
      });
    }

    return result;
  }, [list, activeTab, search]);

  const startNew = () => {
    setEditing({
      full_name: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      active: true,
      roles: [],
      profile_id: null,
      isRecipient: false,
      household: { id: null, name: "", address: "", phone: "", notes: "", size: 1, active: true },
      pickupHhIds: [] as string[],
    });
    setOpen(true);
  };

  const startEdit = (p: any) => {
    const hhEmbed = p.recipient_households;
    const hh = (Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed) ?? null;
    const roles = (p.people_roles ?? []).map((r: any) => r.role);
    const resolvedAddress = p.address || hh?.address || "";

    setEditing({
      ...p,
      roles,
      address: resolvedAddress,
      isRecipient: !!hh,
      household: hh
        ? {
            id: hh.id,
            name: hh.name,
            address: hh.address ?? resolvedAddress,
            phone: hh.phone ?? "",
            notes: hh.notes ?? "",
            size: hh.size ?? 1,
            active: hh.active,
          }
        : {
            id: null,
            name: p.full_name,
            address: resolvedAddress,
            phone: p.phone ?? "",
            notes: "",
            size: 1,
            active: true,
          },
      pickupHhIds: p.pickupHhIds ?? [],
    });
    setOpen(true);
  };

  const save = async () => {
    const first = (editing.first_name ?? "").trim();
    const last = (editing.last_name ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || (editing.full_name ?? "").trim();
    if (!fullName) return toast.error(t("firstName"));

    setSaving(true);
    try {
      const res = await serverSavePerson({
        data: {
          id: editing.id,
          profile_id: editing.profile_id,
          first_name: first || null,
          last_name: last || null,
          full_name: fullName,
          phone: editing.phone || null,
          email: editing.email || null,
          address: editing.address || null,
          notes: editing.notes || null,
          active: editing.active !== false,
          roles: editing.roles ?? [],
          isRecipient: editing.isRecipient,
          household: editing.household,
          pickupHhIds: editing.pickupHhIds ?? [],
        },
      });

      if (!res.success) {
        toast.error(res.error || "Napaka pri shranjevanju");
        return;
      }

      toast.success(t("saved"));
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("people")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("peopleSubtitle")}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={startNew} className="gap-1.5 bg-[#93032E] hover:bg-[#7b0226] text-white">
            <Plus className="h-4 w-4" />
            {t("addPerson")}
          </Button>
        )}
      </div>

      {/* TOP CATEGORY TABS */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3 pt-1">
        {/* All */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>{t("allMembersTab")}</span>
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] rounded-md ${
              activeTab === "all" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
            }`}
          >
            {counts.all}
          </Badge>
        </button>

        {/* Active Team */}
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "team"
              ? "bg-primary text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5" />
          <span>{t("activeTeam")}</span>
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] rounded-md ${
              activeTab === "team" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
            }`}
          >
            {counts.team}
          </Badge>
        </button>

        {/* Drivers */}
        <button
          type="button"
          onClick={() => setActiveTab("drivers")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "drivers"
              ? "bg-primary text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
          }`}
        >
          <Truck className="h-3.5 w-3.5" />
          <span>{t("driversTab")}</span>
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] rounded-md ${
              activeTab === "drivers" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
            }`}
          >
            {counts.drivers}
          </Badge>
        </button>

        {/* Coordinators */}
        <button
          type="button"
          onClick={() => setActiveTab("coordinators")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "coordinators"
              ? "bg-[#93032E] text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>{t("coordinatorsTab")}</span>
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] rounded-md ${
              activeTab === "coordinators" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
            }`}
          >
            {counts.coordinators}
          </Badge>
        </button>

        {/* Recipients */}
        <button
          type="button"
          onClick={() => setActiveTab("recipients")}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "recipients"
              ? "bg-rose-700 text-white shadow-xs"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-200/60"
          }`}
        >
          <Heart className="h-3.5 w-3.5" />
          <span>{t("recipientsTab")}</span>
          <Badge
            variant="secondary"
            className={`px-1.5 py-0 text-[10px] rounded-md ${
              activeTab === "recipients" ? "bg-white/20 text-white border-0" : "bg-white text-rose-900 border"
            }`}
          >
            {counts.recipients}
          </Badge>
        </button>
      </div>

      {/* QUICK SEARCH */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchUsersPlaceholder")}
          className="pl-9 pr-8 text-xs h-9 bg-white"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            Ni najdenih oseb za izbran filter.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {filteredList.map((p) => {
            const hhEmbed = p.recipient_households;
            const hh = (Array.isArray(hhEmbed) ? hhEmbed[0] : hhEmbed) ?? null;
            const roles = (p.people_roles ?? []).map((r: any) => r.role);
            const address = p.address || hh?.address;

            return (
              <Card key={p.id} className={!p.active ? "opacity-60 bg-slate-50/50" : "bg-white shadow-2xs"}>
                <CardContent className="p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900">{p.full_name}</span>
                      {hh && (
                        <Badge variant="outline" className="text-xs gap-1 border-rose-300 text-rose-700 bg-rose-50 font-medium">
                          <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                          {t("recipient")} ({hh.size ?? 1})
                        </Badge>
                      )}
                      {!p.active && (
                        <Badge variant="secondary" className="text-xs">
                          {t("inactive")}
                        </Badge>
                      )}
                      {roles.map((r: string) => {
                        if (r === "admin") {
                          return (
                            <Badge key={r} variant="outline" className="text-xs gap-1 border-amber-300 text-amber-800 bg-amber-50 font-medium">
                              <Crown className="h-3 w-3 text-amber-600" />
                              {t("adminRole")}
                            </Badge>
                          );
                        }
                        if (r === "driver") {
                          return (
                            <Badge key={r} variant="outline" className="text-xs gap-1 border-emerald-300 text-emerald-800 bg-emerald-50 font-medium">
                              <Truck className="h-3 w-3 text-emerald-600" />
                              {t("driver")}
                            </Badge>
                          );
                        }
                        if (r === "coordinator") {
                          return (
                            <Badge key={r} variant="outline" className="text-xs gap-1 border-rose-300 text-[#93032E] bg-rose-50 font-medium">
                              <Utensils className="h-3 w-3 text-[#93032E]" />
                              {t("coordinator")}
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                      {[p.phone, p.email, address].filter(Boolean).map((info: string, idx: number) => (
                        <span key={idx} className="flex items-center gap-1">
                          {idx > 0 && <span className="opacity-40">·</span>}
                          {idx === 2 && <MapPin className="h-3 w-3 text-slate-400 shrink-0 inline" />}
                          <span>{info}</span>
                        </span>
                      ))}
                    </div>
                    {hh && (
                      <div className="text-[11px] text-rose-800/80 mt-1 font-medium flex items-center gap-1.5">
                        <span>Gospodinjstvo: {hh.name}</span>
                        {hh.size && <span>(št. oseb: {hh.size})</span>}
                        {hh.address && <span>· {hh.address}</span>}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(p)} className="h-8 w-8 text-slate-700 hover:text-primary">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleting(p)}
                        aria-label={t("delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* EDIT / CREATE DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? t("edit") : t("addPerson")}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("firstName")}</Label>
                  <Input
                    value={editing.first_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("lastName")}</Label>
                  <Input
                    value={editing.last_name ?? ""}
                    onChange={(e) => setEditing({ ...editing, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("phone")}</Label>
                  <Input
                    value={editing.phone ?? ""}
                    onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("email")}</Label>
                  <Input
                    value={editing.email ?? ""}
                    onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  />
                </div>
              </div>

              {/* ADDRESS FIELD */}
              <div>
                <Label>{t("address")}</Label>
                <Input
                  value={editing.address ?? ""}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  placeholder="npr. Mariborska cesta 12, 3000 Celje"
                />
              </div>

              <div>
                <Label>{t("notes")}</Label>
                <Textarea
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>

              {/* ROLES TOGGLE */}
              <div>
                <Label>{t("roles")}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {/* Admin */}
                  {(() => {
                    const on = (editing.roles ?? []).includes("admin");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            roles: on
                              ? editing.roles.filter((x: string) => x !== "admin")
                              : [...(editing.roles ?? []), "admin"],
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          on
                            ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                            : "border-amber-200/90 text-amber-800 bg-amber-50/50 hover:bg-amber-100/70"
                        }`}
                      >
                        <Crown className={`h-3.5 w-3.5 ${on ? "text-white fill-white/20" : "text-amber-600"}`} />
                        {t("adminRole")}
                      </button>
                    );
                  })()}

                  {/* Driver */}
                  {(() => {
                    const on = (editing.roles ?? []).includes("driver");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            roles: on
                              ? editing.roles.filter((x: string) => x !== "driver")
                              : [...(editing.roles ?? []), "driver"],
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          on
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "border-emerald-200/90 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70"
                        }`}
                      >
                        <Truck className={`h-3.5 w-3.5 ${on ? "text-white" : "text-emerald-600"}`} />
                        {t("driver")}
                      </button>
                    );
                  })()}

                  {/* Distributor */}
                  {(() => {
                    const on = (editing.roles ?? []).includes("coordinator");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            roles: on
                              ? editing.roles.filter((x: string) => x !== "coordinator")
                              : [...(editing.roles ?? []), "coordinator"],
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          on
                            ? "bg-[#93032E] text-white border-[#93032E] shadow-2xs"
                            : "border-rose-200/90 text-[#93032E] bg-rose-50/50 hover:bg-rose-100/70"
                        }`}
                      >
                        <Utensils className={`h-3.5 w-3.5 ${on ? "text-white" : "text-[#93032E]"}`} />
                        {t("coordinator")}
                      </button>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Switch
                  checked={editing.active}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                />
                <Label>{t("active")}</Label>
              </div>

              {/* RECIPIENT TOGGLE */}
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
                    <Heart
                      className={`h-4 w-4 ${
                        editing.isRecipient ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                    {t("alsoRecipient")}
                  </span>
                  <Switch
                    id="also-recipient-switch"
                    checked={editing.isRecipient}
                    onCheckedChange={(v) => setEditing({ ...editing, isRecipient: v })}
                  />
                </label>
              </div>

              {editing.isRecipient && (
                <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
                  <div className="font-semibold text-sm">{t("recipientDetails")}</div>
                  <div>
                    <Label>{t("householdName")}</Label>
                    <Input
                      value={editing.household?.name ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          household: { ...editing.household, name: e.target.value },
                        })
                      }
                      placeholder={editing.full_name || t("name")}
                    />
                  </div>
                  <div>
                    <Label>{t("address")}</Label>
                    <Input
                      value={editing.household?.address ?? editing.address ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          household: { ...editing.household, address: e.target.value },
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>{t("householdSize")}</Label>
                      <Input
                        type="number"
                        min={1}
                        value={editing.household?.size ?? 1}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            household: { ...editing.household, size: Number(e.target.value) || 1 },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>{t("phone")}</Label>
                      <Input
                        value={editing.household?.phone ?? editing.phone ?? ""}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            household: { ...editing.household, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("notes")}</Label>
                    <Textarea
                      value={editing.household?.notes ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          household: { ...editing.household, notes: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      checked={editing.household?.active !== false}
                      onCheckedChange={(v) =>
                        setEditing({
                          ...editing,
                          household: { ...editing.household, active: v },
                        })
                      }
                    />
                    <Label>{t("recipientActive")}</Label>
                  </div>
                </div>
              )}

              {/* DRIVER PICKUP SELECTION */}
              {(editing.roles ?? []).includes("driver") && (
                <div className="border-t pt-3 space-y-2">
                  <Label className="font-semibold text-sm">
                    {t("driverPickupHouseholdsTitle")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t("driverPickupHouseholdsHelp")}
                  </p>
                  <div className="max-h-44 overflow-y-auto border rounded-md p-2 space-y-1.5 bg-background">
                    {allHouseholds.length === 0 && (
                      <p className="text-xs text-muted-foreground">{t("noRecipients")}</p>
                    )}
                    {allHouseholds.map((h) => {
                      const checked = (editing.pickupHhIds ?? []).includes(h.id);
                      return (
                        <label
                          key={h.id}
                          className="flex items-center gap-2 text-xs cursor-pointer p-1 rounded hover:bg-muted/50"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const cur: string[] = editing.pickupHhIds ?? [];
                              const next = e.target.checked
                                ? [...cur, h.id]
                                : cur.filter((x) => x !== h.id);
                              setEditing({ ...editing, pickupHhIds: next });
                            }}
                            className="rounded border-border"
                          />
                          <span>{h.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t("cancel")}
            </Button>
            <Button onClick={save} disabled={saving} className="bg-[#93032E] hover:bg-[#7b0226] text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE / REMOVE CONFIRMATION */}
      <DeleteConfirm
        open={!!deleting}
        onOpenChange={(v) => !v && setDeleting(null)}
        title={t("confirmDelete") + (deleting?.full_name ? `: ${deleting.full_name}` : "")}
        checkInUse={() => (deleting ? checkPersonInUse(deleting.id) : Promise.resolve(false))}
        onConfirm={doDeletePerson}
      />
    </div>
  );
}
