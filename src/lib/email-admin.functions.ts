import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { render as renderAsync } from '@react-email/render'
import * as React from 'react'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import {
  enqueueDriverNotificationForStop,
  sendDriverNotificationForStop,
  type DriverNotificationType,
} from './driver-emails.functions'
import { template as driverTemplate } from './email-templates/driver-notification'
import { formatAppDate, formatAppTime, formatAppDateTime } from './tz'
import { sendResendEmail } from './resend'
import { TEMPLATE_DEFAULTS, type TemplateLang } from './email-templates/defaults'


const SITE_NAME = 'kruhzivljenja'
const SENDER_DOMAIN = 'notify.kruhzivljenja.kalvarija.si'
const FROM_DOMAIN = 'kruhzivljenja.kalvarija.si'

function getAdmin() {
  const url = import.meta.env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Server configuration error')
  return createClient(url, key)
}

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()
  if (error || !data) throw new Error('not authorized')
}

function substitute(tpl: string, vars: Record<string, string | undefined>): string {
  let out = tpl.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_, k, b) => (vars[k] ? b : ''))
  out = out.replace(/{{(\w+)}}/g, (_, k) => vars[k] ?? '')
  return out
}

function formatDateSL(d: string): string {
  return formatAppDate(d)
}


// ---------------------------------------------------------------------------
// Dashboard data
// ---------------------------------------------------------------------------
export const getEmailAdminData = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      status?: string | null
      type?: string | null
      fromDate?: string | null
      toDate?: string | null
      limit?: number
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    const limit = Math.min(Math.max(data.limit ?? 200, 1), 500)

    // Pull driver notification log without embedded schema joins
    let q = admin
      .from('driver_notification_log')
      .select(
        'id, status, notification_type, recipient_email, error_message, message_id, sent_at, created_at, driver_person_id, schedule_stop_id'
      )
      .order('created_at', { ascending: false })
      .limit(limit)

    if (data.status) q = q.eq('status', data.status)
    if (data.type) q = q.eq('notification_type', data.type)
    if (data.fromDate) q = q.gte('created_at', data.fromDate)
    if (data.toDate) q = q.lte('created_at', data.toDate)

    const { data: rows, error } = await q
    if (error) {
      console.warn('[driver_notification_log query]', error)
    }

    // Pull driver people in batch if any
    const driverIds = Array.from(new Set((rows ?? []).map((r: any) => r.driver_person_id).filter(Boolean)))
    const driversMap = new Map<string, any>()
    if (driverIds.length > 0) {
      try {
        const { data: peopleList } = await admin
          .from('people')
          .select('id, full_name, email')
          .in('id', driverIds)
        for (const p of peopleList ?? []) {
          driversMap.set(p.id, p)
        }
      } catch (err) {
        console.warn('Could not batch load people:', err)
      }
    }

    // Pull schedule stops in batch
    const stopIds = Array.from(new Set((rows ?? []).map((r: any) => r.schedule_stop_id).filter(Boolean)))
    const stopsMap = new Map<string, { locationName: string | null; scheduledDate: string | null }>()
    if (stopIds.length > 0) {
      try {
        const { data: stopsList } = await admin
          .from('schedule_stops')
          .select('id, location_id, schedule_date_id')
          .in('id', stopIds)

        const locIds = Array.from(new Set((stopsList ?? []).map((s: any) => s.location_id).filter(Boolean)))
        const dateIds = Array.from(new Set((stopsList ?? []).map((s: any) => s.schedule_date_id).filter(Boolean)))

        const locMap = new Map<string, string>()
        if (locIds.length > 0) {
          const { data: locs } = await admin.from('locations').select('id, name').in('id', locIds)
          for (const l of locs ?? []) locMap.set(l.id, l.name)
        }

        const dateMap = new Map<string, string>()
        if (dateIds.length > 0) {
          const { data: dates } = await admin.from('schedule_dates').select('id, date').in('id', dateIds)
          for (const d of dates ?? []) dateMap.set(d.id, d.date)
        }

        for (const s of stopsList ?? []) {
          stopsMap.set(s.id, {
            locationName: s.location_id ? (locMap.get(s.location_id) ?? null) : null,
            scheduledDate: s.schedule_date_id ? (dateMap.get(s.schedule_date_id) ?? null) : null,
          })
        }
      } catch (err) {
        console.warn('Could not batch load stops:', err)
      }
    }

    // Correlate with latest email_send_log status by message_id
    const ids = (rows ?? []).map((r: any) => r.message_id).filter(Boolean)
    let sendLogByMsg = new Map<string, any>()
    if (ids.length) {
      try {
        const { data: logs } = await admin
          .from('email_send_log')
          .select('message_id, status, error_message, created_at, provider_message_id, provider_response')
          .in('message_id', ids)
          .order('created_at', { ascending: false })
        for (const l of logs ?? []) {
          const existing = sendLogByMsg.get(l.message_id)
          const isTerminal = (s: string) =>
            s === 'delivered' || s === 'bounced' || s === 'complained' || s === 'suppressed' || s === 'dlq'
          if (!existing) sendLogByMsg.set(l.message_id, l)
          else if (isTerminal(l.status) && !isTerminal(existing.status)) sendLogByMsg.set(l.message_id, l)
        }
      } catch (err) {
        console.warn('Could not batch load email_send_log:', err)
      }
    }

    const merged = (rows ?? []).map((r: any) => {
      const sl = r.message_id ? sendLogByMsg.get(r.message_id) : null
      const driver = r.driver_person_id ? driversMap.get(r.driver_person_id) : null
      const stopInfo = r.schedule_stop_id ? stopsMap.get(r.schedule_stop_id) : null
      const finalStatus = sl?.status ?? r.status
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
        final_status: finalStatus,
      }
    })

    // Also include test and direct emails from email_send_log
    const { data: directLogs } = await admin
      .from('email_send_log')
      .select('id, message_id, template_name, recipient_email, status, error_message, created_at, provider_message_id, provider_response')
      .order('created_at', { ascending: false })
      .limit(limit)

    const testRows = (directLogs ?? [])
      .filter((dl: any) => dl.message_id && !ids.includes(dl.message_id))
      .map((dl: any) => ({
        id: dl.id,
        notification_type: dl.template_name ? dl.template_name.replace('driver-', '') : 'test',
        recipient_email: dl.recipient_email,
        driver_name: dl.recipient_email,
        location_name: 'Test pošiljatelja',
        scheduled_date: 'Admin test',
        created_at: dl.created_at,
        sent_at: dl.created_at,
        message_id: dl.message_id,
        enqueue_status: dl.status,
        delivery_status: dl.status,
        delivery_error: dl.error_message,
        enqueue_error: null,
        provider_message_id: dl.provider_message_id,
        final_status: dl.status,
      }))

    let allRows = [...merged, ...testRows]
    if (data.type) {
      allRows = allRows.filter((r) => r.notification_type === data.type)
    }
    if (data.status) {
      allRows = allRows.filter((r) => r.final_status === data.status)
    }
    allRows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    allRows = allRows.slice(0, limit)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: summaryRows } = await admin
      .from('driver_notification_log')
      .select('id, status, sent_at, message_id, created_at')
      .gte('created_at', since)

    const sumIds = (summaryRows ?? []).map((r: any) => r.message_id).filter(Boolean)
    const sumLogMap = new Map<string, string>()
    if (sumIds.length) {
      const { data: sl } = await admin
        .from('email_send_log')
        .select('message_id, status, created_at')
        .in('message_id', sumIds)
        .order('created_at', { ascending: false })
      const isTerminal = (s: string) =>
        s === 'delivered' || s === 'bounced' || s === 'complained' || s === 'suppressed' || s === 'dlq'
      for (const r of sl ?? []) {
        const existing = sumLogMap.get(r.message_id)
        if (!existing) sumLogMap.set(r.message_id, r.status)
        else if (isTerminal(r.status) && !isTerminal(existing)) sumLogMap.set(r.message_id, r.status)
      }
    }
    const todayStr = new Date().toISOString().slice(0, 10)
    const summary = {
      pending: 0,
      sent: 0, // "handed to provider"
      sentToday: 0,
      delivered: 0,
      failed: 0,
      skipped: 0,
      suppressed: 0,
    }
    for (const r of summaryRows ?? []) {
      const ds = r.message_id ? sumLogMap.get(r.message_id) : null
      const s = ds ?? r.status
      if (s === 'sent') {
        summary.sent++
        if ((r.sent_at ?? '').slice(0, 10) === todayStr) summary.sentToday++
      } else if (s === 'delivered') {
        summary.delivered++
      } else if (s === 'pending' || s === 'queued') summary.pending++
      else if (s === 'failed' || s === 'dlq' || s === 'bounced' || s === 'complained') summary.failed++
      else if (s === 'skipped') summary.skipped++
      else if (s === 'suppressed') summary.suppressed++
    }

    // Sender-domain "ok" heuristic: is the latest successful send newer than
    // the latest domain_not_verified failure? This prevents stale historical
    // failures from driving the live warning banner after the domain is fixed.
    const { data: lastSent } = await admin
      .from('email_send_log')
      .select('created_at')
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const { data: lastDomainFail } = await admin
      .from('email_send_log')
      .select('created_at')
      .ilike('error_message', '%domain_not_verified%')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const senderDomainOk = !lastDomainFail
      ? true
      : !!lastSent && new Date(lastSent.created_at) > new Date(lastDomainFail.created_at)

    // Cron status via SECURITY DEFINER RPC
    const { data: cron, error: cronErr } = await supabase.rpc('admin_get_cron_status')

    return {
      rows: allRows,
      summary,
      senderDomainOk,
      cron: cronErr ? { jobs: [], runs: [], error: cronErr.message } : cron,
    }
  })

