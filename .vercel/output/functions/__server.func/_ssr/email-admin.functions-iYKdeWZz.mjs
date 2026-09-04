import { c as createServerRpc } from "./createServerRpc-BZmJhcEN.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { r as render } from "../_libs/react-email__render.mjs";
import { r as reactExports } from "../_libs/react.mjs";
import { r as requireSupabaseAuth, t as template, f as formatAppTime, a as formatAppDate, b as formatAppDateTime } from "./tz-CU05rO0J.mjs";
import { e as enqueueDriverNotificationForStop } from "./driver-emails.functions-CYCYga1W.mjs";
import { c as createServerFn } from "./server-Dm1gvL4M.mjs";
import "../_libs/seroval.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "node:stream";
import "./createMiddleware-BvN2ghIY.mjs";
import "../_libs/react-email__html.mjs";
import "../_libs/react-email__head.mjs";
import "../_libs/react-email__preview.mjs";
import "../_libs/react-email__body.mjs";
import "../_libs/react-email__container.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__img.mjs";
import "../_libs/react-email__heading.mjs";
import "../_libs/react-email__text.mjs";
import "./createSsrRpc-Bob-CuPr.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const TEMPLATE_DEFAULTS = {
  driver_assignment: {
    sl: {
      subject: "Nov razpored prevoza — {{date}}",
      body: `Pozdravljen/a {{driver_name}},

dodeljen/a si kot voznik/ica za prevzem hrane:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}

Hvala za tvojo pomoč!`,
      footer: "Lep pozdrav,\nKruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "Sent when a driver is newly assigned to a stop."
    },
    en: {
      subject: "New delivery assignment — {{date}}",
      body: `Hello {{driver_name}},

you have been assigned as the driver for a food pickup:

Date: {{date}}
Location: {{location}}
{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}

Thank you for your help!`,
      footer: "Best regards,\nKruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "Sent when a driver is newly assigned to a stop."
    }
  },
  driver_change: {
    sl: {
      subject: "Sprememba razporeda — {{date}}",
      body: `Pozdravljen/a {{driver_name}},

obveščamo te o spremembi na tvoji dodelitvi:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}

Če imaš vprašanja, se obrni na razdeljevalca.`,
      footer: "Lep pozdrav,\nKruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "Sent when an assignment is changed."
    },
    en: {
      subject: "Schedule change — {{date}}",
      body: `Hello {{driver_name}},

there is an update to your assignment:

Date: {{date}}
Location: {{location}}
{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}

If you have any questions, please contact the distributor.`,
      footer: "Best regards,\nKruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "Sent when an assignment is changed."
    }
  },
  driver_reminder: {
    sl: {
      subject: "Opomnik: jutri si na vrsti — {{date}}",
      body: `Pozdravljen/a {{driver_name}},

prijazno te opominjamo, da si jutri dodeljen/a za prevzem hrane:

Datum: {{date}}
Lokacija: {{location}}
{{#coordinator}}Razdeljevalec/ka: {{coordinator}}{{/coordinator}}

Hvala in lep dan!`,
      footer: "Kruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "24-hour reminder before a scheduled pickup."
    },
    en: {
      subject: "Reminder: you're on the schedule tomorrow — {{date}}",
      body: `Hello {{driver_name}},

friendly reminder that you are scheduled tomorrow for a food pickup:

Date: {{date}}
Location: {{location}}
{{#coordinator}}Distributor: {{coordinator}}{{/coordinator}}

Thank you and have a great day!`,
      footer: "Kruh življenja",
      placeholders: ["driver_name", "date", "location", "coordinator"],
      description: "24-hour reminder before a scheduled pickup."
    }
  },
  test_email: {
    sl: {
      subject: "Testno sporočilo · {{app_name}}",
      body: `Pozdravljen/a {{person_name}},

to je testno sporočilo poslano iz administratorske strani ob {{date}} {{time}}.
Če si ga prejel/a, pošiljatelj deluje pravilno.`,
      footer: "Lep pozdrav,\n{{app_name}}",
      placeholders: ["person_name", "date", "time", "app_name"],
      description: 'Sent by the Email Queue "Send test email" button.'
    },
    en: {
      subject: "Test message · {{app_name}}",
      body: `Hello {{person_name}},

this is a test message sent from the admin Email Queue at {{date}} {{time}}.
If you received it, the sender is working correctly.`,
      footer: "Best regards,\n{{app_name}}",
      placeholders: ["person_name", "date", "time", "app_name"],
      description: 'Sent by the Email Queue "Send test email" button.'
    }
  }
};
const SITE_NAME = "kruhzivljenja";
const SENDER_DOMAIN = "notify.kruhzivljenja.kalvarija.si";
const FROM_DOMAIN = "kruhzivljenja.kalvarija.si";
function getAdmin() {
  const url = "https://ptdvcobgplmngnhkjqag.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Server configuration error");
  return createClient(url, key);
}
async function assertAdmin(supabase, userId) {
  const {
    data,
    error
  } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error || !data) throw new Error("not authorized");
}
function substitute(tpl, vars) {
  let out = tpl.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, k, b) => vars[k] ? b : "");
  out = out.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? "");
  return out;
}
function formatDateSL(d) {
  return formatAppDate(d);
}
const getEmailAdminData_createServerFn_handler = createServerRpc({
  id: "82c0ee8c4890a637a8e70cfeedc1bc4807bd0ffec4d9b3e6978cbfb1d610bceb",
  name: "getEmailAdminData",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => getEmailAdminData.__executeServer(opts));
const getEmailAdminData = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(getEmailAdminData_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const limit = Math.min(Math.max(data.limit ?? 200, 1), 500);
  let q = admin.from("driver_notification_log").select("id, status, notification_type, recipient_email, error_message, message_id, sent_at, created_at, driver_person_id, schedule_stop_id").order("created_at", {
    ascending: false
  }).limit(limit);
  if (data.status) q = q.eq("status", data.status);
  if (data.type) q = q.eq("notification_type", data.type);
  if (data.fromDate) q = q.gte("created_at", data.fromDate);
  if (data.toDate) q = q.lte("created_at", data.toDate);
  const {
    data: rows,
    error
  } = await q;
  if (error) {
    console.warn("[driver_notification_log query]", error);
  }
  const driverIds = Array.from(new Set((rows ?? []).map((r) => r.driver_person_id).filter(Boolean)));
  const driversMap = /* @__PURE__ */ new Map();
  if (driverIds.length > 0) {
    try {
      const {
        data: peopleList
      } = await admin.from("people").select("id, full_name, email").in("id", driverIds);
      for (const p of peopleList ?? []) {
        driversMap.set(p.id, p);
      }
    } catch (err) {
      console.warn("Could not batch load people:", err);
    }
  }
  const stopIds = Array.from(new Set((rows ?? []).map((r) => r.schedule_stop_id).filter(Boolean)));
  const stopsMap = /* @__PURE__ */ new Map();
  if (stopIds.length > 0) {
    try {
      const {
        data: stopsList
      } = await admin.from("schedule_stops").select("id, location_id, schedule_date_id").in("id", stopIds);
      const locIds = Array.from(new Set((stopsList ?? []).map((s) => s.location_id).filter(Boolean)));
      const dateIds = Array.from(new Set((stopsList ?? []).map((s) => s.schedule_date_id).filter(Boolean)));
      const locMap = /* @__PURE__ */ new Map();
      if (locIds.length > 0) {
        const {
          data: locs
        } = await admin.from("locations").select("id, name").in("id", locIds);
        for (const l of locs ?? []) locMap.set(l.id, l.name);
      }
      const dateMap = /* @__PURE__ */ new Map();
      if (dateIds.length > 0) {
        const {
          data: dates
        } = await admin.from("schedule_dates").select("id, date").in("id", dateIds);
        for (const d of dates ?? []) dateMap.set(d.id, d.date);
      }
      for (const s of stopsList ?? []) {
        stopsMap.set(s.id, {
          locationName: s.location_id ? locMap.get(s.location_id) ?? null : null,
          scheduledDate: s.schedule_date_id ? dateMap.get(s.schedule_date_id) ?? null : null
        });
      }
    } catch (err) {
      console.warn("Could not batch load stops:", err);
    }
  }
  const ids = (rows ?? []).map((r) => r.message_id).filter(Boolean);
  let sendLogByMsg = /* @__PURE__ */ new Map();
  if (ids.length) {
    try {
      const {
        data: logs
      } = await admin.from("email_send_log").select("message_id, status, error_message, created_at, provider_message_id, provider_response").in("message_id", ids).order("created_at", {
        ascending: false
      });
      for (const l of logs ?? []) {
        const existing = sendLogByMsg.get(l.message_id);
        const isTerminal = (s) => s === "delivered" || s === "bounced" || s === "complained" || s === "suppressed" || s === "dlq";
        if (!existing) sendLogByMsg.set(l.message_id, l);
        else if (isTerminal(l.status) && !isTerminal(existing.status)) sendLogByMsg.set(l.message_id, l);
      }
    } catch (err) {
      console.warn("Could not batch load email_send_log:", err);
    }
  }
  const merged = (rows ?? []).map((r) => {
    const sl = r.message_id ? sendLogByMsg.get(r.message_id) : null;
    const driver = r.driver_person_id ? driversMap.get(r.driver_person_id) : null;
    const stopInfo = r.schedule_stop_id ? stopsMap.get(r.schedule_stop_id) : null;
    const finalStatus = sl?.status ?? r.status;
    return {
      id: r.id,
      notification_type: r.notification_type,
      recipient_email: r.recipient_email,
      driver_name: driver?.full_name ?? null,
      location_name: stopInfo?.locationName ?? null,
      scheduled_date: stopInfo?.scheduledDate ?? null,
      created_at: r.created_at,
      sent_at: r.sent_at,
      message_id: r.message_id,
      enqueue_status: r.status,
      delivery_status: sl?.status ?? null,
      delivery_error: sl?.error_message ?? null,
      enqueue_error: r.error_message,
      provider_message_id: sl?.provider_message_id ?? null,
      final_status: finalStatus
    };
  });
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const {
    data: summaryRows
  } = await admin.from("driver_notification_log").select("id, status, sent_at, message_id, created_at").gte("created_at", since);
  const sumIds = (summaryRows ?? []).map((r) => r.message_id).filter(Boolean);
  const sumLogMap = /* @__PURE__ */ new Map();
  if (sumIds.length) {
    const {
      data: sl
    } = await admin.from("email_send_log").select("message_id, status, created_at").in("message_id", sumIds).order("created_at", {
      ascending: false
    });
    const isTerminal = (s) => s === "delivered" || s === "bounced" || s === "complained" || s === "suppressed" || s === "dlq";
    for (const r of sl ?? []) {
      const existing = sumLogMap.get(r.message_id);
      if (!existing) sumLogMap.set(r.message_id, r.status);
      else if (isTerminal(r.status) && !isTerminal(existing)) sumLogMap.set(r.message_id, r.status);
    }
  }
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const summary = {
    pending: 0,
    sent: 0,
    // "handed to provider"
    sentToday: 0,
    delivered: 0,
    failed: 0,
    skipped: 0,
    suppressed: 0
  };
  for (const r of summaryRows ?? []) {
    const ds = r.message_id ? sumLogMap.get(r.message_id) : null;
    const s = ds ?? r.status;
    if (s === "sent") {
      summary.sent++;
      if ((r.sent_at ?? "").slice(0, 10) === todayStr) summary.sentToday++;
    } else if (s === "delivered") {
      summary.delivered++;
    } else if (s === "pending" || s === "queued") summary.pending++;
    else if (s === "failed" || s === "dlq" || s === "bounced" || s === "complained") summary.failed++;
    else if (s === "skipped") summary.skipped++;
    else if (s === "suppressed") summary.suppressed++;
  }
  const {
    data: lastSent
  } = await admin.from("email_send_log").select("created_at").eq("status", "sent").order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const {
    data: lastDomainFail
  } = await admin.from("email_send_log").select("created_at").ilike("error_message", "%domain_not_verified%").order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const senderDomainOk = !lastDomainFail ? true : !!lastSent && new Date(lastSent.created_at) > new Date(lastDomainFail.created_at);
  const {
    data: cron,
    error: cronErr
  } = await supabase.rpc("admin_get_cron_status");
  return {
    rows: merged,
    summary,
    senderDomainOk,
    cron: cronErr ? {
      jobs: [],
      runs: [],
      error: cronErr.message
    } : cron
  };
});
const triggerDriverNotification_createServerFn_handler = createServerRpc({
  id: "519033afadf2e4612e5370bce8e17adf8842c83aac1cb40203e34a76f74f15cc",
  name: "triggerDriverNotification",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => triggerDriverNotification.__executeServer(opts));
const triggerDriverNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(triggerDriverNotification_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  let stopIds = [];
  if (data.stopId) {
    stopIds = [data.stopId];
  } else if (data.dateId) {
    const {
      data: stops
    } = await admin.from("schedule_stops").select("id, driver_id").eq("schedule_date_id", data.dateId);
    stopIds = (stops ?? []).filter((s) => s.driver_id).map((s) => s.id);
  } else {
    throw new Error("stopId or dateId required");
  }
  const results = [];
  for (const sid of stopIds) {
    try {
      const r = await enqueueDriverNotificationForStop(sid, data.type);
      results.push({
        stopId: sid,
        ...r
      });
    } catch (e) {
      results.push({
        stopId: sid,
        status: "skipped",
        reason: e instanceof Error ? e.message : "unknown"
      });
    }
  }
  return {
    results
  };
});
const previewDriverEmail_createServerFn_handler = createServerRpc({
  id: "8b5d3c8314e8e50ea15bc9fb04051cd12668a9510788b10bb27900fedbe6d6f8",
  name: "previewDriverEmail",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => previewDriverEmail.__executeServer(opts));
const previewDriverEmail = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(previewDriverEmail_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const {
    data: stop
  } = await admin.from("schedule_stops").select("id, schedule_dates(date), locations(name), driver:people!schedule_stops_driver_id_fkey(full_name,email), coordinator:people!schedule_stops_coordinator_id_fkey(full_name)").eq("id", data.stopId).maybeSingle();
  if (!stop) throw new Error("stop not found");
  const key = data.type === "assignment" ? "driver_assignment" : data.type === "change" ? "driver_change" : "driver_reminder";
  const {
    data: tpl
  } = await admin.from("email_templates").select("subject, body, footer").eq("template_key", key).eq("language", "sl").maybeSingle();
  if (!tpl) throw new Error("template not found for " + key);
  const {
    data: brand
  } = await admin.from("email_brand_settings").select("app_name, logo_url, header_image_url, primary_color, footer_text").eq("id", 1).maybeSingle();
  const s = stop;
  const vars = {
    driver_name: s.driver?.full_name ?? "—",
    date: s.schedule_dates?.date ? formatDateSL(s.schedule_dates.date) : "—",
    location: s.locations?.name ?? "—",
    location_name: s.locations?.name ?? "—",
    coordinator: s.coordinator?.full_name,
    coordinator_name: s.coordinator?.full_name,
    person_name: s.driver?.full_name ?? "—",
    app_name: brand?.app_name ?? "KRUH ŽIVLJENJA"
  };
  const subject = substitute(tpl.subject, vars);
  const body = substitute(tpl.body, vars);
  const footer = tpl.footer ? substitute(tpl.footer, vars) : null;
  const html = await render(reactExports.createElement(template.component, {
    heading: subject,
    body,
    footer,
    preview: subject,
    brand: {
      appName: brand?.app_name ?? "KRUH ŽIVLJENJA",
      logoUrl: brand?.logo_url ?? null,
      headerImageUrl: brand?.header_image_url ?? null,
      primaryColor: brand?.primary_color ?? null,
      footerText: brand?.footer_text ?? null
    }
  }));
  return {
    subject,
    body,
    html,
    recipient: s.driver?.email ?? null,
    driver_name: s.driver?.full_name ?? null
  };
});
const sendTestEmailToSelf_createServerFn_handler = createServerRpc({
  id: "bd365cffad0b2b6203910bb6d844390cae85978de0a84bf49cb2d1afcf99761b",
  name: "sendTestEmailToSelf",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => sendTestEmailToSelf.__executeServer(opts));
const sendTestEmailToSelf = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(sendTestEmailToSelf_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const {
    data: prof
  } = await admin.from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  if (!prof?.email) throw new Error("no email on profile");
  const recipientEmail = prof.email;
  const normalizedEmail = recipientEmail.toLowerCase();
  let unsubscribeToken;
  const {
    data: existingTok
  } = await admin.from("email_unsubscribe_tokens").select("token, used_at").eq("email", normalizedEmail).maybeSingle();
  if (existingTok && !existingTok.used_at) {
    unsubscribeToken = existingTok.token;
  } else {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    unsubscribeToken = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    await admin.from("email_unsubscribe_tokens").upsert({
      token: unsubscribeToken,
      email: normalizedEmail
    }, {
      onConflict: "email",
      ignoreDuplicates: true
    });
    const {
      data: stored
    } = await admin.from("email_unsubscribe_tokens").select("token").eq("email", normalizedEmail).maybeSingle();
    if (stored?.token) unsubscribeToken = stored.token;
  }
  const {
    data: tpl
  } = await admin.from("email_templates").select("subject, body, footer").eq("template_key", "test_email").eq("language", "sl").maybeSingle();
  const {
    data: brand
  } = await admin.from("email_brand_settings").select("app_name, logo_url, header_image_url, primary_color, footer_text").eq("id", 1).maybeSingle();
  const now = /* @__PURE__ */ new Date();
  const vars = {
    person_name: prof.full_name ?? recipientEmail,
    date: formatAppDate(now),
    time: formatAppTime(now),
    app_name: brand?.app_name ?? "KRUH ŽIVLJENJA"
  };
  const subject = tpl ? substitute(tpl.subject, vars) : `Test · ${vars.app_name}`;
  const body = tpl ? substitute(tpl.body, vars) : `Test email sent at ${formatAppDateTime(now)} (Europe/Ljubljana).`;
  const footer = tpl?.footer ? substitute(tpl.footer, vars) : null;
  const brandProps = {
    appName: brand?.app_name ?? "KRUH ŽIVLJENJA",
    logoUrl: brand?.logo_url ?? null,
    headerImageUrl: brand?.header_image_url ?? null,
    primaryColor: brand?.primary_color ?? null,
    footerText: brand?.footer_text ?? null
  };
  const html = await render(reactExports.createElement(template.component, {
    heading: subject,
    body,
    footer,
    preview: subject,
    brand: brandProps
  }));
  const text = await render(reactExports.createElement(template.component, {
    heading: subject,
    body,
    footer,
    preview: subject,
    brand: brandProps
  }), {
    plainText: true
  });
  const messageId = crypto.randomUUID();
  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "driver-test",
    recipient_email: recipientEmail,
    status: "pending"
  });
  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || "re_Mi1g1iqx_NNsLKjGVFemiV13V32YXWAnX";
  {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          from: `Kruh Življenja <kruh@kalvarija.si>`,
          to: [recipientEmail],
          subject,
          html,
          text
        })
      });
      const resData = await resendRes.json();
      if (resendRes.ok) {
        await admin.from("email_send_log").update({
          status: "sent",
          provider_message_id: resData.id
        }).eq("message_id", messageId);
        return {
          ok: true,
          recipient: recipientEmail,
          message_id: messageId
        };
      }
    } catch (rErr) {
      console.warn("Resend direct test dispatch notice:", rErr);
    }
  }
  const {
    error
  } = await admin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "driver-test",
      idempotency_key: `driver-test-${userId}-${Date.now()}`,
      unsubscribe_token: unsubscribeToken,
      queued_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  return {
    ok: true,
    recipient: recipientEmail,
    message_id: messageId
  };
});
const getSendLogStatus_createServerFn_handler = createServerRpc({
  id: "03952d2e135664fc5783b13790783f65f966469b7f87a4c3beb2e1b0917c8e27",
  name: "getSendLogStatus",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => getSendLogStatus.__executeServer(opts));
const getSendLogStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(getSendLogStatus_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const {
    data: rows
  } = await admin.from("email_send_log").select("status, error_message, provider_message_id, created_at").eq("message_id", data.messageId).order("created_at", {
    ascending: false
  }).limit(1);
  return rows?.[0] ?? null;
});
const listUpcomingAssignedStops_createServerFn_handler = createServerRpc({
  id: "d0cd04d307559cf8107c653f180c8e630f051cfab024833e3de9755be96e439a",
  name: "listUpcomingAssignedStops",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => listUpcomingAssignedStops.__executeServer(opts));
const listUpcomingAssignedStops = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listUpcomingAssignedStops_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const {
    data: dates,
    error: dateErr
  } = await admin.from("schedule_dates").select("id, date").gte("date", today).order("date", {
    ascending: true
  }).limit(120);
  if (dateErr) throw new Error(dateErr.message);
  const dateIds = (dates ?? []).map((d) => d.id);
  if (!dateIds.length) return [];
  const dateById = new Map((dates ?? []).map((d) => [d.id, d.date]));
  const {
    data: stops,
    error
  } = await admin.from("schedule_stops").select("id, schedule_date_id, locations(name), driver:people!schedule_stops_driver_id_fkey(full_name, email)").in("schedule_date_id", dateIds).not("driver_id", "is", null).limit(80);
  if (error) throw new Error(error.message);
  return (stops ?? []).map((r) => ({
    id: r.id,
    date: dateById.get(r.schedule_date_id),
    location: r.locations?.name,
    driver_name: r.driver?.full_name,
    driver_email: r.driver?.email
  })).filter((r) => !!r.date).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
});
const EDITABLE_KEYS = ["driver_assignment", "driver_change", "driver_reminder", "test_email"];
const LANGS = ["sl", "en"];
function isEditableKey(k) {
  return EDITABLE_KEYS.includes(k);
}
const listEmailTemplatesAdmin_createServerFn_handler = createServerRpc({
  id: "c2aa2934fe316a7e7524d6a635964dc6e643f2e93e3e504fd7f47985844de9ec",
  name: "listEmailTemplatesAdmin",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => listEmailTemplatesAdmin.__executeServer(opts));
const listEmailTemplatesAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listEmailTemplatesAdmin_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const {
    data,
    error
  } = await admin.from("email_templates").select("id, template_key, language, subject, body, footer, placeholders, description, updated_at, updated_by").in("template_key", EDITABLE_KEYS);
  if (error) throw new Error(error.message);
  const byKey = /* @__PURE__ */ new Map();
  for (const r of data ?? []) byKey.set(`${r.template_key}:${r.language}`, r);
  const rows = [];
  for (const k of EDITABLE_KEYS) {
    for (const l of LANGS) {
      const found = byKey.get(`${k}:${l}`);
      const def = TEMPLATE_DEFAULTS[k][l];
      rows.push(found ?? {
        id: null,
        template_key: k,
        language: l,
        subject: def.subject,
        body: def.body,
        footer: def.footer,
        placeholders: def.placeholders,
        description: def.description,
        updated_at: null,
        updated_by: null,
        missing: true
      });
    }
  }
  return rows;
});
const upsertEmailTemplateAdmin_createServerFn_handler = createServerRpc({
  id: "905a7fa2bcbb08cd1f889b08a1804e7a129911ab37e73a75461e30dbea92f71b",
  name: "upsertEmailTemplateAdmin",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => upsertEmailTemplateAdmin.__executeServer(opts));
const upsertEmailTemplateAdmin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(upsertEmailTemplateAdmin_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  if (!isEditableKey(data.template_key)) throw new Error("invalid template_key");
  if (!LANGS.includes(data.language)) throw new Error("invalid language");
  if (!data.subject?.trim() || !data.body?.trim()) throw new Error("subject and body are required");
  const admin = getAdmin();
  const def = TEMPLATE_DEFAULTS[data.template_key][data.language];
  const {
    error
  } = await admin.from("email_templates").upsert({
    template_key: data.template_key,
    language: data.language,
    subject: data.subject,
    body: data.body,
    footer: data.footer,
    placeholders: def.placeholders,
    description: def.description,
    updated_by: userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "template_key,language"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const resetEmailTemplateAdmin_createServerFn_handler = createServerRpc({
  id: "4bd5fc2d4c66cf9d4831cc70f718c6c060f572f9f23499347ae9202696c6a619",
  name: "resetEmailTemplateAdmin",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => resetEmailTemplateAdmin.__executeServer(opts));
const resetEmailTemplateAdmin = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(resetEmailTemplateAdmin_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  if (!isEditableKey(data.template_key)) throw new Error("invalid template_key");
  if (!LANGS.includes(data.language)) throw new Error("invalid language");
  const admin = getAdmin();
  const def = TEMPLATE_DEFAULTS[data.template_key][data.language];
  const {
    error
  } = await admin.from("email_templates").upsert({
    template_key: data.template_key,
    language: data.language,
    subject: def.subject,
    body: def.body,
    footer: def.footer,
    placeholders: def.placeholders,
    description: def.description,
    updated_by: userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "template_key,language"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getEmailBrandSettings_createServerFn_handler = createServerRpc({
  id: "811d39a3377610a6245710ecb21a2b124447d8bf1de2bf6a07b6d06fe620270e",
  name: "getEmailBrandSettings",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => getEmailBrandSettings.__executeServer(opts));
const getEmailBrandSettings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getEmailBrandSettings_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  const admin = getAdmin();
  const {
    data,
    error
  } = await admin.from("email_brand_settings").select("id, app_name, logo_url, header_image_url, primary_color, footer_text, updated_at").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? {
    id: 1,
    app_name: "KRUH ŽIVLJENJA",
    logo_url: null,
    header_image_url: null,
    primary_color: "#0a0a0a",
    footer_text: null,
    updated_at: null
  };
});
const upsertEmailBrandSettings_createServerFn_handler = createServerRpc({
  id: "e639113f3ab53b872c611c31ccf27f25080233f151f23d303e7b389893d6bedc",
  name: "upsertEmailBrandSettings",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => upsertEmailBrandSettings.__executeServer(opts));
const upsertEmailBrandSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(upsertEmailBrandSettings_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  if (!data.app_name?.trim()) throw new Error("app_name required");
  const httpsOnly = (u) => u && u.trim() ? /^https:\/\//i.test(u.trim()) ? u.trim() : null : null;
  const admin = getAdmin();
  const {
    error
  } = await admin.from("email_brand_settings").upsert({
    id: 1,
    app_name: data.app_name.trim().slice(0, 120),
    logo_url: httpsOnly(data.logo_url),
    header_image_url: httpsOnly(data.header_image_url),
    primary_color: /^#[0-9a-fA-F]{6}$/.test(data.primary_color) ? data.primary_color : "#0a0a0a",
    footer_text: data.footer_text?.slice(0, 1e3) ?? null,
    updated_by: userId,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const previewTemplateWithSample_createServerFn_handler = createServerRpc({
  id: "05cc936511c0bd4b0347673bf1c590111844aa7b0d9959fd1d8227b1d22d0f24",
  name: "previewTemplateWithSample",
  filename: "src/lib/email-admin.functions.ts"
}, (opts) => previewTemplateWithSample.__executeServer(opts));
const previewTemplateWithSample = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(previewTemplateWithSample_createServerFn_handler, async ({
  context,
  data
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertAdmin(supabase, userId);
  if (!isEditableKey(data.template_key)) throw new Error("invalid template_key");
  const admin = getAdmin();
  let subjectTpl;
  let bodyTpl;
  let footerTpl;
  if (data.draft) {
    subjectTpl = data.draft.subject;
    bodyTpl = data.draft.body;
    footerTpl = data.draft.footer;
  } else {
    const {
      data: row
    } = await admin.from("email_templates").select("subject, body, footer").eq("template_key", data.template_key).eq("language", data.language).maybeSingle();
    const def = TEMPLATE_DEFAULTS[data.template_key][data.language];
    subjectTpl = row?.subject ?? def.subject;
    bodyTpl = row?.body ?? def.body;
    footerTpl = row?.footer ?? def.footer;
  }
  const {
    data: brand
  } = await admin.from("email_brand_settings").select("app_name, logo_url, header_image_url, primary_color, footer_text").eq("id", 1).maybeSingle();
  const sample = {
    person_name: "Janez Novak",
    driver_name: "Janez Novak",
    coordinator: "Ana Novak",
    coordinator_name: "Ana Novak",
    date: "15. 1. 2026",
    time: "09:30",
    location: "Mercator Celje",
    location_name: "Mercator Celje",
    recipient_summary: "3 gospodinjstva",
    app_name: brand?.app_name ?? "KRUH ŽIVLJENJA"
  };
  const subject = substitute(subjectTpl, sample);
  const body = substitute(bodyTpl, sample);
  const footer = footerTpl ? substitute(footerTpl, sample) : null;
  const html = await render(reactExports.createElement(template.component, {
    heading: subject,
    body,
    footer,
    preview: subject,
    brand: {
      appName: brand?.app_name ?? "KRUH ŽIVLJENJA",
      logoUrl: brand?.logo_url ?? null,
      headerImageUrl: brand?.header_image_url ?? null,
      primaryColor: brand?.primary_color ?? null,
      footerText: brand?.footer_text ?? null
    }
  }));
  return {
    subject,
    body,
    footer,
    html
  };
});
export {
  getEmailAdminData_createServerFn_handler,
  getEmailBrandSettings_createServerFn_handler,
  getSendLogStatus_createServerFn_handler,
  listEmailTemplatesAdmin_createServerFn_handler,
  listUpcomingAssignedStops_createServerFn_handler,
  previewDriverEmail_createServerFn_handler,
  previewTemplateWithSample_createServerFn_handler,
  resetEmailTemplateAdmin_createServerFn_handler,
  sendTestEmailToSelf_createServerFn_handler,
  triggerDriverNotification_createServerFn_handler,
  upsertEmailBrandSettings_createServerFn_handler,
  upsertEmailTemplateAdmin_createServerFn_handler
};
