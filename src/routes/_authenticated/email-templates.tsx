import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/use-auth";
import {
  listEmailTemplatesAdmin,
  upsertEmailTemplateAdmin,
  resetEmailTemplateAdmin,
  getEmailBrandSettings,
  upsertEmailBrandSettings,
  previewTemplateWithSample,
} from "@/lib/email-admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldAlert,
  Loader2,
  Mail,
  Save,
  RotateCcw,
  Image as ImageIcon,
  Eye,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/email-templates")({
  component: EmailTemplatesPage,
});

type TemplateRow = {
  id: string | null;
  template_key: string;
  language: "sl" | "en";
  subject: string;
  body: string;
  footer: string | null;
  placeholders: string[];
  description: string | null;
  updated_at: string | null;
  missing?: boolean;
};

type Brand = {
  id: number;
  app_name: string;
  logo_url: string | null;
  header_image_url: string | null;
  primary_color: string;
  footer_text: string | null;
  updated_at: string | null;
};

const TEMPLATE_META: Record<string, { titleKey: string; subtitleKey: string }> = {
  driver_assignment: { titleKey: "etAssignment", subtitleKey: "etAssignmentSub" },
  driver_change: { titleKey: "etChange", subtitleKey: "etChangeSub" },
  driver_reminder: { titleKey: "etReminder", subtitleKey: "etReminderSub" },
  test_email: { titleKey: "etTest", subtitleKey: "etTestSub" },
};

const KEY_ORDER = ["driver_assignment", "driver_change", "driver_reminder", "test_email"];

