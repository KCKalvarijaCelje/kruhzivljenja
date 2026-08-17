import { createServerFn } from '@tanstack/react-start'
import { render as renderAsync } from '@react-email/render'
import * as React from 'react'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { template as driverTemplate } from './email-templates/driver-notification'
import { formatAppDate } from './tz'



const SITE_NAME = 'kruhzivljenja'
const SENDER_DOMAIN = 'notify.kruhzivljenja.kalvarija.si'
const FROM_DOMAIN = 'kruhzivljenja.kalvarija.si'

export type DriverNotificationType = 'assignment' | 'change' | 'reminder'

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
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Server configuration error')
  }
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Shared core: enqueue one driver notification for one stop.
// Returns a status string for logging by the caller.
export async function enqueueDriverNotificationForStop(
  stopId: string,
  type: DriverNotificationType,
): Promise<{ status: 'sent' | 'skipped'; reason?: string }> {
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
        : 'driver_reminder'

  const { data: tpl, error: tplErr } = await admin
    .from('email_templates')
    .select('subject, body, footer')
    .eq('template_key', key)
    .eq('language', 'sl')
    .maybeSingle()

  if (tplErr || !tpl) return { status: 'skipped', reason: 'template_missing' }

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
    app_name: brand?.app_name ?? 'KRUH ŽIVLJENJA',
  }

  const subject = substitute(tpl.subject, vars)
  const body = substitute(tpl.body, vars)
  const footer = tpl.footer ? substitute(tpl.footer, vars) : null
  const heading = subject

  // Idempotency: don't re-send same (stop, driver, type) within 24h for assignment/reminder
  if (type !== 'change') {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await admin
      .from('driver_notification_log')
      .select('id')
      .eq('schedule_stop_id', stopId)
      .eq('driver_person_id', s.driver_id)
      .eq('notification_type', type)
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()
    if (existing) return { status: 'skipped', reason: 'duplicate' }
  }

  const recipientEmail = s.driver.email
  const normalizedEmail = recipientEmail.toLowerCase()

  // Suppression check
  const { data: suppressed } = await admin
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressed) {
    await admin.from('driver_notification_log').insert({
      schedule_stop_id: stopId,
      driver_person_id: s.driver_id,
      notification_type: type,
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
      appName: brand?.app_name ?? 'KRUH ŽIVLJENJA',
      logoUrl: brand?.logo_url ?? null,
      headerImageUrl: brand?.header_image_url ?? null,
      primaryColor: brand?.primary_color ?? null,
      footerText: brand?.footer_text ?? null,
    },
  })
  const html = await renderAsync(element)
  const text = await renderAsync(element, { plainText: true })

  const messageId = crypto.randomUUID()

  // Log to global email_send_log
  await admin.from('email_send_log').insert({
    message_id: messageId,
    template_name: `driver-${type}`,
    recipient_email: recipientEmail,
    status: 'pending',
  })

  const { error: enqueueErr } = await admin.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: recipientEmail,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: 'transactional',
      label: `driver-${type}`,
      idempotency_key: `driver-${type}-${stopId}-${s.driver_id}-${Date.now()}`,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  })

  if (enqueueErr) {
    await admin.from('driver_notification_log').insert({
      schedule_stop_id: stopId,
      driver_person_id: s.driver_id,
      notification_type: type,
      recipient_email: recipientEmail,
      status: 'failed',
      error_message: enqueueErr.message,
      message_id: messageId,
    })
    return { status: 'skipped', reason: 'enqueue_failed' }
  }

  await admin.from('driver_notification_log').insert({
    schedule_stop_id: stopId,
    driver_person_id: s.driver_id,
    notification_type: type,
    recipient_email: recipientEmail,
    // Enqueue success ≠ delivery. Use 'queued' here; the dispatcher will
    // append 'sent' (handed to provider) to email_send_log, which the admin
    // dashboard correlates by message_id.
    status: 'queued',
    message_id: messageId,
  })

  return { status: 'sent' }
}

export const sendDriverNotification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { stopIds: string[]; type: DriverNotificationType }) => input,
  )
  .handler(async ({ data }) => {
    const results: Array<{ stopId: string; status: string; reason?: string }> =
      []
    for (const stopId of data.stopIds) {
      try {
        const r = await enqueueDriverNotificationForStop(stopId, data.type)
        results.push({ stopId, ...r })
      } catch (e) {
        results.push({
          stopId,
          status: 'skipped',
          reason: e instanceof Error ? e.message : 'unknown',
        })
      }
    }
    return { results }
  })