// ---------------------------------------------------------------------------
// Manually trigger reminder for a single stop or whole date
// ---------------------------------------------------------------------------
export const triggerDriverNotification = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      stopId?: string
      dateId?: string
      type: DriverNotificationType
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    let stopIds: string[] = []
    if (data.stopId) {
      stopIds = [data.stopId]
    } else if (data.dateId) {
      const { data: stops } = await admin
        .from('schedule_stops')
        .select('id, driver_id')
        .eq('schedule_date_id', data.dateId)
      stopIds = (stops ?? []).filter((s: any) => s.driver_id).map((s: any) => s.id)
    } else {
      throw new Error('stopId or dateId required')
    }

    const results: Array<{ stopId: string; status: string; reason?: string }> = []
    for (const sid of stopIds) {
      try {
        const r = await enqueueDriverNotificationForStop(sid, data.type, { force: true })
        results.push({ stopId: sid, ...r })
      } catch (e) {
        results.push({
          stopId: sid,
          status: 'skipped',
          reason: e instanceof Error ? e.message : 'unknown',
        })
      }
    }
    return { results }
  })

// ---------------------------------------------------------------------------
// Preview rendered subject/body for a given stop + type
// ---------------------------------------------------------------------------
export const previewDriverEmail = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { stopId: string; type: DriverNotificationType }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    const { data: stop } = await admin
      .from('schedule_stops')
      .select(
        'id, schedule_dates(date), locations(name), driver:people!schedule_stops_driver_id_fkey(full_name,email), coordinator:people!schedule_stops_coordinator_id_fkey(full_name)',
      )
      .eq('id', data.stopId)
      .maybeSingle()
    if (!stop) throw new Error('stop not found')

    const key =
      data.type === 'assignment'
        ? 'driver_assignment'
        : data.type === 'change'
          ? 'driver_change'
          : data.type === 'reminder_today'
            ? 'driver_reminder_today'
            : 'driver_reminder'

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
      tpl = TEMPLATE_DEFAULTS['driver_reminder'].sl
    }

    const { data: brand } = await admin
      .from('email_brand_settings')
      .select('app_name, logo_url, header_image_url, primary_color, footer_text')
      .eq('id', 1)
      .maybeSingle()

    const s = stop as any
    const vars = {
      driver_name: s.driver?.full_name ?? '—',
      date: s.schedule_dates?.date ? formatDateSL(s.schedule_dates.date) : '—',
      location: s.locations?.name ?? '—',
      location_name: s.locations?.name ?? '—',
      coordinator: s.coordinator?.full_name,
      coordinator_name: s.coordinator?.full_name,
      person_name: s.driver?.full_name ?? '—',
      app_name: brand?.app_name ?? 'KRUH ŽIVLJENJA',
    }
    const subject = substitute(tpl.subject, vars)
    const body = substitute(tpl.body, vars)
    const footer = tpl.footer ? substitute(tpl.footer, vars) : null
    const html = await renderAsync(
      React.createElement(driverTemplate.component, {
        heading: subject,
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
      }),
    )
    return {
      subject,
      body,
      html,
      recipient: s.driver?.email ?? null,
      driver_name: s.driver?.full_name ?? null,
    }
  })