function EmailTemplatesPage() {
  const { t } = useI18n();
  const { isAdmin } = useAuth();
  const listFn = useServerFn(listEmailTemplatesAdmin);
  const saveFn = useServerFn(upsertEmailTemplateAdmin);
  const resetFn = useServerFn(resetEmailTemplateAdmin);
  const brandGetFn = useServerFn(getEmailBrandSettings);
  const brandSaveFn = useServerFn(upsertEmailBrandSettings);
  const previewFn = useServerFn(previewTemplateWithSample);

  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>("driver_assignment");
  const [language, setLanguage] = useState<"sl" | "en">("sl");
  const [draft, setDraft] = useState<{ subject: string; body: string; footer: string }>(
    { subject: "", body: "", footer: "" },
  );
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [previewSubject, setPreviewSubject] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const subjectRef = useRef<HTMLInputElement | null>(null);
  const footerRef = useRef<HTMLTextAreaElement | null>(null);
  const [focusField, setFocusField] = useState<"subject" | "body" | "footer">("body");

  const load = async () => {
    setLoading(true);
    try {
      const [list, b] = await Promise.all([listFn(), brandGetFn()]);
      setRows(list as TemplateRow[]);
      setBrand(b as Brand);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const current = useMemo(
    () => rows.find((r) => r.template_key === selectedKey && r.language === language),
    [rows, selectedKey, language],
  );

  useEffect(() => {
    if (current) {
      setDraft({
        subject: current.subject,
        body: current.body,
        footer: current.footer ?? "",
      });
    }
  }, [current?.template_key, current?.language, current?.updated_at]);

  const runPreview = async () => {
    if (!current) return;
    try {
      const res = (await previewFn({
        data: {
          template_key: selectedKey,
          language,
          draft: {
            subject: draft.subject,
            body: draft.body,
            footer: draft.footer.trim() ? draft.footer : null,
          },
        },
      })) as { subject: string; html: string };
      setPreviewHtml(res.html);
      setPreviewSubject(res.subject);
    } catch (e: any) {
      toast.error(e?.message ?? "Preview failed");
    }
  };

  useEffect(() => {
    if (tab === "preview") runPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const insertPlaceholder = (ph: string) => {
    const token = `{{${ph}}}`;
    const target =
      focusField === "subject"
        ? subjectRef.current
        : focusField === "footer"
          ? footerRef.current
          : bodyRef.current;
    if (!target) return;
    const start = target.selectionStart ?? target.value.length;
    const end = target.selectionEnd ?? target.value.length;
    const v = target.value;
    const next = v.slice(0, start) + token + v.slice(end);
    setDraft((d) => ({ ...d, [focusField]: next }));
    requestAnimationFrame(() => {
      target.focus();
      const pos = start + token.length;
      target.setSelectionRange(pos, pos);
    });
  };

  const onSave = async () => {
    if (!current) return;
    setSaving(true);
    try {
      await saveFn({
        data: {
          template_key: selectedKey,
          language,
          subject: draft.subject,
          body: draft.body,
          footer: draft.footer.trim() ? draft.footer : null,
        },
      });
      toast.success(t("etSaved"));
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!current) return;
    if (!confirm(t("etConfirmReset"))) return;
    try {
      await resetFn({ data: { template_key: selectedKey, language } });
      toast.success(t("etReset"));
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Reset failed");
    }
  };

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

  const placeholders = current?.placeholders?.length
    ? current.placeholders
    : ["person_name", "driver_name", "date", "location", "app_name"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="h-7 w-7 text-primary" />
          {t("etTitle")}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[260px,1fr] gap-4">
          {/* Left list */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t("etTemplates")}</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ul className="space-y-1">
                {KEY_ORDER.map((k) => {
                  const meta = TEMPLATE_META[k];
                  const slRow = rows.find((r) => r.template_key === k && r.language === "sl");
                  const enRow = rows.find((r) => r.template_key === k && r.language === "en");
                  const slMissing = slRow?.missing;
                  const enMissing = enRow?.missing;
                  return (
                    <li key={k}>
                      <button
                        type="button"
                        onClick={() => setSelectedKey(k)}
                        className={`w-full text-left rounded-md px-3 py-2 transition-colors ${
                          selectedKey === k
                            ? "bg-muted font-medium"
                            : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="text-sm">{t(meta.titleKey as any)}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {t(meta.subtitleKey as any)}
                        </div>
                        <div className="flex gap-1 mt-1">
                          <Badge
                            variant={slMissing ? "outline" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            SL {slMissing ? "·" : "✓"}
                          </Badge>
                          <Badge
                            variant={enMissing ? "outline" : "secondary"}
                            className="text-[10px] px-1.5 py-0"
                          >
                            EN {enMissing ? "·" : "✓"}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Right editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base">
                    {t(TEMPLATE_META[selectedKey].titleKey as any)}
                    {current?.missing && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {t("etUsingDefault")}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={language === "sl" ? "default" : "outline"}
                      onClick={() => setLanguage("sl")}
                    >
                      SL
                    </Button>
                    <Button
                      size="sm"
                      variant={language === "en" ? "default" : "outline"}
                      onClick={() => setLanguage("en")}
                    >
                      EN
                    </Button>
                  </div>
                </div>
                {current?.description && (
                  <p className="text-xs text-muted-foreground">{current.description}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
                  <TabsList>
                    <TabsTrigger value="edit">
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      {t("etEdit")}
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {t("etPreview")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4 mt-4">
                    <div className="grid lg:grid-cols-[1fr,200px] gap-4">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">{t("etSubject")}</Label>
                          <Input
                            ref={subjectRef}
                            value={draft.subject}
                            onFocus={() => setFocusField("subject")}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, subject: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("etBody")}</Label>
                          <Textarea
                            ref={bodyRef}
                            rows={12}
                            value={draft.body}
                            onFocus={() => setFocusField("body")}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, body: e.target.value }))
                            }
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("etFooter")}</Label>
                          <Textarea
                            ref={footerRef}
                            rows={3}
                            value={draft.footer}
                            onFocus={() => setFocusField("footer")}
                            onChange={(e) =>
                              setDraft((d) => ({ ...d, footer: e.target.value }))
                            }
                            placeholder={t("etFooterPlaceholder")}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">{t("etPlaceholders")}</Label>
                        <p className="text-[11px] text-muted-foreground">
                          {t("etPlaceholdersHelp")}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {placeholders.map((ph) => (
                            <button
                              key={ph}
                              type="button"
                              onClick={() => insertPlaceholder(ph)}
                              className="text-[11px] font-mono px-2 py-1 rounded border bg-muted/40 hover:bg-muted"
                            >
                              {`{{${ph}}}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={onSave} disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        {t("etSave")}
                      </Button>
                      <Button variant="outline" onClick={onReset}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t("etResetDefault")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setTab("preview");
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("etPreview")}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="mt-4 space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("etSubject")}: </span>
                      <span className="font-medium">{previewSubject || "—"}</span>
                    </div>
                    <div className="rounded-md border overflow-hidden bg-white">
                      {previewHtml ? (
                        <iframe
                          title="preview"
                          srcDoc={previewHtml}
                          className="w-full h-[520px] bg-white"
                          sandbox=""
                        />
                      ) : (
                        <div className="p-6 text-sm text-muted-foreground">…</div>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={runPreview}>
                      <Eye className="h-4 w-4 mr-1" />
                      {t("etRefreshPreview")}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <BrandCard brand={brand} onSaved={load} brandSaveFn={brandSaveFn} t={t} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t("etProviderManaged")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>{t("etProviderManagedDesc")}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandCard({
  brand,
  onSaved,
  brandSaveFn,
  t,
}: {
  brand: Brand | null;
  onSaved: () => void;
  brandSaveFn: ReturnType<typeof useServerFn<typeof upsertEmailBrandSettings>>;
  t: (k: any) => string;
}) {
  const [b, setB] = useState<Brand | null>(brand);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    setB(brand);
  }, [brand?.updated_at, brand?.app_name]);
  if (!b) return null;
  const save = async () => {
    setSaving(true);
    try {
      await brandSaveFn({
        data: {
          app_name: b.app_name,
          logo_url: b.logo_url,
          header_image_url: b.header_image_url,
          primary_color: b.primary_color,
          footer_text: b.footer_text,
        },
      });
      toast.success(t("etBrandSaved"));
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          {t("etBrand")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t("etBrandHelp")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">{t("etAppName")}</Label>
            <Input value={b.app_name} onChange={(e) => setB({ ...b, app_name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">{t("etPrimaryColor")}</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={b.primary_color}
                onChange={(e) => setB({ ...b, primary_color: e.target.value })}
                placeholder="#0a0a0a"
              />
              <span
                className="h-9 w-9 rounded border shrink-0"
                style={{ backgroundColor: b.primary_color }}
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">{t("etLogoUrl")}</Label>
            <Input
              value={b.logo_url ?? ""}
              onChange={(e) => setB({ ...b, logo_url: e.target.value || null })}
              placeholder="https://…/logo.png"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">{t("etHeaderUrl")}</Label>
            <Input
              value={b.header_image_url ?? ""}
              onChange={(e) => setB({ ...b, header_image_url: e.target.value || null })}
              placeholder="https://…/banner.jpg"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">{t("etGlobalFooter")}</Label>
            <Textarea
              rows={2}
              value={b.footer_text ?? ""}
              onChange={(e) => setB({ ...b, footer_text: e.target.value || null })}
              placeholder={t("etGlobalFooterPlaceholder")}
            />
          </div>
        </div>
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {t("etSaveBrand")}
        </Button>
      </CardContent>
    </Card>
  );
}
