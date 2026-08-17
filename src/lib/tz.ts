// Centralized timezone helpers for user-facing date/time formatting.
// All user-visible times (emails, previews) should use APP_TIMEZONE so they
// match the project's local time regardless of where the server (Cloudflare
// Worker, Supabase cron) runs — those run in UTC internally.

export const APP_TIMEZONE = 'Europe/Ljubljana'
export const APP_LOCALE = 'sl-SI'

// Format a calendar date (YYYY-MM-DD or Date) as "D. M. YYYY" in app TZ.
export function formatAppDate(input: string | Date): string {
  const d = typeof input === 'string' ? parseCalendarDate(input) : input
  const parts = new Intl.DateTimeFormat('sl-SI', {
    timeZone: APP_TIMEZONE,
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).formatToParts(d)
  const day = parts.find((p) => p.type === 'day')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  const year = parts.find((p) => p.type === 'year')?.value
  return `${day}. ${month}. ${year}`
}

// Format time as HH:MM in app TZ.
export function formatAppTime(input: Date = new Date()): string {
  return new Intl.DateTimeFormat('sl-SI', {
    timeZone: APP_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(input)
}

// Format a full timestamp as "D. M. YYYY HH:MM" in app TZ.
export function formatAppDateTime(input: Date = new Date()): string {
  return `${formatAppDate(input)} ${formatAppTime(input)}`
}

// Parse "YYYY-MM-DD" as a calendar date anchored at noon UTC so TZ shifts
// can't push it across midnight when formatting in Europe/Ljubljana.
function parseCalendarDate(s: string): Date {
  const [y, m, d] = s.split('-').map((v) => parseInt(v, 10))
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1, 12, 0, 0))
}
