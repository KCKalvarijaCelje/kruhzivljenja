import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getPublicSchedule, getLatestStopUpdate, type PublicScheduleRow, type PublicRecipient, type LatestStopUpdate } from "@/lib/dashboard.functions";
import { useAuth } from "@/lib/use-auth";
import { useI18n } from "@/lib/i18n";
import { currentMinistryStartYear, ministryLabel } from "@/lib/ministry-year";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, LogIn, LayoutDashboard, Loader2, Heart, MessageSquare } from "lucide-react";
import { formatAppDateTime } from "@/lib/tz";
import logoUrl from "@/assets/logo.png";
import { RenderedMessage } from "@/lib/stop-message-format";
import { AppShell } from "@/components/app-shell";
import { LocationLogo } from "@/components/location-logo";

export const Route = createFileRoute("/dashboard")({
  component: PublicDashboard,
});

function PublicDashboard() {
  const { t, lang, setLang, tArr } = useI18n();
  const { user, isApproved, approvalStatus } = useAuth();
  const fetchPublic = useServerFn(getPublicSchedule);
  const fetchLatest = useServerFn(getLatestStopUpdate);
  const [rows, setRows] = useState<PublicScheduleRow[]>([]);
  const [latest, setLatest] = useState<LatestStopUpdate | null>(null);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);
  const startYear = currentMinistryStartYear();

  useEffect(() => {
    (async () => {
      try {
        const [data, l] = await Promise.all([fetchPublic(), fetchLatest()]);
        setRows(data ?? []);
        setLatest(l);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPublic, fetchLatest]);

  const upcoming = useMemo(() => rows.filter((r) => r.date >= todayStr), [rows, todayStr]);
  const next = upcoming[0];
  const rest = upcoming.slice(1, 10);
  const previous = useMemo(() => {
    const past = rows.filter((r) => r.date < todayStr);
    return past[past.length - 1];
  }, [rows, todayStr]);

  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return `${d.getDate()}. ${tArr("monthsShort")[d.getMonth()]}`;
  };
  const wdLong = (iso: string) => tArr("weekdaysShort")[new Date(iso + "T00:00:00").getDay()];

  const useAuthShell = !!user && (approvalStatus === "unknown" ? false : isApproved);

  const content = (
    <>
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          {/* HERO — Upcoming assignment */}
          <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/[0.04] to-transparent overflow-hidden">
            <CardContent className="p-5 md:p-7 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] uppercase tracking-[0.12em] text-primary font-semibold">
                  {t("upcomingAssignments")}
                </span>
                {next && next.date === todayStr && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                    {t("todayLabel")}
                  </span>
                )}
              </div>

              {next ? (
                <>
                  <div className="leading-tight">
                    <div className="text-3xl md:text-4xl font-bold tracking-tight">
                      {wdLong(next.date)}
                    </div>
                    <div className="text-base md:text-lg text-muted-foreground mt-0.5">
                      {fmt(next.date)}
                    </div>
                  </div>

                  {next.stops.length === 0 ? (
                    <EmptyLine text={t("noStops")} />
                  ) : (
                    <div className="space-y-3">
                      {next.stops.map((s) => (
                        <StopBlock key={s.id} stop={s} prominent />
                      ))}
                    </div>
                  )}

                  <RecipientsButton recipients={next.recipients} label={`${wdLong(next.date)} ${fmt(next.date)}`} />
                </>
              ) : (
                <EmptyState
                  title={t("noDates")}
                  icon={<CalendarDays className="h-7 w-7 text-muted-foreground/60" />}
                />
              )}
            </CardContent>
          </Card>

          {/* Upcoming list */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {t("upcomingDates")}
            </h2>
            <Card>
              <CardContent className="p-2 md:p-3">
                {rest.length === 0 ? (
                  <div className="p-6">
                    <EmptyLine text={t("noDates")} />
                  </div>
                ) : (
                  <ul className="divide-y">
                    {rest.map((r) => (
                      <DateRow key={r.id} row={r} fmt={fmt} wdLong={wdLong} />
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Last assignment */}
          {previous && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {t("lastAssignment")}
              </h2>
              <Card className="bg-muted/30">
                <CardContent className="p-5 md:p-6 space-y-5">
                  <div className="leading-tight">
                    <div className="text-xl md:text-2xl font-semibold">
                      {wdLong(previous.date)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {fmt(previous.date)}
                    </div>
                  </div>

                  {previous.stops.length === 0 ? (
                    <EmptyLine text={t("noStops")} />
                  ) : (
                    <div className="space-y-3">
                      {previous.stops.map((s) => (
                        <StopBlock key={s.id} stop={s} />
                      ))}
                    </div>
                  )}

                  <div className="rounded-lg bg-background ring-1 ring-border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <Heart className="h-3.5 w-3.5" />
                      {t("recipientsForDay")}
                      <span className="ml-auto text-foreground tabular-nums">{previous.recipients.length}</span>
                    </div>
                    {previous.recipients.length === 0 ? (
                      <EmptyLine text={t("noRecipients")} />
                    ) : (
                      <RecipientList recipients={previous.recipients} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {latest && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {t("latestUpdate")}
              </h2>
              <Card>
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div className="text-sm font-semibold">
                      {latest.location ?? "—"}
                      <span className="text-muted-foreground font-normal ml-2">· {fmt(latest.date)}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground tabular-nums">{formatAppDateTime(new Date(latest.created_at))}</div>
                  </div>
                  <RenderedMessage body={latest.body} className="text-foreground/90 text-sm" />
                  <div className="text-xs text-muted-foreground">— {latest.author_name}</div>
                </CardContent>
              </Card>
            </section>
          )}
        </>
      )}
    </>
  );

  const heading = (
    <div className="flex items-baseline gap-2 flex-wrap">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("dashboard")}</h1>
      <span className="text-xs text-muted-foreground">
        {ministryLabel(startYear)} · {t("ministryYear")}
      </span>
    </div>
  );

  if (useAuthShell) {
    return (
      <AppShell>
        <div className="max-w-4xl mx-auto w-full space-y-6 md:space-y-8">
          {heading}
          {content}
        </div>
      </AppShell>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b">

        <div className="max-w-4xl mx-auto h-14 flex items-center gap-3 px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="h-8 w-8 shrink-0 rounded-md bg-background ring-1 ring-border flex items-center justify-center overflow-hidden">
              <img src={logoUrl} alt="KRUH ŽIVLJENJA" className="h-7 w-7 object-contain" />
            </span>
            <span className="text-sm">{t("appName")}</span>
          </Link>
          <div className="flex-1" />
          <div className="flex gap-1 text-xs">
            <button onClick={() => setLang("sl")} className={`px-2 py-1 rounded ${lang === "sl" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>SL</button>
            <button onClick={() => setLang("en")} className={`px-2 py-1 rounded ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>EN</button>
          </div>
          {user ? (
            <Button asChild size="sm" variant="outline">
              <Link to="/planner"><LayoutDashboard className="h-4 w-4 mr-1" />{t("planner")}</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/login"><LogIn className="h-4 w-4 mr-1" />{t("signIn")}</Link>
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-5 md:py-8 space-y-6 md:space-y-8">
        {heading}
        {content}
      </main>


      {/* Scripture tagline relocated to footer — calm and out of the way */}
      <footer className="mt-8 border-t bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground/80 whitespace-pre-line leading-relaxed">
            {t("tagline")}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function StopBlock({ stop, prominent = false }: { stop: { id: string; location: string | null; driver: string | null; coordinator: string | null }; prominent?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`rounded-xl p-4 bg-white border border-slate-200/90 shadow-2xs space-y-3`}>
      <div className="flex items-center gap-2.5">
        <LocationLogo name={stop.location} size="md" />
        <span className="text-base font-bold text-slate-900">
          {stop.location ?? <span className="text-muted-foreground font-normal italic">—</span>}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <Field label={t("driver")} value={stop.driver} />
        <Field label={t("coordinator")} value={stop.coordinator} />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  const { t } = useI18n();
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={value ? "font-semibold text-foreground" : "text-muted-foreground italic"}>
        {value ?? t("unassigned")}
      </div>
    </div>
  );
}

function RecipientList({ recipients }: { recipients: PublicRecipient[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
      {recipients.map((r) => (
        <li key={r.id} className="py-1.5 text-sm border-b border-border/40 last:border-0 sm:[&:nth-last-child(2)]:border-0">
          <span className="font-medium">{r.name}</span>
          {r.size != null && <span className="text-muted-foreground ml-1.5 tabular-nums">[{r.size}]</span>}
        </li>
      ))}
    </ul>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground italic">{text}</p>;
}

function EmptyState({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
  );
}

function RecipientsButton({ recipients, label }: { recipients: PublicRecipient[]; label: string }) {
  const { t } = useI18n();
  const count = recipients.length;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={count === 0}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/15 font-medium transition-colors disabled:opacity-50 disabled:cursor-default"
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="tabular-nums">{count}</span>
          <span>{count === 1 ? t("recipient") : t("recipients")}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{t("recipientsForDay")}</DialogTitle>
          <p className="text-xs text-muted-foreground">{label}</p>
        </DialogHeader>
        {count === 0 ? (
          <EmptyLine text={t("noRecipients")} />
        ) : (
          <ul className="max-h-80 overflow-auto -mx-1 px-1">
            {recipients.map((r) => (
              <li key={r.id} className="py-2 text-sm border-b border-border/40 last:border-0">
                <span className="font-medium">{r.name}</span>
                {r.size != null && <span className="text-muted-foreground ml-1.5 tabular-nums">[{r.size}]</span>}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DateRow({
  row,
  fmt,
  wdLong,
}: {
  row: PublicScheduleRow;
  fmt: (s: string) => string;
  wdLong: (s: string) => string;
}) {
  const { t } = useI18n();
  return (
    <li className="py-4 px-3 space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-base font-semibold leading-tight">{wdLong(row.date)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{fmt(row.date)}</div>
        </div>
        <RecipientsButton recipients={row.recipients} label={`${wdLong(row.date)} ${fmt(row.date)}`} />
      </div>
      {row.stops.length === 0 ? (
        <EmptyLine text={t("noStops")} />
      ) : (
        <ul className="space-y-2">
          {row.stops.map((s) => (
            <li key={s.id} className="text-sm pl-3 border-l-2 border-slate-200 space-y-1">
              <div className="font-semibold flex items-center gap-2 text-slate-900">
                <LocationLogo name={s.location} size="sm" />
                <span>{s.location ?? "—"}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="uppercase tracking-wider">{t("driver")}:</span>{" "}
                <span className={s.driver ? "text-foreground font-medium normal-case tracking-normal" : "not-italic font-bold normal-case tracking-normal text-destructive"}>{s.driver ?? t("unassigned")}</span>
                <span className="mx-2 opacity-40">·</span>
                <span className="uppercase tracking-wider">{t("coordinator")}:</span>{" "}
                <span className={s.coordinator ? "text-foreground font-medium normal-case tracking-normal" : "not-italic font-bold normal-case tracking-normal text-destructive"}>{s.coordinator ?? t("unassigned")}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
