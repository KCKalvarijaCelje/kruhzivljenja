import { createFileRoute } from '@tanstack/react-router'
import { createClient } from '@supabase/supabase-js'
import { enqueueDriverNotificationForStop } from '@/lib/driver-emails.functions'

// Cron-driven daily reminder: sends 'reminder' emails to drivers
// assigned to stops scheduled for tomorrow.
export const Route = createFileRoute('/api/public/hooks/driver-reminders')({
  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
        if (!supabaseUrl || !supabaseServiceKey) {
          return Response.json({ error: 'Server configuration error' }, { status: 500 })
        }
        const admin = createClient(supabaseUrl, supabaseServiceKey)

        const tomorrow = new Date()
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
        const dateStr = tomorrow.toISOString().slice(0, 10)

        const { data: dates, error } = await admin
          .from('schedule_dates')
          .select('id, schedule_stops(id, driver_id)')
          .eq('date', dateStr)

        if (error) {
          return Response.json({ error: error.message }, { status: 500 })
        }

        const stopIds: string[] = []
        for (const d of dates ?? []) {
          for (const s of (d as any).schedule_stops ?? []) {
            if (s.driver_id) stopIds.push(s.id)
          }
        }

        const results: Array<{ stopId: string; status: string; reason?: string }> = []
        for (const stopId of stopIds) {
          try {
            const r = await enqueueDriverNotificationForStop(stopId, 'reminder')
            results.push({ stopId, ...r })
          } catch (e) {
            results.push({
              stopId,
              status: 'skipped',
              reason: e instanceof Error ? e.message : 'unknown',
            })
          }
        }

        return Response.json({ date: dateStr, processed: results.length, results })
      },
    },
  },
})
