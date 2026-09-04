import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ShieldAlert,
  Loader2,
  Mail,
  RefreshCw,
  Send,
  Eye,
  Play,
  CheckCircle2,
  Smartphone,
  Copy,
  Check,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getEmailAdminData,
  triggerDriverNotification,
  previewDriverEmail,
  sendTestEmailToSelf,
  listUpcomingAssignedStops,
  getSendLogStatus,
  runDailyRemindersNow,
  getViberMessageForStop,
} from "@/lib/email-admin.functions";

export const Route = createFileRoute("/_authenticated/email-queue")({
  component: EmailQueuePage,
});

type Row = {
  id: string;
  notification_type: string;
  recipient_email: string;
  driver_name: string | null;
  location_name: string | null;
  scheduled_date: string | null;
  created_at: string;
  sent_at: string | null;
  message_id: string | null;
  enqueue_status: string;
  delivery_status: string | null;
  delivery_error: string | null;
  enqueue_error: string | null;
  provider_message_id: string | null;
  final_status: string;
};

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "delivered") return "default";
  if (s === "sent") return "secondary";
  if (s === "pending" || s === "queued") return "outline";
  if (s === "failed" || s === "dlq" || s === "bounced" || s === "complained") return "destructive";
  return "outline";
}

function statusLabel(s: string, t: (k: any) => string): string {
  switch (s) {
    case "pending":
    case "queued":
      return t("emailSummaryPending");
    case "sent":
      return t("emailColSent");
    case "delivered":
      return t("emailSummaryDelivered");
    case "bounced":
      return "bounced";
    case "complained":
      return "complained";
    case "failed":
      return "failed";
    case "dlq":
      return "dlq";
    case "suppressed":
      return "suppressed";
    case "skipped":
      return "skipped";
    default:
      return s;
  }
}

function statusTooltip(s: string, t: (k: any) => string): string {
  switch (s) {
    case "pending":
    case "queued":
      return t("emailStatusTipPending");
    case "sent":
      return "Poslano preko Resend API";
    case "delivered":
      return t("emailStatusTipDelivered");
    case "bounced":
      return t("emailStatusTipBounced");
    case "complained":
      return t("emailStatusTipComplained");
    case "failed":
      return t("emailStatusTipFailed");
    case "dlq":
      return t("emailStatusTipDlq");
    case "suppressed":
      return t("emailStatusTipSuppressed");
    default:
      return "";
  }
}

function formatNotificationTypeBadge(type: string): string {
  switch (type) {
    case "assignment":
      return "dodelitev";
    case "change":
      return "sprememba";
    case "reminder":
      return "opomnik (24h)";
    case "reminder_today":
      return "opomnik (danes)";
    case "test":
      return "test";
    default:
      return type;
  }
}

