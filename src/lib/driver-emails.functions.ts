import { createServerFn } from '@tanstack/react-start'
import { render as renderAsync } from '@react-email/render'
import * as React from 'react'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { template as driverTemplate } from './email-templates/driver-notification'
import { formatAppDate } from './tz'
import { sendResendEmail } from './resend'
import { TEMPLATE_DEFAULTS } from './email-templates/defaults'

const SITE_NAME = 'Kruh Življenja'
const FROM_EMAIL = 'Kruh Življenja <kruhzivljenja@kalvarija.si>'

export type DriverNotificationType = 'assignment' | 'change' | 'reminder' | 'reminder_today'

type StopRow = {
  id: string
  driver_id: string | null
  schedule_dates: { date: string } | null
  locations: { name: string } | null
  driver: { full_name: string; email: string | null } | null
  coordinator: { full_name: string } | null
}

function substitute(template: string, vars: Record<string, string | undefined>): string {
  // Conditional block: {{#key}}text with {{key}}{{/key}}
  let out = template.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, key, body) => {
    return vars[key] ? body : ''
  })
  // Simple replacement: {{key}}
  out = out.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? '')
  return out
}

function formatDateSL(dateStr: string): string {
  return formatAppDate(dateStr)
}

function getAdmin() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    import.meta.env?.VITE_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error: Supabase service key missing')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

/**
 * Dispatches one driver notification for one stop directly via Resend.
 * Records the result immediately into driver_notification_log and email_send_log.
 */
