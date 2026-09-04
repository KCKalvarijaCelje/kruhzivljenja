import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import { sendDriverNotificationForStop } from '@/lib/driver-emails.functions'

async function processDailyReminders() {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    import.meta.env?.VITE_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: 'Server configuration error: missing Supabase credentials' }
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey)

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  // 1. Fetch tomorrow's stops for 24h reminders
  const { data: tomorrowDates, error: errTomorrow } = await admin
    .from('schedule_dates')
    .select('id, date, schedule_stops(id, driver_id)')
    .eq('date', tomorrowStr)

  if (errTomorrow) {
    console.error('[Reminders Cron] Error fetching tomorrow dates:', errTomorrow)
  }

  // 2. Fetch today's stops for same-day morning reminders
  const { data: todayDates, error: errToday } = await admin
    .from('schedule_dates')
    .select('id, date, schedule_stops(id, driver_id)')
    .eq('date', todayStr)

  if (errToday) {
    console.error('[Reminders Cron] Error fetching today dates:', errToday)
  }

  const results: Array<{
    date: string
    type: 'reminder' | 'reminder_today'
    stopId: string
    status: string
    reason?: string
    messageId?: string
  }> = []

  // Process 24h reminders for tomorrow
  for (const d of tomorrowDates ?? []) {
    for (const s of (d as any).schedule_stops ?? []) {
      if (s.driver_id) {
        try {
          const r = await sendDriverNotificationForStop(s.id, 'reminder')
          results.push({ date: tomorrowStr, type: 'reminder', stopId: s.id, ...r })
        } catch (e) {
          results.push({
            date: tomorrowStr,
            type: 'reminder',
            stopId: s.id,
            status: 'failed',
            reason: e instanceof Error ? e.message : 'unknown',
          })
        }
      }
    }
  }

  // Process same-day reminders for today
  for (const d of todayDates ?? []) {
    for (const s of (d as any).schedule_stops ?? []) {
      if (s.driver_id) {
        try {
          const r = await sendDriverNotificationForStop(s.id, 'reminder_today')
          results.push({ date: todayStr, type: 'reminder_today', stopId: s.id, ...r })
        } catch (e) {
          results.push({
            date: todayStr,
            type: 'reminder_today',
            stopId: s.id,
            status: 'failed',
            reason: e instanceof Error ? e.message : 'unknown',
          })
        }
      }
    }
  }

  const sentCount = results.filter((r) => r.status === 'sent').length
  const skippedCount = results.filter((r) => r.status === 'skipped').length
  const failedCount = results.filter((r) => r.status === 'failed').length

  return {
    success: true,
    today: todayStr,
    tomorrow: tomorrowStr,
    totalEvaluated: results.length,
    sent: sentCount,
    skipped: skippedCount,
    failed: failedCount,
    results,
  }
}

// Support both GET (for Vercel Cron) and POST (for webhook/manual trigger)
export const Route = createFileRoute('/api/public/hooks/driver-reminders')({
  server: {
    handlers: {
      GET: async () => {
        const res = await processDailyReminders()
        return Response.json(res)
      },
      POST: async () => {
        const res = await processDailyReminders()
        return Response.json(res)
      },
    },
  },
})