function EmailQueuePage() {
  const { t } = useI18n();
  const { isAdmin, user } = useAuth();
  const getData = useServerFn(getEmailAdminData);
  const trigger = useServerFn(triggerDriverNotification);
  const preview = useServerFn(previewDriverEmail);
  const sendTest = useServerFn(sendTestEmailToSelf);
  const pollStatus = useServerFn(getSendLogStatus);
  const listStops = useServerFn(listUpcomingAssignedStops);
  const runReminders = useServerFn(runDailyRemindersNow);
  const getViber = useServerFn(getViberMessageForStop);

  const [data, setData] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [pickStop, setPickStop] = useState<string>("");
  const [pickType, setPickType] = useState<"assignment" | "change" | "reminder" | "reminder_today">("reminder");
  const [previewOpen, setPreviewOpen] = useState<{ subject: string; body: string; recipient: string | null; html?: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [viberModal, setViberModal] = useState<{
    open: boolean;
    text: string;
    viberUrl: string;
    driverName: string;
    driverPhone: string | null;
    copied: boolean;
  } | null>(null);

  const load = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [d, s] = await Promise.all([
        getData({ data: {} }),
        listStops(),
      ]);
      setData(d);
      setStops(s as any[]);
    } catch (e: any) {
      toast.error(e?.message ?? "load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    /* eslint-disable-next-line */
  }, [isAdmin]);

  const filtered = useMemo<Row[]>(() => {
    const rows: Row[] = data?.rows ?? [];
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.final_status !== statusFilter) return false;
      if (typeFilter !== "all" && r.notification_type !== typeFilter) return false;
      return true;
    });
  }, [data, statusFilter, typeFilter]);

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

  const summary = data?.summary ?? {
    pending: 0,
    sent: 0,
    sentToday: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
    suppressed: 0,
  };

  const onTrigger = async () => {
    if (!pickStop) return toast.error("Izberi postajo");
    setBusy("trigger");
    try {
      const res = await trigger({ data: { stopId: pickStop, type: pickType } });
      const first = (res as any)?.results?.[0];
      if (first?.status === "skipped") {
        toast.info(`Obvestilo preskočeno: ${first.reason ?? "preskočeno"}`);
      } else if (first?.status === "failed") {
        toast.error(`Pošiljanje ni uspelo: ${first.reason ?? "napaka"}`);
      } else {
        toast.success(t("emailTriggered"));
      }
      await load();
    } catch (e: any) {
      toast.error(e?.message);
    } finally {
      setBusy(null);
    }
  };

  const onPreview = async () => {
    if (!pickStop) return toast.error("Izberi postajo");
    setBusy("preview");
    try {
      const res = await preview({ data: { stopId: pickStop, type: pickType } });
      setPreviewOpen({ subject: res.subject, body: res.body, recipient: res.recipient, html: res.html });
    } catch (e: any) {
      toast.error(e?.message);
    } finally {
      setBusy(null);
    }
  };

  const onSendTest = async () => {
    setBusy("test");
    try {
      const res = await sendTest({ data: { email: user?.email ?? undefined } });
      toast.success(`Testno sporočilo poslano preko Resend → ${res.recipient}`);
      await load();
    } catch (e: any) {
      toast.error(`Pošiljanje ni uspelo: ${e?.message ?? "Test failed"}`);
    } finally {
      setBusy(null);
    }
  };

  const onRunDailyReminders = async () => {
    setBusy("cron");
    try {
      const res = await runReminders();
      toast.success(
        `Opomniki zaključeni! Poslano: ${res.sent}, Že poslano/preskočeno: ${res.skipped}${
          res.failed > 0 ? `, Napake: ${res.failed}` : ""
        }`
      );
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Napaka pri zagonu opomnikov");
    } finally {
      setBusy(null);
    }
  };

  const onOpenViberModal = async () => {
    if (!pickStop) return toast.error("Najprej izberi postajo");
    setBusy("viber");
    try {
      const res = await getViber({ data: { stopId: pickStop } });
      setViberModal({
        open: true,
        text: res.text,
        viberUrl: res.viberUrl,
        driverName: res.driverName,
        driverPhone: res.driverPhone,
        copied: false,
      });
    } catch (e: any) {
      toast.error(e?.message ?? "Napaka pri pripravi Viber sporočila");
    } finally {
      setBusy(null);
    }
  };

  const copyViberText = () => {
    if (!viberModal?.text) return;
    navigator.clipboard.writeText(viberModal.text);
    setViberModal({ ...viberModal, copied: true });
    toast.success("Viber sporočilo kopirano v odložišče!");
    setTimeout(() => {
      setViberModal((prev) => (prev ? { ...prev, copied: false } : null));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-7 w-7 text-primary" /> Obvestila & E-pošta (Resend Hub)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upravljanje avtomatskih obvestil (dodelitve, 24h opomniki, opomniki na dan prevzema) in Viber komunikacije.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 py-1 px-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Resend: kruhzivljenja@kalvarija.si</span>
          </Badge>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Osveži
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Poslano danes</div>
            <div className="text-2xl font-bold text-primary">{summary.sentToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Poslano (skupaj)</div>
            <div className="text-2xl font-bold">{summary.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Dostavljeno</div>
            <div className="text-2xl font-bold text-emerald-600">{summary.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Neuspešno</div>
            <div className={`text-2xl font-bold ${summary.failed > 0 ? "text-destructive" : ""}`}>{summary.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Preskočeno / Že poslano</div>
            <div className="text-2xl font-bold text-muted-foreground">{summary.skipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-xs text-muted-foreground">Blokirano</div>
            <div className="text-2xl font-bold text-muted-foreground">{summary.suppressed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Automated Jobs (Vercel Cron & Manual Trigger) */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/[0.03] to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-5 w-5 text-primary" /> Avtomatski opomniki (Vercel Cron)
              </CardTitle>
              <CardDescription className="mt-1">
                Avtomatsko pošiljanje vsak dan ob 09:00 (07:00 UTC). Pošlje opomnik za jutrišnje prevzeme (24h) ter jutranji opomnik za današnje prevzeme.
              </CardDescription>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={onRunDailyReminders}
              disabled={busy !== null}
              className="font-medium"
            >
              {busy === "cron" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Sproži opomnike zdaj (danes + jutri)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-muted/40 rounded-lg p-3 border">
            <div>
              <span className="font-semibold text-foreground">1. Obvestilo ob prijavi / dodelitvi:</span>
              <p className="text-muted-foreground mt-0.5">Se sproži takoj ob izbiri voznika v Načrtovalcu.</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">2. Opomnik 24h prej:</span>
              <p className="text-muted-foreground mt-0.5">Dan pred prevzemom opozori voznika na jutrišnjo zadolžitev.</p>
            </div>
            <div>
              <span className="font-semibold text-foreground">3. Opomnik na dan prevzema:</span>
              <p className="text-muted-foreground mt-0.5">Zjutraj opozori voznika z lokacijo in stikom koordinatorja.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing & Multi-Channel Tools */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" /> Orodja za pošiljanje & Viber komunikacija
          </CardTitle>
          <CardDescription>
            Izberi termin in postajo za predogled, takojšnje pošiljanje e-pošte ali pripravo Viber sporočila.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2.5 items-end">
            <div className="flex-1 min-w-[260px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Izberi prihajajočo postajo z voznikom
              </label>
              <Select value={pickStop} onValueChange={setPickStop}>
                <SelectTrigger>
                  <SelectValue placeholder="— Izberi termin in voznika —" />
                </SelectTrigger>
                <SelectContent>
                  {stops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.date} · {s.location} · {s.driver_name ?? "—"}
                      {!s.driver_email ? ` (${t("emailNoDriverEmail")})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[200px]">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Vrsta obvestila
              </label>
              <Select value={pickType} onValueChange={(v) => setPickType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Dodelitev voznika</SelectItem>
                  <SelectItem value="change">Sprememba razporeda</SelectItem>
                  <SelectItem value="reminder">24h opomnik (jutri)</SelectItem>
                  <SelectItem value="reminder_today">Opomnik (danes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={onPreview} disabled={busy !== null}>
                <Eye className="h-4 w-4 mr-1.5" /> Predogled e-pošte
              </Button>
              <Button onClick={onTrigger} disabled={busy !== null}>
                {busy === "trigger" ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Play className="h-4 w-4 mr-1.5" />}
                Pošlji e-pošto
              </Button>
              <Button
                variant="secondary"
                onClick={onOpenViberModal}
                disabled={busy !== null}
                className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800"
              >
                {busy === "viber" ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Smartphone className="h-4 w-4 mr-1.5" />}
                Viber sporočilo
              </Button>
              <Button variant="outline" onClick={onSendTest} disabled={busy !== null}>
                {busy === "test" ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
                Test meni
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold">Dnevnik poslanih obvestil</CardTitle>
              <CardDescription>Zgodovina vseh poslanih e-poštnih sporočil s potrditvijo Resend ponudnika.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vsi statusi</SelectItem>
                  <SelectItem value="sent">Poslano (Resend)</SelectItem>
                  <SelectItem value="delivered">Dostavljeno</SelectItem>
                  <SelectItem value="failed">Neuspešno</SelectItem>
                  <SelectItem value="skipped">Preskočeno</SelectItem>
                  <SelectItem value="suppressed">Blokirano</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vsi tipi</SelectItem>
                  <SelectItem value="assignment">Dodelitve</SelectItem>
                  <SelectItem value="change">Spremembe</SelectItem>
                  <SelectItem value="reminder">Opomniki</SelectItem>
                  <SelectItem value="test">Testna sporočila</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">{t("emailNoRows")}</p>
          ) : (
            <div className="overflow-x-auto">
              <TooltipProvider>
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground border-b">
                    <tr>
                      <th className="text-left py-2">Prejemnik / Voznik</th>
                      <th className="text-left py-2">Tip obvestila</th>
                      <th className="text-left py-2">Termin in lokacija</th>
                      <th className="text-left py-2">Čas pošiljanja</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Resend ID</th>
                      <th className="text-left py-2">Opomba / Napaka</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t align-top hover:bg-muted/30 transition-colors">
                        <td className="py-2.5">
                          <div className="font-medium text-foreground">{r.driver_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{r.recipient_email}</div>
                        </td>
                        <td className="py-2.5">
                          <Badge variant="outline" className="text-xs capitalize font-normal">
                            {formatNotificationTypeBadge(r.notification_type)}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-xs">
                          <div className="font-medium">{r.location_name ?? "—"}</div>
                          <div className="text-muted-foreground">{r.scheduled_date ?? ""}</div>
                        </td>
                        <td className="py-2.5 text-xs text-muted-foreground">
                          {r.sent_at ? new Date(r.sent_at).toLocaleString("sl-SI") : new Date(r.created_at).toLocaleString("sl-SI")}
                        </td>
                        <td className="py-2.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant={statusVariant(r.final_status)} className="cursor-help capitalize">
                                {statusLabel(r.final_status, t)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              {statusTooltip(r.final_status, t)}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="py-2.5 text-xs font-mono text-muted-foreground max-w-[170px] truncate" title={r.provider_message_id ?? ""}>
                          {r.provider_message_id ?? "—"}
                        </td>
                        <td className="py-2.5 text-xs text-destructive max-w-[240px] truncate" title={r.delivery_error ?? r.enqueue_error ?? ""}>
                          {r.delivery_error ?? r.enqueue_error ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Preview Modal */}
      <Dialog open={!!previewOpen} onOpenChange={(o) => !o && setPreviewOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Predogled e-pošte (Resend)
            </DialogTitle>
          </DialogHeader>
          {previewOpen && (
            <div className="space-y-3 text-sm overflow-y-auto flex-1 pr-1">
              <div className="rounded-md bg-muted/60 p-3 space-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium">Pošiljatelj:</span>{" "}
                  <span className="font-mono">Kruh Življenja &lt;kruhzivljenja@kalvarija.si&gt;</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Prejemnik:</span>{" "}
                  <span className="font-semibold">{previewOpen.recipient ?? "Voznik nima vpisane e-pošte"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Zadeva:</span>{" "}
                  <span className="font-semibold text-foreground">{previewOpen.subject}</span>
                </div>
              </div>
              {previewOpen.html ? (
                <div className="rounded-lg border overflow-hidden shadow-inner">
                  <iframe
                    title="email-preview"
                    srcDoc={previewOpen.html}
                    className="w-full h-[520px] border-0 bg-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1">Vsebina sporočila:</label>
                  <pre className="whitespace-pre-wrap rounded-lg border p-3.5 bg-muted/40 text-xs font-sans leading-relaxed">
                    {previewOpen.body}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(null)}>
              Zapri
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Viber Message Generator Modal */}
      <Dialog open={!!viberModal?.open} onOpenChange={(o) => !o && setViberModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
              <Smartphone className="h-5 w-5 text-purple-600" /> Viber obvestilo za voznika
            </DialogTitle>
          </DialogHeader>
          {viberModal && (
            <div className="space-y-4 text-sm">
              <div className="text-xs text-muted-foreground">
                Sporočilo lahko z enim klikom kopiraš in prilepiš v Viber klepet ali odpreš neposredno v Viber aplikaciji.
              </div>

              <div className="rounded-lg border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800 p-3.5">
                <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed text-foreground">
                  {viberModal.text}
                </pre>
              </div>

              {viberModal.driverPhone && (
                <div className="text-xs text-muted-foreground">
                  Telefonska številka voznika: <span className="font-semibold text-foreground">{viberModal.driverPhone}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={copyViberText}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                >
                  {viberModal.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {viberModal.copied ? "Kopirano v odložišče!" : "Kopiraj za Viber"}
                </Button>

                <a
                  href={viberModal.viberUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center py-2 px-4 rounded-md text-xs font-medium border border-purple-300 bg-white hover:bg-purple-50 text-purple-900 dark:bg-zinc-900 dark:text-purple-300 dark:border-purple-800 transition-colors"
                >
                  Odpri Viber aplikacijo
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
