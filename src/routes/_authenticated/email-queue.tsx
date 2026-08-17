import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldAlert, Loader2, Mail, RefreshCw, Send, Eye, Play, Info } from "lucide-react";
import { toast } from "sonner";
import {
  getEmailAdminData,
  triggerDriverNotification,
  previewDriverEmail,
  sendTestEmailToSelf,
  listUpcomingAssignedStops,
  getSendLogStatus,
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

// Map raw status → UI label key + variant.
// IMPORTANT: only 'delivered' uses the success-green variant. 'sent' is neutral
// because it only means "handed to provider" — not that the email reached the inbox.
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
      return t("emailStatusTipSent");
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

function EmailQueuePage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const getData = useServerFn(getEmailAdminData);
  const trigger = useServerFn(triggerDriverNotification);
  const preview = useServerFn(previewDriverEmail);
  const sendTest = useServerFn(sendTestEmailToSelf);
  const pollStatus = useServerFn(getSendLogStatus);
  const listStops = useServerFn(listUpcomingAssignedStops);

  const [data, setData] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [pickStop, setPickStop] = useState<string>("");
  const [pickType, setPickType] = useState<"assignment" | "change" | "reminder">("reminder");
  const [previewOpen, setPreviewOpen] = useState<{ subject: string; body: string; recipient: string | null } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

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
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isAdmin]);

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
      <Card><CardContent className="py-12 text-center text-muted-foreground">
        <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-warning" />
        Admin only.
      </CardContent></Card>
    );
  }

  const summary = data?.summary ?? { pending: 0, sent: 0, sentToday: 0, delivered: 0, failed: 0, skipped: 0, suppressed: 0 };
  const cron = data?.cron ?? { jobs: [], runs: [] };
  const senderDomainOk = data?.senderDomainOk ?? true;
  const hasDomainFailure = !senderDomainOk;

  const onTrigger = async () => {
    if (!pickStop) return toast.error("Pick a stop");
    setBusy("trigger");
    try {
      const res = await trigger({ data: { stopId: pickStop, type: pickType } });
      toast.success(t("emailTriggered"));
      console.log("trigger result", res);
      await load();
    } catch (e: any) { toast.error(e?.message); }
    finally { setBusy(null); }
  };
  const onPreview = async () => {
    if (!pickStop) return toast.error("Pick a stop");
    setBusy("preview");
    try {
      const res = await preview({ data: { stopId: pickStop, type: pickType } });
      setPreviewOpen({ subject: res.subject, body: res.body, recipient: res.recipient });
    } catch (e: any) { toast.error(e?.message); }
    finally { setBusy(null); }
  };
  const onSendTest = async () => {
    setBusy("test");
    try {
      const res = await sendTest();
      toast.success(`${t("emailTestSent")} → ${res.recipient}`);
      // Poll the send log for up to ~25s so we can surface a provider
      // rejection (e.g. missing_unsubscribe, domain_not_verified) instead
      // of silently leaving the row as "pending" in the user's view.
      const mid = res.message_id;
      let final: any = null;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 2500));
        const row = await pollStatus({ data: { messageId: mid } });
        if (row && row.status !== "pending") { final = row; break; }
      }
      await load();
      if (final) {
        if (final.status === "sent" || final.status === "delivered") {
          toast.success(
            final.provider_message_id
              ? `Provider accepted (ref ${final.provider_message_id}). Check inbox / spam.`
              : "Provider accepted. Check inbox / spam.",
          );
        } else {
          toast.error(
            `Provider rejected: ${final.error_message ?? final.status}`,
            { duration: 12000 },
          );
        }
      }
    } catch (e: any) { toast.error(e?.message ?? "Test failed"); }
    finally { setBusy(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-7 w-7" /> {t("emailQueueTitle")}
        </h1>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {hasDomainFailure && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("emailDomainWarning")}
        </div>
      )}

      <div className="rounded-md border bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex gap-2 items-start">
        <Info className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{t("emailStatusInfo")}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
        {[
          ["emailSummaryPending", summary.pending],
          ["emailSummarySentToday", summary.sentToday],
          ["emailSummarySent", summary.sent],
          ["emailSummaryDelivered", summary.delivered],
          ["emailSummaryFailed", summary.failed],
          ["emailSummarySkipped", summary.skipped],
          ["emailSummarySuppressed", summary.suppressed],
        ].map(([k, v]) => (
          <Card key={k as string}><CardContent className="py-4">
            <div className="text-xs text-muted-foreground">{t(k as any)}</div>
            <div className="text-2xl font-semibold">{v as number}</div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>{t("emailCronTitle")}</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr><th className="text-left py-1">{t("emailCronJob")}</th><th className="text-left">{t("emailCronSchedule")}</th><th className="text-left">{t("emailCronActive")}</th><th className="text-left">{t("emailCronLastRun")}</th><th className="text-left">{t("emailCronStatus")}</th></tr>
            </thead>
            <tbody>
              {(cron.jobs ?? []).map((j: any) => {
                const last = (cron.runs ?? []).find((r: any) => r.jobname === j.jobname);
                return (
                  <tr key={j.jobid} className="border-t">
                    <td className="py-2 font-mono text-xs">{j.jobname}</td>
                    <td className="font-mono text-xs">{j.schedule}</td>
                    <td>{j.active ? <Badge>on</Badge> : <Badge variant="destructive">off</Badge>}</td>
                    <td className="text-xs">{last?.start_time ? new Date(last.start_time).toLocaleString() : "—"}</td>
                    <td>{last ? <Badge variant={last.status === "succeeded" ? "default" : "destructive"}>{last.status}</Badge> : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("emailToolsTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[260px]">
              <label className="text-xs text-muted-foreground">{t("emailPickStop")}</label>
              <Select value={pickStop} onValueChange={setPickStop}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  {stops.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.date} · {s.location} · {s.driver_name ?? "—"}{!s.driver_email ? ` (${t("emailNoDriverEmail")})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select value={pickType} onValueChange={(v) => setPickType(v as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="assignment">{t("emailTypeAssignment")}</SelectItem>
                <SelectItem value="change">{t("emailTypeChange")}</SelectItem>
                <SelectItem value="reminder">{t("emailTypeReminder")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onPreview} disabled={busy !== null}>
              <Eye className="h-4 w-4 mr-1" /> {t("emailPreviewBtn")}
            </Button>
            <Button onClick={onTrigger} disabled={busy !== null}>
              <Play className="h-4 w-4 mr-1" /> {t("emailTriggerBtn")}
            </Button>
            <Button variant="secondary" onClick={onSendTest} disabled={busy !== null}>
              <Send className="h-4 w-4 mr-1" /> {t("emailSendTestToMe")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log</CardTitle>
          <div className="flex flex-wrap gap-2 pt-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("emailFilterAll")} · {t("emailFilterStatus")}</SelectItem>
                <SelectItem value="queued">queued</SelectItem>
                <SelectItem value="pending">pending</SelectItem>
                <SelectItem value="sent">handed to provider</SelectItem>
                <SelectItem value="delivered">delivered</SelectItem>
                <SelectItem value="bounced">bounced</SelectItem>
                <SelectItem value="complained">complained</SelectItem>
                <SelectItem value="dlq">dlq</SelectItem>
                <SelectItem value="failed">failed</SelectItem>
                <SelectItem value="skipped">skipped</SelectItem>
                <SelectItem value="suppressed">suppressed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("emailFilterAll")} · {t("emailFilterType")}</SelectItem>
                <SelectItem value="assignment">{t("emailTypeAssignment")}</SelectItem>
                <SelectItem value="change">{t("emailTypeChange")}</SelectItem>
                <SelectItem value="reminder">{t("emailTypeReminder")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("emailNoRows")}</p>
          ) : (
            <div className="overflow-x-auto">
              <TooltipProvider>
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left py-1">{t("emailColRecipient")}</th>
                      <th className="text-left">{t("emailColType")}</th>
                      <th className="text-left">{t("emailColStop")}</th>
                      <th className="text-left">{t("emailColCreated")}</th>
                      <th className="text-left">{t("emailColSent")}</th>
                      <th className="text-left">{t("emailColStatus")}</th>
                      <th className="text-left">{t("emailColProviderRef")}</th>
                      <th className="text-left">{t("emailColError")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr key={r.id} className="border-t align-top">
                        <td className="py-2">
                          <div className="font-medium">{r.driver_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground">{r.recipient_email}</div>
                        </td>
                        <td><Badge variant="outline">{r.notification_type}</Badge></td>
                        <td className="text-xs">
                          {r.location_name ?? "—"}<br />
                          <span className="text-muted-foreground">{r.scheduled_date ?? ""}</span>
                        </td>
                        <td className="text-xs">{new Date(r.created_at).toLocaleString()}</td>
                        <td className="text-xs">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                        <td>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant={statusVariant(r.final_status)} className="cursor-help">
                                {statusLabel(r.final_status, t)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs text-xs">
                              {statusTooltip(r.final_status, t)}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="text-xs font-mono text-muted-foreground max-w-[180px] truncate" title={r.provider_message_id ?? ""}>
                          {r.provider_message_id ?? "—"}
                        </td>
                        <td className="text-xs text-destructive max-w-[280px] truncate" title={r.delivery_error ?? r.enqueue_error ?? ""}>
                          {r.delivery_error ?? r.enqueue_error ?? ""}
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

      <Dialog open={!!previewOpen} onOpenChange={(o) => !o && setPreviewOpen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("emailPreviewTitle")}</DialogTitle>
          </DialogHeader>
          {previewOpen && (
            <div className="space-y-3 text-sm">
              <div><span className="text-xs text-muted-foreground">{t("emailColRecipient")}:</span> {previewOpen.recipient ?? t("emailNoDriverEmail")}</div>
              <div><span className="text-xs text-muted-foreground">Subject:</span> <span className="font-medium">{previewOpen.subject}</span></div>
              <pre className="whitespace-pre-wrap rounded border p-3 bg-muted text-xs">{previewOpen.body}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