export async function sendDriverNotificationForStop(
  stopId: string,
  type: DriverNotificationType,
  options?: { force?: boolean },
): Promise<{ status: 'sent' | 'skipped' | 'failed'; reason?: string; messageId?: string }> {
  const admin = getAdmin()

  const { data: stop, error: stopErr } = await admin
    .from('schedule_stops')
    .select(
      'id, driver_id, schedule_dates(date), locations(name), driver:people!schedule_stops_driver_id_fkey(full_name,email), coordinator:people!schedule_stops_coordinator_id_fkey(full_name)',
    )
    .eq('id', stopId)
    .maybeSingle()

  if (stopErr || !stop) return { status: 'skipped', reason: 'stop_not_found' }
  const s = stop as unknown as StopRow
  if (!s.driver_id || !s.driver) return { status: 'skipped', reason: 'no_driver' }
  if (!s.driver.email) return { status: 'skipped', reason: 'no_email' }
  if (!s.schedule_dates || !s.locations) return { status: 'skipped', reason: 'missing_data' }

  const key =
    type === 'assignment'
      ? 'driver_assignment'
      : type === 'change'
        ? 'driver_change'
        : type === 'reminder_today'
          ? 'driver_reminder_today'
          : 'driver_reminder'

  // Attempt to load custom template from DB, fall back to built-in defaults
  let tpl: { subject: string; body: string; footer: string | null } | null = null
  const { data: dbTpl } = await admin
    .from('email_templates')
    .select('subject, body, footer')
    .eq('template_key', key)
    .eq('language', 'sl')
    .maybeSingle()

  if (dbTpl) {
    tpl = dbTpl
  } else if (TEMPLATE_DEFAULTS[key]?.sl) {
    tpl = TEMPLATE_DEFAULTS[key].sl
  } else {
    // Fallback to driver_reminder default if driver_reminder_today is not yet in DB
    tpl = TEMPLATE_DEFAULTS['driver_reminder'].sl
  }

  const { data: brand } = await admin
    .from('email_brand_settings')
    .select('app_name, logo_url, header_image_url, primary_color, footer_text')
    .eq('id', 1)
    .maybeSingle()

  const vars: Record<string, string | undefined> = {
    driver_name: s.driver.full_name,
    date: formatDateSL(s.schedule_dates.date),
    location: s.locations.name,
    location_name: s.locations.name,
    coordinator: s.coordinator?.full_name,
    coordinator_name: s.coordinator?.full_name,
    person_name: s.driver.full_name,
    app_name: brand?.app_name ?? SITE_NAME,
  }

  const subject = substitute(tpl.subject, vars)
  const body = substitute(tpl.body, vars)
  const footer = tpl.footer ? substitute(tpl.footer, vars) : null
  const heading = subject

  // Idempotency: don't re-send same notification type to the same driver for this stop
  if (type !== 'change' && !options?.force) {
    const hours = type === 'reminder_today' ? 12 : 24
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    const { data: existing } = await admin
      .from('driver_notification_log')
      .select('id')
      .eq('schedule_stop_id', stopId)
      .eq('notification_type', type === 'reminder_today' ? 'reminder' : type)
      .eq('status', 'sent')
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()

    if (existing) {
      return { status: 'skipped', reason: 'duplicate' }
    }
  }

  const recipientEmail = s.driver.email.trim()
  const normalizedEmail = recipientEmail.toLowerCase()

  // Suppression check
  const { data: suppressed } = await admin
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressed) {
    const dbNotifType = type === 'reminder_today' ? 'reminder' : type
    await admin.from('driver_notification_log').insert({
      schedule_stop_id: stopId,
      driver_person_id: s.driver_id,
      notification_type: dbNotifType,
      recipient_email: recipientEmail,
      status: 'suppressed',
    })
    return { status: 'skipped', reason: 'suppressed' }
  }

  // Ensure unsubscribe token
  let unsubscribeToken: string
  const { data: existingTok } = await admin
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existingTok && !existingTok.used_at) {
    unsubscribeToken = existingTok.token
  } else {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    unsubscribeToken = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    await admin
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )
    const { data: stored } = await admin
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()
    if (stored?.token) unsubscribeToken = stored.token
  }

  // Render React Email
  const element = React.createElement(driverTemplate.component, {
    heading,
    body,
    footer,
    preview: subject,
    brand: {
      appName: brand?.app_name ?? SITE_NAME,
      logoUrl: brand?.logo_url ?? null,
      headerImageUrl: brand?.header_image_url ?? null,
      primaryColor: brand?.primary_color ?? '#a82020',
      footerText: brand?.footer_text ?? null,
    },
  })
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })

  const messageId = crypto.randomUUID()

  // Dispatch directly via Resend
  const resendResult = await sendResendEmail({
    to: recipientEmail,
    from: FROM_EMAIL,
    subject,
    html,
    text,
    headers: {
      'List-Unsubscribe': `<https://kruhzivljenja.kalvarija.si/email/unsubscribe?token=${unsubscribeToken}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  const sendStatus = resendResult.success ? 'sent' : 'failed'
  const dbNotifType = type === 'reminder_today' ? 'reminder' : type

  // Log to email_send_log
  await admin.from('email_send_log').insert({
    message_id: messageId,
    template_name: `driver-${type}`,
    recipient_email: recipientEmail,
    status: sendStatus,
    provider_message_id: resendResult.id ?? null,
    provider_response: resendResult,
    error_message: resendResult.error ?? null,
  })

  // Log to driver_notification_log
  await admin.from('driver_notification_log').insert({
    schedule_stop_id: stopId,
    driver_person_id: s.driver_id,
    notification_type: dbNotifType,
    recipient_email: recipientEmail,
    status: sendStatus,
    message_id: messageId,
    error_message: resendResult.error ?? null,
    sent_at: resendResult.success ? new Date().toISOString() : null,
  })

  if (!resendResult.success) {
    return {
      status: 'failed',
      reason: resendResult.error,
      messageId,
    }
  }

  return {
    status: 'sent',
    messageId,
  }
}

// Backwards-compatible alias for existing imports
export const enqueueDriverNotificationForStop = sendDriverNotificationForStop

export const sendDriverNotification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { stopIds: string[]; type: DriverNotificationType }) => input,
  )
  .handler(async ({ data }) => {
    const results: Array<{ stopId: string; status: string; reason?: string; messageId?: string }> =
      []
    for (const stopId of data.stopIds) {
      try {
        const r = await sendDriverNotificationForStop(stopId, data.type)
        results.push({ stopId, ...r })
      } catch (e) {
        results.push({
          stopId,
          status: 'failed',
          reason: e instanceof Error ? e.message : 'unknown',
        })
      }
    }
    return { results }
  })