// ---------------------------------------------------------------------------
// Send a test email to the current admin user
// ---------------------------------------------------------------------------
export const sendTestEmailToSelf = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input?: { email?: string }) => input ?? {})
  .handler(async ({ context, data }) => {
    const { supabase, userId, claims } = context as any
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    let recipientEmail: string | null = data?.email?.trim() || null
    let fullName: string | null = null

    // 1. Try JWT claims
    if (!recipientEmail && claims?.email) {
      recipientEmail = claims.email
    }

    // 2. Try profiles table
    const { data: prof } = await admin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .maybeSingle()

    if (prof?.email && !recipientEmail) {
      recipientEmail = prof.email
    }
    if (prof?.full_name) {
      fullName = prof.full_name
    }

    // 3. Try Supabase auth.users directly via admin client
    if (!recipientEmail) {
      try {
        const { data: authUser } = await admin.auth.admin.getUserById(userId)
        if (authUser?.user?.email) {
          recipientEmail = authUser.user.email
        }
        if (!fullName && authUser?.user?.user_metadata?.full_name) {
          fullName = authUser.user.user_metadata.full_name
        }
      } catch (authErr) {
        console.warn('Could not fetch auth user:', authErr)
      }
    }

    // 4. Try linked people table
    if (!recipientEmail) {
      const { data: person } = await admin
        .from('people')
        .select('email, full_name')
        .eq('profile_id', userId)
        .maybeSingle()
      if (person?.email) recipientEmail = person.email
      if (person?.full_name && !fullName) fullName = person.full_name
    }

    if (!recipientEmail) {
      throw new Error('Ni bilo mogoče najti e-poštnega naslova uporabnika (no email found on profile or auth account)')
    }

    // Backfill profiles table if email was missing
    if (!prof?.email && recipientEmail) {
      await admin.from('profiles').update({ email: recipientEmail }).eq('id', userId)
    }

    const normalizedEmail = recipientEmail.toLowerCase()

    // Look up or mint an unsubscribe token — the provider rejects
    // transactional sends without one (400 missing_unsubscribe).
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

    // Load test_email template + brand from DB
    const { data: tpl } = await admin
      .from('email_templates')
      .select('subject, body, footer')
      .eq('template_key', 'test_email')
      .eq('language', 'sl')
      .maybeSingle()
    const { data: brand } = await admin
      .from('email_brand_settings')
      .select('app_name, logo_url, header_image_url, primary_color, footer_text')
      .eq('id', 1)
      .maybeSingle()

    const now = new Date()
    const vars: Record<string, string | undefined> = {
      person_name: fullName ?? prof?.full_name ?? recipientEmail,
      date: formatAppDate(now),
      time: formatAppTime(now),
      app_name: brand?.app_name ?? 'KRUH ŽIVLJENJA',
    }

    const subject = tpl ? substitute(tpl.subject, vars) : `Test · ${vars.app_name}`
    const body = tpl
      ? substitute(tpl.body, vars)
      : `Test email sent at ${formatAppDateTime(now)} (Europe/Ljubljana).`
    const footer = tpl?.footer ? substitute(tpl.footer, vars) : null


    const brandProps = {
      appName: brand?.app_name ?? 'KRUH ŽIVLJENJA',
      logoUrl: brand?.logo_url ?? null,
      headerImageUrl: brand?.header_image_url ?? null,
      primaryColor: brand?.primary_color ?? null,
      footerText: brand?.footer_text ?? null,
    }
    const html = await renderAsync(
      React.createElement(driverTemplate.component, {
        heading: subject,
        body,
        footer,
        preview: subject,
        brand: brandProps,
      }),
    )
    const text = await renderAsync(
      React.createElement(driverTemplate.component, {
        heading: subject,
        body,
        footer,
        preview: subject,
        brand: brandProps,
      }),
      { plainText: true },
    )
    const messageId = crypto.randomUUID()

    const resendRes = await sendResendEmail({
      to: recipientEmail,
      from: 'Kruh Življenja <kruhzivljenja@kalvarija.si>',
      subject,
      html,
      text,
      headers: {
        'List-Unsubscribe': `<https://kruhzivljenja.kalvarija.si/email/unsubscribe?token=${unsubscribeToken}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })

    if (resendRes.success) {
      await admin.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'driver-test',
        recipient_email: recipientEmail,
        status: 'sent',
        provider_message_id: resendRes.id ?? null,
        provider_response: resendRes,
      })
      return { ok: true, recipient: recipientEmail, message_id: messageId, provider_message_id: resendRes.id }
    } else {
      await admin.from('email_send_log').insert({
        message_id: messageId,
        template_name: 'driver-test',
        recipient_email: recipientEmail,
        status: 'failed',
        error_message: resendRes.error,
        provider_response: resendRes,
      })
      throw new Error(resendRes.error || 'Resend dispatch failed')
    }
  })

// Poll latest send-log status for a given message_id. Used by the test-email
// UI to surface provider rejection reasons after the dispatcher runs.
export const getSendLogStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { messageId: string }) => input)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()
    const { data: rows } = await admin
      .from('email_send_log')
      .select('status, error_message, provider_message_id, created_at')
      .eq('message_id', data.messageId)
      .order('created_at', { ascending: false })
      .limit(1)
    return rows?.[0] ?? null
  })

// ---------------------------------------------------------------------------
// List upcoming dates with assigned-driver stops (for the trigger UI)
// ---------------------------------------------------------------------------
export const listUpcomingAssignedStops = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()
    const today = new Date().toISOString().slice(0, 10)

    // Two-step query: avoids PostgREST embed-filter quirks that can silently
    // drop rows when filtering an !inner join by a foreign-table column.
    const { data: dates, error: dateErr } = await admin
      .from('schedule_dates')
      .select('id, date')
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(120)
    if (dateErr) throw new Error(dateErr.message)
    const dateIds = (dates ?? []).map((d: any) => d.id)
    if (!dateIds.length) return []
    const dateById = new Map((dates ?? []).map((d: any) => [d.id, d.date]))

    const { data: stops, error } = await admin
      .from('schedule_stops')
      .select(
        'id, schedule_date_id, locations(name), driver:people!schedule_stops_driver_id_fkey(full_name, email)',
      )
      .in('schedule_date_id', dateIds)
      .not('driver_id', 'is', null)
      .limit(80)
    if (error) throw new Error(error.message)

    return (stops ?? [])
      .map((r: any) => ({
        id: r.id,
        date: dateById.get(r.schedule_date_id) as string | undefined,
        location: r.locations?.name,
        driver_name: r.driver?.full_name,
        driver_email: r.driver?.email,
      }))
      .filter((r) => !!r.date)
      .sort((a, b) => (a.date! < b.date! ? -1 : a.date! > b.date! ? 1 : 0))
  })

// ---------------------------------------------------------------------------
// Admin template CRUD + brand settings + sample preview
// ---------------------------------------------------------------------------

const EDITABLE_KEYS = [
  'driver_assignment',
  'driver_change',
  'driver_reminder',
  'driver_reminder_today',
  'test_email',
] as const
type EditableKey = (typeof EDITABLE_KEYS)[number]
const LANGS: TemplateLang[] = ['sl', 'en']

function isEditableKey(k: string): k is EditableKey {
  return (EDITABLE_KEYS as readonly string[]).includes(k)
}

export const listEmailTemplatesAdmin = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()
    const { data, error } = await admin
      .from('email_templates')
      .select('id, template_key, language, subject, body, footer, placeholders, description, updated_at, updated_by')
      .in('template_key', EDITABLE_KEYS as unknown as string[])
    if (error) throw new Error(error.message)

    // Ensure a row exists per (key, lang); synthesize defaults for missing ones.
    const byKey = new Map<string, any>()
    for (const r of data ?? []) byKey.set(`${r.template_key}:${r.language}`, r)
    const rows: any[] = []
    for (const k of EDITABLE_KEYS) {
      for (const l of LANGS) {
        const found = byKey.get(`${k}:${l}`)
        const def = TEMPLATE_DEFAULTS[k][l]
        rows.push(
          found ?? {
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
            missing: true,
          },
        )
      }
    }
    return rows
  })

export const upsertEmailTemplateAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      template_key: string
      language: TemplateLang
      subject: string
      body: string
      footer: string | null
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    if (!isEditableKey(data.template_key)) throw new Error('invalid template_key')
    if (!LANGS.includes(data.language)) throw new Error('invalid language')
    if (!data.subject?.trim() || !data.body?.trim()) throw new Error('subject and body are required')
    const admin = getAdmin()
    const def = TEMPLATE_DEFAULTS[data.template_key][data.language]
    const { error } = await admin
      .from('email_templates')
      .upsert(
        {
          template_key: data.template_key,
          language: data.language,
          subject: data.subject,
          body: data.body,
          footer: data.footer,
          placeholders: def.placeholders,
          description: def.description,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'template_key,language' },
      )
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const resetEmailTemplateAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { template_key: string; language: TemplateLang }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    if (!isEditableKey(data.template_key)) throw new Error('invalid template_key')
    if (!LANGS.includes(data.language)) throw new Error('invalid language')
    const admin = getAdmin()
    const def = TEMPLATE_DEFAULTS[data.template_key][data.language]
    const { error } = await admin
      .from('email_templates')
      .upsert(
        {
          template_key: data.template_key,
          language: data.language,
          subject: def.subject,
          body: def.body,
          footer: def.footer,
          placeholders: def.placeholders,
          description: def.description,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'template_key,language' },
      )
    if (error) throw new Error(error.message)
    return { ok: true }
  })

export const getEmailBrandSettings = createServerFn({ method: 'GET' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()
    const { data, error } = await admin
      .from('email_brand_settings')
      .select('id, app_name, logo_url, header_image_url, primary_color, footer_text, updated_at')
      .eq('id', 1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ?? {
      id: 1,
      app_name: 'KRUH ŽIVLJENJA',
      logo_url: null,
      header_image_url: null,
      primary_color: '#0a0a0a',
      footer_text: null,
      updated_at: null,
    }
  })

export const upsertEmailBrandSettings = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      app_name: string
      logo_url: string | null
      header_image_url: string | null
      primary_color: string
      footer_text: string | null
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    if (!data.app_name?.trim()) throw new Error('app_name required')
    const httpsOnly = (u: string | null) =>
      u && u.trim() ? (/^https:\/\//i.test(u.trim()) ? u.trim() : null) : null
    const admin = getAdmin()
    const { error } = await admin
      .from('email_brand_settings')
      .upsert(
        {
          id: 1,
          app_name: data.app_name.trim().slice(0, 120),
          logo_url: httpsOnly(data.logo_url),
          header_image_url: httpsOnly(data.header_image_url),
          primary_color: /^#[0-9a-fA-F]{6}$/.test(data.primary_color)
            ? data.primary_color
            : '#0a0a0a',
          footer_text: data.footer_text?.slice(0, 1000) ?? null,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    if (error) throw new Error(error.message)
    return { ok: true }
  })

// Preview a template (by key+language) with sample placeholder values.
// Used by the editor's Preview tab so admins don't need a real assigned stop.
export const previewTemplateWithSample = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      template_key: string
      language: TemplateLang
      // Optional in-flight draft to preview before saving
      draft?: { subject: string; body: string; footer: string | null }
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    if (!isEditableKey(data.template_key)) throw new Error('invalid template_key')
    const admin = getAdmin()

    let subjectTpl: string
    let bodyTpl: string
    let footerTpl: string | null
    if (data.draft) {
      subjectTpl = data.draft.subject
      bodyTpl = data.draft.body
      footerTpl = data.draft.footer
    } else {
      const { data: row } = await admin
        .from('email_templates')
        .select('subject, body, footer')
        .eq('template_key', data.template_key)
        .eq('language', data.language)
        .maybeSingle()
      const def = TEMPLATE_DEFAULTS[data.template_key][data.language]
      subjectTpl = row?.subject ?? def.subject
      bodyTpl = row?.body ?? def.body
      footerTpl = row?.footer ?? def.footer
    }

    const { data: brand } = await admin
      .from('email_brand_settings')
      .select('app_name, logo_url, header_image_url, primary_color, footer_text')
      .eq('id', 1)
      .maybeSingle()

    const sample: Record<string, string> = {
      person_name: 'Janez Novak',
      driver_name: 'Janez Novak',
      coordinator: 'Ana Novak',
      coordinator_name: 'Ana Novak',
      date: '15. 1. 2026',
      time: '09:30',
      location: 'Mercator Celje',
      location_name: 'Mercator Celje',
      recipient_summary: '3 gospodinjstva',
      app_name: brand?.app_name ?? 'KRUH ŽIVLJENJA',
    }
    const subject = substitute(subjectTpl, sample)
    const body = substitute(bodyTpl, sample)
    const footer = footerTpl ? substitute(footerTpl, sample) : null
    const html = await renderAsync(
      React.createElement(driverTemplate.component, {
        heading: subject,
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
      }),
    )
    return { subject, body, footer, html }
  })

// ---------------------------------------------------------------------------
// Run daily automated reminders immediately on-demand (Tomorrow + Today)
// ---------------------------------------------------------------------------
export const runDailyRemindersNow = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().slice(0, 10)

    // 1. Tomorrow stops: 24h reminder
    const { data: tomorrowDates } = await admin
      .from('schedule_dates')
      .select('id, date, schedule_stops(id, driver_id)')
      .eq('date', tomorrowStr)

    // 2. Today stops: same-day reminder
    const { data: todayDates } = await admin
      .from('schedule_dates')
      .select('id, date, schedule_stops(id, driver_id)')
      .eq('date', todayStr)

    const results: Array<{ stopId: string; type: string; status: string; reason?: string; messageId?: string }> = []

    for (const d of tomorrowDates ?? []) {
      for (const s of (d as any).schedule_stops ?? []) {
        if (s.driver_id) {
          try {
            const r = await sendDriverNotificationForStop(s.id, 'reminder')
            results.push({ stopId: s.id, type: 'reminder (24h prej)', ...r })
          } catch (err: any) {
            results.push({
              stopId: s.id,
              type: 'reminder (24h prej)',
              status: 'failed',
              reason: err instanceof Error ? err.message : String(err),
            })
          }
        }
      }
    }

    for (const d of todayDates ?? []) {
      for (const s of (d as any).schedule_stops ?? []) {
        if (s.driver_id) {
          try {
            const r = await sendDriverNotificationForStop(s.id, 'reminder_today')
            results.push({ stopId: s.id, type: 'reminder (danes)', ...r })
          } catch (err: any) {
            results.push({
              stopId: s.id,
              type: 'reminder (danes)',
              status: 'failed',
              reason: err instanceof Error ? err.message : String(err),
            })
          }
        }
      }
    }

    return {
      today: todayStr,
      tomorrow: tomorrowStr,
      totalEvaluated: results.length,
      sent: results.filter((r) => r.status === 'sent').length,
      skipped: results.filter((r) => r.status === 'skipped').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    }
  })

// ---------------------------------------------------------------------------
// Generate formatted Viber message for a stop
// ---------------------------------------------------------------------------
export const getViberMessageForStop = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { stopId: string }) => input)
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context
    await assertAdmin(supabase, userId)
    const admin = getAdmin()

    const { data: stop } = await admin
      .from('schedule_stops')
      .select(
        'id, schedule_dates(date), locations(name), driver:people!schedule_stops_driver_id_fkey(full_name,phone), coordinator:people!schedule_stops_coordinator_id_fkey(full_name,phone)',
      )
      .eq('id', data.stopId)
      .maybeSingle()

    if (!stop) throw new Error('Stop not found')
    const s = stop as any

    const dateFormatted = s.schedule_dates?.date ? formatDateSL(s.schedule_dates.date) : '—'
    const locationName = s.locations?.name ?? '—'
    const driverName = s.driver?.full_name ?? '—'
    const driverPhone = s.driver?.phone ?? null
    const coordName = s.coordinator?.full_name ?? null
    const coordPhone = s.coordinator?.phone ?? null

    const { count: recipientCount } = await admin
      .from('date_recipients')
      .select('id', { count: 'exact', head: true })
      .eq('stop_id', data.stopId)

    let text = `🥖 *KRUH ŽIVLJENJA — Obvestilo za prevzem hrane*\n\n`
    text += `📅 *Datum:* ${dateFormatted}\n`
    text += `📍 *Lokacija:* ${locationName}\n`
    text += `👤 *Voznik/Prevzemnik:* ${driverName}${driverPhone ? ` (${driverPhone})` : ''}\n`
    if (coordName) {
      text += `🤝 *Koordinator:* ${coordName}${coordPhone ? ` (${coordPhone})` : ''}\n`
    }
    if (recipientCount && recipientCount > 0) {
      text += `📦 *Št. prejemnikov / družin:* ${recipientCount}\n`
    }
    text += `\nHvala za tvoje služenje in pomoč! Bog te blagoslovi. 🙏`

    return {
      text,
      viberUrl: `viber://forward?text=${encodeURIComponent(text)}`,
      driverPhone,
      driverName,
      locationName,
      dateFormatted,
    }
  })
