import { c as createSsrRpc } from "./createSsrRpc-Bob-CuPr.mjs";
import { r as render } from "../_libs/react-email__render.mjs";
import { r as reactExports } from "../_libs/react.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as template, a as formatAppDate, r as requireSupabaseAuth } from "./tz-CU05rO0J.mjs";
import { c as createServerFn } from "./server-Dm1gvL4M.mjs";
const SITE_NAME = "kruhzivljenja";
const SENDER_DOMAIN = "notify.kruhzivljenja.kalvarija.si";
const FROM_DOMAIN = "kruhzivljenja.kalvarija.si";
function substitute(template2, vars) {
  let out = template2.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, key, body) => {
    return vars[key] ? body : "";
  });
  out = out.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? "");
  return out;
}
function formatDateSL(dateStr) {
  return formatAppDate(dateStr);
}
function getAdmin() {
  const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseServiceKey) {
    throw new Error("Server configuration error");
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
async function enqueueDriverNotificationForStop(stopId, type) {
  const admin = getAdmin();
  const {
    data: stop,
    error: stopErr
  } = await admin.from("schedule_stops").select("id, driver_id, schedule_dates(date), locations(name), driver:people!schedule_stops_driver_id_fkey(full_name,email), coordinator:people!schedule_stops_coordinator_id_fkey(full_name)").eq("id", stopId).maybeSingle();
  if (stopErr || !stop) return {
    status: "skipped",
    reason: "stop_not_found"
  };
  const s = stop;
  if (!s.driver_id || !s.driver) return {
    status: "skipped",
    reason: "no_driver"
  };
  if (!s.driver.email) return {
    status: "skipped",
    reason: "no_email"
  };
  if (!s.schedule_dates || !s.locations) return {
    status: "skipped",
    reason: "missing_data"
  };
  const key = type === "assignment" ? "driver_assignment" : type === "change" ? "driver_change" : "driver_reminder";
  const {
    data: tpl,
    error: tplErr
  } = await admin.from("email_templates").select("subject, body, footer").eq("template_key", key).eq("language", "sl").maybeSingle();
  if (tplErr || !tpl) return {
    status: "skipped",
    reason: "template_missing"
  };
  const {
    data: brand
  } = await admin.from("email_brand_settings").select("app_name, logo_url, header_image_url, primary_color, footer_text").eq("id", 1).maybeSingle();
  const vars = {
    driver_name: s.driver.full_name,
    date: formatDateSL(s.schedule_dates.date),
    location: s.locations.name,
    location_name: s.locations.name,
    coordinator: s.coordinator?.full_name,
    coordinator_name: s.coordinator?.full_name,
    person_name: s.driver.full_name,
    app_name: brand?.app_name ?? "KRUH ŽIVLJENJA"
  };
  const subject = substitute(tpl.subject, vars);
  const body = substitute(tpl.body, vars);
  const footer = tpl.footer ? substitute(tpl.footer, vars) : null;
  const heading = subject;
  if (type !== "change") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
    const {
      data: existing
    } = await admin.from("driver_notification_log").select("id").eq("schedule_stop_id", stopId).eq("driver_person_id", s.driver_id).eq("notification_type", type).gte("created_at", since).limit(1).maybeSingle();
    if (existing) return {
      status: "skipped",
      reason: "duplicate"
    };
  }
  const recipientEmail = s.driver.email;
  const normalizedEmail = recipientEmail.toLowerCase();
  const {
    data: suppressed
  } = await admin.from("suppressed_emails").select("id").eq("email", normalizedEmail).maybeSingle();
  if (suppressed) {
    await admin.from("driver_notification_log").insert({
      schedule_stop_id: stopId,
      driver_person_id: s.driver_id,
      notification_type: type,
      recipient_email: recipientEmail,
      status: "suppressed"
    });
    return {
      status: "skipped",
      reason: "suppressed"
    };
  }
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
  const element = reactExports.createElement(template.component, {
    heading,
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
  });
  const html = await render(element);
  const text = await render(element, {
    plainText: true
  });
  const messageId = crypto.randomUUID();
  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: `driver-${type}`,
    recipient_email: recipientEmail,
    status: "pending"
  });
  const {
    error: enqueueErr
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
      label: `driver-${type}`,
      idempotency_key: `driver-${type}-${stopId}-${s.driver_id}-${Date.now()}`,
      unsubscribe_token: unsubscribeToken,
      queued_at: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
  if (enqueueErr) {
    await admin.from("driver_notification_log").insert({
      schedule_stop_id: stopId,
      driver_person_id: s.driver_id,
      notification_type: type,
      recipient_email: recipientEmail,
      status: "failed",
      error_message: enqueueErr.message,
      message_id: messageId
    });
    return {
      status: "skipped",
      reason: "enqueue_failed"
    };
  }
  await admin.from("driver_notification_log").insert({
    schedule_stop_id: stopId,
    driver_person_id: s.driver_id,
    notification_type: type,
    recipient_email: recipientEmail,
    // Enqueue success ≠ delivery. Use 'queued' here; the dispatcher will
    // append 'sent' (handed to provider) to email_send_log, which the admin
    // dashboard correlates by message_id.
    status: "queued",
    message_id: messageId
  });
  return {
    status: "sent"
  };
}
const sendDriverNotification = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(createSsrRpc("e4a135a942897b0051bf7508c1e9957775ce151fe057d8690cd6dab2af214f55"));
export {
  enqueueDriverNotificationForStop as e,
  sendDriverNotification as s
};
