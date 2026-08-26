import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  ShieldAlert,
  Loader2,
  RefreshCw,
  UserPlus,
  Users,
  Check,
  Repeat,
  MapPin,
  Heart,
  Calendar,
  Search,
  Truck,
  UserCheck,
  UserX,
  X,
  Crown,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { currentMinistryStartYear, ministryLabel } from "@/lib/ministry-year";
import { LocationLogo } from "@/components/location-logo";
import { serverSavePerson } from "@/lib/people.functions";
import {
  serverGetAdminData,
  serverAddRecurringRule,
  serverRemoveRecurringRule,
  serverAddLocation,
  serverRemoveLocation,
  serverGenerateMinistryYear,
  serverToggleRole,
  serverSetApproval,
  serverSyncAllToPeople,
  serverAddRuleStop,
  serverRemoveRuleStop,
  serverUpdateRuleStop,
  serverAddRuleRecipient,
  serverRemoveRuleRecipient,
  serverApplyTemplateToFuture,
  serverApplyAssignmentsToFuture,
  serverUpdateRecipientSize,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({ component: AdminPage });

const ROLES = ["admin", "driver", "coordinator"] as const;
const WEEKDAYS_KEY = ["weekdaysShort"] as const;

type UserTab = "team" | "drivers" | "coordinators" | "recipients" | "rejected" | "all";

function AdminPage() {
  const { t, tArr } = useI18n();
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [ruleStops, setRuleStops] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [households, setHouseholds] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);

  const [busy, setBusy] = useState(false);
  const [syncingAll, setSyncingAll] = useState(false);
  const [newYear, setNewYear] = useState<number>(currentMinistryStartYear());
  const [newLoc, setNewLoc] = useState("");
  const [newRule, setNewRule] = useState<{ weekday: number; frequency: string }>({ weekday: 1, frequency: "weekly" });

  const [hhPick, setHhPick] = useState<Record<string, string>>({});
  const [locPick, setLocPick] = useState<Record<string, string>>({});

  // User management tab & search state
  const [userTab, setUserTab] = useState<UserTab>("team");
  const [userSearch, setUserSearch] = useState("");

  // Add / Edit person dialog state
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [personModalOpen, setPersonModalOpen] = useState(false);
  const [savingPerson, setSavingPerson] = useState(false);

  const loadAll = async () => {
    try {
      const res = await serverGetAdminData();
      if (!res.success) {
        toast.error(res.error || "Napaka pri nalaganju podatkov");
        return;
      }

      const peopleList = res.people ?? [];
      const peopleRolesList = res.peopleRoles ?? [];
      const userRolesList = res.userRoles ?? [];
      const householdsList = res.households ?? [];

      const enriched = (res.profiles ?? []).map((p: any) => {
        const person = peopleList.find(
          (x: any) =>
            (x.profile_id && String(x.profile_id) === String(p.id)) ||
            (p.email && x.email && x.email.toLowerCase().trim() === p.email.toLowerCase().trim())
        );

        const personRoles = person
          ? peopleRolesList.filter((r: any) => r.person_id === person.id).map((r: any) => r.role)
          : [];

        const directProfileRoles: string[] = [];
        if (p.is_driver) directProfileRoles.push("driver");
        if (p.kruh_role && ["driver", "coordinator", "admin"].includes(p.kruh_role)) {
          directProfileRoles.push(p.kruh_role);
        }

        // When a person exists in Kruh Življenja, people_roles is the authoritative source!
        const combinedRoles = person ? personRoles : directProfileRoles;

        const allowedApps: string[] = p.allowed_apps || ["nedelje", "kruh-zivljenja", "kavarna", "ucenja"];
        const hasKruhAccess = allowedApps.includes("kruh-zivljenja") && p.approval_status !== "rejected";

        const matchedHh = householdsList.find(
          (h: any) =>
            h.active &&
            ((person?.id && h.person_id === person.id) ||
              (p.full_name && h.name && h.name.toLowerCase().trim() === p.full_name.toLowerCase().trim()) ||
              (p.name && h.name && h.name.toLowerCase().trim() === p.name.toLowerCase().trim()))
        );
        const isRec = !!matchedHh;
        const recipientSize = Number(matchedHh?.size) || 1;
        const householdId = matchedHh?.id ?? null;

        return {
          ...p,
          personId: person?.id ?? null,
          inPeople: !!person,
          roles: combinedRoles,
          hasKruhAccess,
          isRecipient: isRec,
          recipientSize,
          householdId,
        };
      });

      setUsers(enriched);
      setYears(res.years ?? []);
      setLocations(res.locations ?? []);
      setRules(res.rules ?? []);
      setRuleStops(res.ruleStops ?? []);
      setTemplates(res.templates ?? []);
      setHouseholds(householdsList);
      setPeople(peopleList);
    } catch (err: any) {
      console.error("loadAll error:", err);
      toast.error(err?.message ?? "Napaka pri nalaganju podatkov");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  // Tab classifications
  const isVolunteer = (u: any) =>
    u.hasKruhAccess &&
    (u.roles.includes("driver") ||
      u.roles.includes("coordinator") ||
      u.roles.includes("admin"));
  const isDriver = (u: any) => u.hasKruhAccess && u.roles.includes("driver");
  const isCoordinator = (u: any) => u.hasKruhAccess && u.roles.includes("coordinator");
  const isRecipient = (u: any) => u.hasKruhAccess && u.isRecipient;
  const isRejected = (u: any) => !u.hasKruhAccess || u.approval_status === "rejected";

  const teamCount = useMemo(() => users.filter(isVolunteer).length, [users]);
  const driverCount = useMemo(() => users.filter(isDriver).length, [users]);
  const coordinatorCount = useMemo(() => users.filter(isCoordinator).length, [users]);
  const recipientCount = useMemo(() => users.filter(isRecipient).length, [users]);
  const rejectedCount = useMemo(() => users.filter(isRejected).length, [users]);
  const allCount = users.length;

  const filteredUsers = useMemo(() => {
    let list = users;
    if (userTab === "team") {
      list = users.filter(isVolunteer);
    } else if (userTab === "drivers") {
      list = users.filter(isDriver);
    } else if (userTab === "coordinators") {
      list = users.filter(isCoordinator);
    } else if (userTab === "recipients") {
      list = users.filter(isRecipient);
    } else if (userTab === "rejected") {
      list = users.filter(isRejected);
    }

    if (userSearch.trim()) {
      const q = userSearch.toLowerCase().trim();
      list = list.filter(
        (u) =>
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q))
      );
    }
    return list;
  }, [users, userTab, userSearch]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-warning" />
          Admin only.
        </CardContent>
      </Card>
    );
  }

  const addPersonFromProfile = async (u: any) => {
    const res = await serverToggleRole({
      data: {
        userId: u.id,
        authUserId: u.auth_user_id,
        fullName: u.full_name || u.name || u.email || "Neznano",
        email: u.email,
        phone: u.phone,
        role: u.is_driver ? "driver" : "coordinator",
        enabled: !!u.is_driver,
      },
    });

    if (!res.success) {
      toast.error(res.error || "Napaka pri dodajanju osebe");
      return;
    }
    toast.success(t("personCreated"));
    loadAll();
  };

  const startNewPerson = () => {
    setEditingPerson({
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
    setPersonModalOpen(true);
  };

  const savePerson = async () => {
    if (!editingPerson) return;
    const first = (editingPerson.first_name ?? "").trim();
    const last = (editingPerson.last_name ?? "").trim();
    const fullName = [first, last].filter(Boolean).join(" ") || (editingPerson.full_name ?? "").trim();
    if (!fullName) return toast.error(t("firstName"));

    setSavingPerson(true);
    try {
      const res = await serverSavePerson({
        data: {
          id: editingPerson.id,
          profile_id: editingPerson.profile_id,
          first_name: first || null,
          last_name: last || null,
          full_name: fullName,
          phone: editingPerson.phone || null,
          email: editingPerson.email || null,
          address: editingPerson.address || null,
          notes: editingPerson.notes || null,
          active: editingPerson.active !== false,
          roles: editingPerson.roles ?? [],
          isRecipient: editingPerson.isRecipient,
          household: editingPerson.household,
          pickupHhIds: editingPerson.pickupHhIds ?? [],
        },
      });

      if (!res.success) {
        toast.error(res.error || "Napaka pri shranjevanju osebe");
        return;
      }

      toast.success(t("saved"));
      setPersonModalOpen(false);
      loadAll();
    } finally {
      setSavingPerson(false);
    }
  };

  const syncAllMembersToPeople = async () => {
    setSyncingAll(true);
    try {
      const res = await serverSyncAllToPeople();
      if (!res.success) {
        toast.error(res.error || "Napaka pri sinhronizaciji");
        return;
      }
      toast.success(`${t("syncAllSuccess")} (+${res.count})`);
      loadAll();
    } finally {
      setSyncingAll(false);
    }
  };

  const toggleRole = async (u: any, role: typeof ROLES[number] | "recipient", on: boolean) => {
    const res = await serverToggleRole({
      data: {
        userId: u.id,
        authUserId: u.auth_user_id,
        fullName: u.full_name || u.name || u.email || "Neznano",
        email: u.email,
        phone: u.phone,
        role,
        enabled: on,
      },
    });

    if (!res.success) {
      toast.error(res.error || "Napaka pri spreminjanju vloge");
      return;
    }
    toast.success(role === "recipient" ? "Status prejemnika posodobljen" : t("roleUpdated"));
    loadAll();
  };

  const updateRecipientSize = async (u: any, size: number) => {
    const res = await serverUpdateRecipientSize({
      data: {
        householdId: u.householdId,
        personId: u.personId,
        fullName: u.full_name || u.name,
        size,
      },
    });

    if (!res.success) {
      toast.error(res.error || "Napaka pri posodobitvi velikosti");
      return;
    }
    toast.success(`Št. oseb v družini nastavljeno na ${size}`);
    loadAll();
  };

  const generateYear = async (yearToGen = newYear) => {
    setBusy(true);
    try {
      const res = await serverGenerateMinistryYear({ data: { startYear: yearToGen } });
      if (!res.success) {
        toast.error(res.error || "Napaka pri ustvarjanju terminov");
        return;
      }
      toast.success(`${t("datesGenerated")} (${res.dateCount} terminov)`);
      loadAll();
    } finally {
      setBusy(false);
    }
  };

  const addLocation = async () => {
    if (!newLoc.trim()) return;
    const res = await serverAddLocation({ data: { name: newLoc.trim() } });
    if (!res.success) {
      toast.error(res.error || "Napaka pri dodajanju lokacije");
      return;
    }
    setNewLoc("");
    toast.success(t("saved"));
    loadAll();
  };

  const removeLocation = async (id: string) => {
    const res = await serverRemoveLocation({ data: { id } });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju lokacije");
      return;
    }
    toast.success(t("deleted"));
    loadAll();
  };

  const addRule = async () => {
    const res = await serverAddRecurringRule({
      data: {
        weekday: newRule.weekday,
        frequency: newRule.frequency,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri dodajanju pravila");
      return;
    }
    toast.success(t("saved"));
    loadAll();
  };

  const removeRule = async (id: string) => {
    const res = await serverRemoveRecurringRule({ data: { id } });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju pravila");
      return;
    }
    toast.success(t("deleted"));
    loadAll();
  };

  const addRuleStop = async (ruleId: string) => {
    const lid = locPick[ruleId];
    if (!lid) return;
    const existing = ruleStops.filter((s) => s.rule_id === ruleId);
    const nextOrder = (existing[existing.length - 1]?.sort_order ?? -1) + 1;
    const res = await serverAddRuleStop({
      data: {
        ruleId,
        locationId: lid,
        sortOrder: nextOrder,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri dodajanju postaje");
      return;
    }
    setLocPick({ ...locPick, [ruleId]: "" });
    toast.success(t("saved"));
    loadAll();
  };

  const removeRuleStop = async (id: string) => {
    const res = await serverRemoveRuleStop({ data: { id } });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju postaje");
      return;
    }
    toast.success(t("deleted"));
    loadAll();
  };

  const updateRuleStop = async (id: string, patch: any) => {
    const res = await serverUpdateRuleStop({
      data: {
        id,
        default_driver_id: patch.default_driver_id,
        default_coordinator_id: patch.default_coordinator_id,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri shranjevanju");
      return;
    }
    toast.success(t("defaultsSaved"));
    loadAll();
  };

  const applyAssignments = async (ruleStopId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await serverApplyAssignmentsToFuture({
      data: {
        ruleStopId,
        fromDate: today,
        override: true,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri uporabi");
      return;
    }
    toast.success(`${t("appliedToFuture")} (${res.affected} terminov)`);
  };

  const addRuleRecipient = async (ruleId: string) => {
    const hid = hhPick[ruleId];
    if (!hid) return;
    const res = await serverAddRuleRecipient({
      data: {
        ruleId,
        householdId: hid,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri dodajanju prejemnika");
      return;
    }
    setHhPick({ ...hhPick, [ruleId]: "" });
    toast.success(t("saved"));
    loadAll();
  };

  const removeRuleRecipient = async (id: string) => {
    const res = await serverRemoveRuleRecipient({ data: { id } });
    if (!res.success) {
      toast.error(res.error || "Napaka pri brisanju prejemnika");
      return;
    }
    toast.success(t("deleted"));
    loadAll();
  };

  const applyRecipients = async (ruleId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const res = await serverApplyTemplateToFuture({
      data: {
        ruleId,
        fromDate: today,
      },
    });
    if (!res.success) {
      toast.error(res.error || "Napaka pri uporabi predloge");
      return;
    }
    toast.success(`${t("appliedToFuture")} (+${res.inserted} / -${res.deleted})`);
  };

  const setApproval = async (u: any, status: "approved" | "rejected" | "pending") => {
    const res = await serverSetApproval({
      data: {
        userId: u.id,
        allowedApps: u.allowed_apps,
        status,
      },
    });

    if (!res.success) {
      toast.error(res.error || "Napaka pri posodobitvi statusa");
      return;
    }
    toast.success(status === "approved" ? t("userApproved") : t("userRejected"));
    loadAll();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("admin")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Upravljanje let služenja, ponavljajočega tedenskega urnika, lokacij in članov.
          </p>
        </div>
      </div>

      {/* 1. MINSTRY YEARS */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("ministryYears")}</CardTitle>
          </div>
          <CardDescription>
            Ustvarjanje in upravljanje terminov za celotno leto (1. september – 31. avgust).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">{t("startYear")}</label>
              <Input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <Button onClick={() => generateYear(newYear)} disabled={busy} className="bg-primary text-white">
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-1.5" />}
              {t("generateYear")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Ustvarjena leta:</span>
            {years.map((y) => (
              <div key={y.id} className="flex items-center gap-1.5 bg-slate-100/90 rounded-lg p-1 border border-slate-200">
                <Badge variant="secondary" className="text-sm font-semibold px-2.5 py-0.5 bg-white text-slate-800 border">
                  {ministryLabel(y.start_year)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-primary hover:bg-primary/10"
                  onClick={() => generateYear(y.start_year)}
                  title={t("regenerateDates")}
                  disabled={busy}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t("regenerateDates")}
                </Button>
              </div>
            ))}
            {years.length === 0 && <span className="text-sm text-muted-foreground">—</span>}
          </div>
        </CardContent>
      </Card>

      {/* 2. LOCATIONS */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("locations")}</CardTitle>
          </div>
          <CardDescription>
            Seznam vseh prevzemnih mest (KFC, Spar, itd.), ki se nato dodelijo posameznim dnevom.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 max-w-md">
            <Input
              value={newLoc}
              onChange={(e) => setNewLoc(e.target.value)}
              placeholder="Vpiši novo lokacijo (npr. KFC Celje)..."
              onKeyDown={(e) => e.key === "Enter" && addLocation()}
            />
            <Button onClick={addLocation}>
              <Plus className="h-4 w-4 mr-1" />
              {t("addLocation")}
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {locations.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg border bg-slate-50/50 border-slate-200 text-sm font-medium"
              >
                <div className="flex items-center gap-2">
                  <LocationLogo name={l.name} size="sm" />
                  <span>{l.name}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeLocation(l.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            {locations.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">Ni vnesenih lokacij.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. RECURRING WEEKLY SCHEDULE & TEMPLATES */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Repeat className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Ponavljajoči tedenski urnik & predloge</CardTitle>
          </div>
          <CardDescription>
            Določite, katere dni v tednu se izvajajo prevzemi, katere postaje/lokacije se obiščejo in katera gospodinjstva prejmejo pomoč.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new weekday rule */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Dodaj nov dan v tednu za prevzem:</span>
            <div className="grid sm:grid-cols-3 gap-2">
              <Select
                value={String(newRule.weekday)}
                onValueChange={(v) => setNewRule({ ...newRule, weekday: Number(v) })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tArr(WEEKDAYS_KEY[0]).map((w, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={newRule.frequency}
                onValueChange={(v) => setNewRule({ ...newRule, frequency: v })}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">{t("weekly")}</SelectItem>
                  <SelectItem value="biweekly">{t("biweekly")}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={addRule} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t("addRule")}
              </Button>
            </div>
          </div>

          {/* Active Rules List */}
          <div className="space-y-4">
            {rules.length === 0 ? (
              <p className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                Ni dodanih ponavljajočih pravil. Zgoraj izberite dan in kliknite &quot;+ Dodaj pravilo&quot;.
              </p>
            ) : (
              rules.map((r) => {
                const stops = ruleStops.filter((s) => s.rule_id === r.id);
                const items = templates.filter((tp) => tp.rule_id === r.id);
                const usedHhIds = new Set(items.map((i) => i.household_id));
                const availableHh = households.filter((h) => !usedHhIds.has(h.id));
                const usedLocIds = new Set(stops.map((s) => s.location_id));
                const availableLoc = locations.filter((l) => !usedLocIds.has(l.id));

                return (
                  <div
                    key={r.id}
                    className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-4"
                  >
                    {/* Day Header */}
                    <div className="flex items-center justify-between pb-3 border-b">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-slate-900">
                          {tArr(WEEKDAYS_KEY[0])[r.weekday]}
                        </span>
                        <Badge variant="secondary" className="font-medium text-xs">
                          {r.frequency === "weekly" ? t("weekly") : t("biweekly")}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 h-8 px-2.5 gap-1 text-xs"
                        onClick={() => removeRule(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Odstrani dan
                      </Button>
                    </div>

                    {/* STOPS / LOCATIONS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          Postaje / Lokacije za ta dan ({stops.length})
                        </span>
                      </div>

                      <div className="space-y-2">
                        {stops.map((st) => (
                          <div
                            key={st.id}
                            className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/80 flex items-center justify-between gap-3 flex-wrap text-sm"
                          >
                            <div className="font-semibold min-w-36 text-slate-800 flex items-center gap-2">
                              <LocationLogo name={st.locations?.name} size="sm" />
                              <span>{st.locations?.name ?? "Neznana lokacija"}</span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap flex-1 justify-end">
                              {/* Driver selection */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Voznik:</span>
                                <Select
                                  value={st.default_driver_id ?? "none"}
                                  onValueChange={(val) =>
                                    updateRuleStop(st.id, {
                                      default_driver_id: val === "none" ? null : val,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs w-36 bg-white">
                                    <SelectValue placeholder="Brez" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">— Brez —</SelectItem>
                                    {people.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Coordinator selection */}
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Razdeljevalec:</span>
                                <Select
                                  value={st.default_coordinator_id ?? "none"}
                                  onValueChange={(val) =>
                                    updateRuleStop(st.id, {
                                      default_coordinator_id: val === "none" ? null : val,
                                    })
                                  }
                                >
                                  <SelectTrigger className="h-8 text-xs w-36 bg-white">
                                    <SelectValue placeholder="Brez" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">— Brez —</SelectItem>
                                    {people.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Apply to future dates */}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs"
                                onClick={() => applyAssignments(st.id)}
                                title="Uporabi izbrani osebi za vse prihodnje termine v načrtovalcu"
                              >
                                {t("applyToFuture")}
                              </Button>

                              {/* Delete Stop */}
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => removeRuleStop(st.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Add Stop to Rule */}
                        <div className="flex items-center gap-2 pt-1 max-w-md">
                          <Select
                            value={locPick[r.id] ?? ""}
                            onValueChange={(v) => setLocPick({ ...locPick, [r.id]: v })}
                          >
                            <SelectTrigger className="h-8 text-xs bg-white">
                              <SelectValue placeholder="Izberi lokacijo za dodajanje..." />
                            </SelectTrigger>
                            <SelectContent>
                              {availableLoc.map((l) => (
                                <SelectItem key={l.id} value={l.id}>
                                  {l.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 text-xs gap-1 whitespace-nowrap"
                            onClick={() => addRuleStop(r.id)}
                            disabled={!locPick[r.id]}
                          >
                            <Plus className="h-3.5 w-3.5" />
                            {t("addStop")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* RECIPIENTS */}
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                          Skupni prejemniki za ta dan ({items.length})
                        </span>
                        {items.length > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-primary hover:bg-primary/10"
                            onClick={() => applyRecipients(r.id)}
                          >
                            Uporabi prejemnike za prihodnje termine
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {items.map((tp) => (
                          <Badge
                            key={tp.id}
                            variant="outline"
                            className="bg-slate-50 pl-2.5 pr-1 py-1 gap-1 text-xs border-slate-300 flex items-center"
                          >
                            <span>
                              {tp.recipient_households?.name} (št. oseb: {tp.recipient_households?.size})
                            </span>
                            <button
                              onClick={() => removeRuleRecipient(tp.id)}
                              className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {items.length === 0 && (
                          <span className="text-xs text-muted-foreground">Ni dodeljenih prejemnikov za ta dan.</span>
                        )}
                      </div>

                      {/* Add Recipient to Rule */}
                      <div className="flex items-center gap-2 pt-1 max-w-md">
                        <Select
                          value={hhPick[r.id] ?? ""}
                          onValueChange={(v) => setHhPick({ ...hhPick, [r.id]: v })}
                        >
                          <SelectTrigger className="h-8 text-xs bg-white">
                            <SelectValue placeholder="Izberi gospodinjstvo za dodajanje..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableHh.map((h) => (
                              <SelectItem key={h.id} value={h.id}>
                                {h.name} (velikost: {h.size})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs gap-1 whitespace-nowrap"
                          onClick={() => addRuleRecipient(r.id)}
                          disabled={!hhPick[r.id]}
                        >
                          <Plus className="h-3.5 w-3.5" />
                          {t("addRecipient")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. USER MANAGEMENT WITH CLEAN TABS, RECIPIENTS & SEARCH */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">{t("manageUsers")}</CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-medium">
                  {t("driversTab")}: <strong className="text-slate-800">{driverCount}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-medium">
                  {t("coordinatorsTab")}: <strong className="text-slate-800">{coordinatorCount}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  {t("recipientsTab")}: <strong className="text-rose-900">{recipientCount}</strong>
                </span>
              </div>
              <Button
                size="sm"
                onClick={startNewPerson}
                className="gap-1.5 bg-[#93032E] hover:bg-[#7b0226] text-white text-xs h-8 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                {t("addPerson")}
              </Button>
            </div>
          </div>
          <CardDescription>
            Pregled in dodeljevanje vlog (Voznik, Razdeljevalec, Administrator, Prejemnik) za služenje pri Kruhu Življenja.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* TABS NAVIGATION */}
          <div className="flex flex-wrap gap-1.5 border-b pb-3">
            {/* 1. Ekipa (Vozniki & Razdeljevalci) - DEFAULT */}
            <button
              type="button"
              onClick={() => setUserTab("team")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userTab === "team"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>{t("activeTeam")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "team" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
                }`}
              >
                {teamCount}
              </Badge>
            </button>

            {/* 2. Vozniki */}
            <button
              type="button"
              onClick={() => setUserTab("drivers")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userTab === "drivers"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              <span>{t("driversTab")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "drivers" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
                }`}
              >
                {driverCount}
              </Badge>
            </button>

            {/* 3. Razdeljevalci */}
            <button
              type="button"
              onClick={() => setUserTab("coordinators")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userTab === "coordinators"
                  ? "bg-[#93032E] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <Utensils className="h-3.5 w-3.5" />
              <span>{t("coordinatorsTab")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "coordinators" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
                }`}
              >
                {coordinatorCount}
              </Badge>
            </button>

            {/* 4. Prejemniki */}
            <button
              type="button"
              onClick={() => setUserTab("recipients")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userTab === "recipients"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-rose-50 text-rose-800 hover:bg-rose-100/80 border border-rose-200/60"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              <span>{t("recipientsTab")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "recipients" ? "bg-white/20 text-white border-0" : "bg-white text-rose-900 border"
                }`}
              >
                {recipientCount}
              </Badge>
            </button>

            {/* 5. Zavrnjeni */}
            <button
              type="button"
              onClick={() => setUserTab("rejected")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userTab === "rejected"
                  ? "bg-destructive text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <UserX className="h-3.5 w-3.5" />
              <span>{t("rejectedTab")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "rejected" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
                }`}
              >
                {rejectedCount}
              </Badge>
            </button>

            {/* 6. Vsi člani (Placed at the end) */}
            <button
              type="button"
              onClick={() => setUserTab("all")}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto ${
                userTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/70"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t("allMembersTab")}</span>
              <Badge
                variant="secondary"
                className={`px-1.5 py-0 text-[10px] rounded-md ${
                  userTab === "all" ? "bg-white/20 text-white border-0" : "bg-white text-slate-800"
                }`}
              >
                {allCount}
              </Badge>
            </button>
          </div>

          {/* QUICK SEARCH */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder={t("searchUsersPlaceholder")}
              className="pl-9 pr-8 text-xs h-9 bg-slate-50/50"
            />
            {userSearch && (
              <button
                onClick={() => setUserSearch("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* USER LIST */}
          <ul className="divide-y divide-slate-100">
            {filteredUsers.map((u) => (
              <li key={u.id} className="py-3.5 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium flex items-center gap-2 flex-wrap text-slate-900">
                      <span>{u.full_name ?? u.email}</span>
                      {u.isRecipient && (
                        <Badge variant="outline" className="text-[10px] text-rose-700 bg-rose-50 border-rose-300 font-medium whitespace-nowrap px-1.5 py-0.5 gap-1">
                          <Heart className="h-2.5 w-2.5 fill-rose-500 text-rose-500 mr-0.5" />
                          {t("recipient")} ({u.recipientSize ?? 1})
                        </Badge>
                      )}
                      {!u.hasKruhAccess && (
                        <Badge variant="destructive" className="text-[10px] whitespace-nowrap">
                          {t("rejected")}
                        </Badge>
                      )}
                      {u.inPeople ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300 font-medium whitespace-nowrap px-2 py-0.5"
                        >
                          <Check className="h-2.5 w-2.5 mr-1" />
                          {t("inPeopleBadge")}
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 whitespace-nowrap"
                          onClick={() => addPersonFromProfile(u)}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          {t("addToPeople")}
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {[u.phone, u.email, u.address || u.street].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {/* Admin Button */}
                    {(() => {
                      const on = u.roles.includes("admin");
                      return (
                        <button
                          key="admin"
                          onClick={() => toggleRole(u, "admin", !on)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            on
                              ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-2xs"
                              : "border-amber-200/90 text-amber-800 bg-amber-50/50 hover:bg-amber-100/70"
                          }`}
                        >
                          <Crown className={`h-3 w-3 ${on ? "text-white fill-white/20" : "text-amber-600"}`} />
                          <span>{t("adminRole")}</span>
                        </button>
                      );
                    })()}

                    {/* Driver Button */}
                    {(() => {
                      const on = u.roles.includes("driver");
                      return (
                        <button
                          key="driver"
                          onClick={() => toggleRole(u, "driver", !on)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            on
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-2xs"
                              : "border-emerald-200/90 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/70"
                          }`}
                        >
                          <Truck className={`h-3 w-3 ${on ? "text-white" : "text-emerald-600"}`} />
                          <span>{t("driver")}</span>
                        </button>
                      );
                    })()}

                    {/* Distributor Button */}
                    {(() => {
                      const on = u.roles.includes("coordinator");
                      return (
                        <button
                          key="coordinator"
                          onClick={() => toggleRole(u, "coordinator", !on)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                            on
                              ? "bg-[#93032E] hover:bg-[#7b0226] text-white border-[#93032E] shadow-2xs"
                              : "border-rose-200/90 text-[#93032E] bg-rose-50/50 hover:bg-rose-100/70"
                          }`}
                        >
                          <Utensils className={`h-3 w-3 ${on ? "text-white" : "text-[#93032E]"}`} />
                          <span>{t("coordinator")}</span>
                        </button>
                      );
                    })()}

                    {/* Prejemnik Role Toggle */}
                    <button
                      onClick={() => toggleRole(u, "recipient", !u.isRecipient)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        u.isRecipient
                          ? "bg-rose-700 text-white border-rose-700 shadow-2xs"
                          : "border-rose-200 text-rose-700 bg-rose-50/50 hover:bg-rose-100"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${u.isRecipient ? "fill-white text-white" : "text-rose-600"}`} />
                      <span>{t("recipient")}</span>
                    </button>

                    {/* Quick Family Size Selector for Recipients */}
                    {u.isRecipient && (
                      <div
                        className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200/90 rounded-full px-2 py-0.5 text-xs text-slate-800 shadow-2xs"
                        title="Število oseb v družini"
                      >
                        <Users className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                        <select
                          value={u.recipientSize ?? 1}
                          onChange={(e) => updateRecipientSize(u, Number(e.target.value))}
                          className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer text-xs pr-1"
                          title="Hitra izbira števila oseb v družini"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {u.hasKruhAccess ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 h-7 text-xs ml-1"
                        onClick={() => setApproval(u, "rejected")}
                        title="Zavrni dostop samo za Kruh Življenja (ohrani profil v bazi cerkve)"
                      >
                        {t("reject")}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-primary hover:bg-primary/10 h-7 text-xs ml-1"
                        onClick={() => setApproval(u, "approved")}
                      >
                        {t("reactivate")}
                      </Button>
                    )}
                  </div>
                </div>
              </li>
            ))}
            {filteredUsers.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">
                Ni najdenih članov za izbran filter.
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* ADD / EDIT PERSON DIALOG */}
      <Dialog open={personModalOpen} onOpenChange={setPersonModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPerson?.id ? t("edit") : t("addPerson")}</DialogTitle>
          </DialogHeader>
          {editingPerson && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("firstName")}</Label>
                  <Input
                    value={editingPerson.first_name ?? ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("lastName")}</Label>
                  <Input
                    value={editingPerson.last_name ?? ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{t("phone")}</Label>
                  <Input
                    value={editingPerson.phone ?? ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>{t("email")}</Label>
                  <Input
                    value={editingPerson.email ?? ""}
                    onChange={(e) => setEditingPerson({ ...editingPerson, email: e.target.value })}
                  />
                </div>
              </div>

              {/* ADDRESS FIELD */}
              <div>
                <Label>{t("address")}</Label>
                <Input
                  value={editingPerson.address ?? ""}
                  onChange={(e) => setEditingPerson({ ...editingPerson, address: e.target.value })}
                  placeholder="npr. Mariborska cesta 12, 3000 Celje"
                />
              </div>

              <div>
                <Label>{t("notes")}</Label>
                <Textarea
                  value={editingPerson.notes ?? ""}
                  onChange={(e) => setEditingPerson({ ...editingPerson, notes: e.target.value })}
                />
              </div>

              {/* ROLES TOGGLE */}
              <div>
                <Label>{t("roles")}</Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {/* Admin */}
                  {(() => {
                    const on = (editingPerson.roles ?? []).includes("admin");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPerson({
                            ...editingPerson,
                            roles: on
                              ? editingPerson.roles.filter((x: string) => x !== "admin")
                              : [...(editingPerson.roles ?? []), "admin"],
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
                    const on = (editingPerson.roles ?? []).includes("driver");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPerson({
                            ...editingPerson,
                            roles: on
                              ? editingPerson.roles.filter((x: string) => x !== "driver")
                              : [...(editingPerson.roles ?? []), "driver"],
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
                    const on = (editingPerson.roles ?? []).includes("coordinator");
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingPerson({
                            ...editingPerson,
                            roles: on
                              ? editingPerson.roles.filter((x: string) => x !== "coordinator")
                              : [...(editingPerson.roles ?? []), "coordinator"],
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
                  checked={editingPerson.active}
                  onCheckedChange={(v) => setEditingPerson({ ...editingPerson, active: v })}
                />
                <Label>{t("active")}</Label>
              </div>

              {/* RECIPIENT TOGGLE */}
              <div className="border-t pt-3">
                <label
                  htmlFor="admin-recipient-switch"
                  className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    editingPerson.isRecipient
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Heart
                      className={`h-4 w-4 ${
                        editingPerson.isRecipient ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                    {t("alsoRecipient")}
                  </span>
                  <Switch
                    id="admin-recipient-switch"
                    checked={editingPerson.isRecipient}
                    onCheckedChange={(v) => setEditingPerson({ ...editingPerson, isRecipient: v })}
                  />
                </label>
              </div>

              {editingPerson.isRecipient && (
                <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
                  <div className="font-semibold text-sm">{t("recipientDetails")}</div>
                  <div>
                    <Label>{t("householdName")}</Label>
                    <Input
                      value={editingPerson.household?.name ?? ""}
                      onChange={(e) =>
                        setEditingPerson({
                          ...editingPerson,
                          household: { ...editingPerson.household, name: e.target.value },
                        })
                      }
                      placeholder={editingPerson.full_name || t("name")}
                    />
                  </div>
                  <div>
                    <Label>{t("address")}</Label>
                    <Input
                      value={editingPerson.household?.address ?? editingPerson.address ?? ""}
                      onChange={(e) =>
                        setEditingPerson({
                          ...editingPerson,
                          household: { ...editingPerson.household, address: e.target.value },
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
                        value={editingPerson.household?.size ?? 1}
                        onChange={(e) =>
                          setEditingPerson({
                            ...editingPerson,
                            household: { ...editingPerson.household, size: Number(e.target.value) || 1 },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>{t("phone")}</Label>
                      <Input
                        value={editingPerson.household?.phone ?? editingPerson.phone ?? ""}
                        onChange={(e) =>
                          setEditingPerson({
                            ...editingPerson,
                            household: { ...editingPerson.household, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{t("notes")}</Label>
                    <Textarea
                      value={editingPerson.household?.notes ?? ""}
                      onChange={(e) =>
                        setEditingPerson({
                          ...editingPerson,
                          household: { ...editingPerson.household, notes: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPersonModalOpen(false)} disabled={savingPerson}>
              {t("cancel")}
            </Button>
            <Button onClick={savePerson} disabled={savingPerson} className="bg-[#93032E] hover:bg-[#7b0226] text-white">
              {savingPerson ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
