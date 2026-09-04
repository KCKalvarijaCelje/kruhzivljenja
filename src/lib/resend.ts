/**
 * Direct Resend email dispatcher
 * Clean, lightweight implementation matching Nadelia (nedelje) architecture.
 */

export interface ResendEmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  headers?: Record<string, string>
}

export interface ResendSendResult {
  success: boolean
  id?: string
  error?: string
  status?: number
}

const DEFAULT_FROM = 'Kruh Življenja <kruhzivljenja@kalvarija.si>'

export function getResendApiKey(): string | null {
  const envKey =
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_RESEND_API_KEY)

  if (envKey && !envKey.startsWith('re_Mi1g1iqx')) {
    return envKey.trim()
  }

  return null
}

export function getResendFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM
}

/**
 * Dispatches an email directly via the Resend REST API.
 */
export async function sendResendEmail(payload: ResendEmailPayload): Promise<ResendSendResult> {
  const apiKey = getResendApiKey()
  if (!apiKey) {
    console.error('[Resend] Missing RESEND_API_KEY in environment')
    return {
      success: false,
      error: 'Resend API key missing in environment (RESEND_API_KEY)',
    }
  }

  const recipientList = Array.isArray(payload.to) ? payload.to : [payload.to]
  const validRecipients = recipientList
    .map((e) => (e ? e.trim() : ''))
    .filter((e) => e && e.includes('@'))

  if (validRecipients.length === 0) {
    return {
      success: false,
      error: 'No valid recipient email address provided',
    }
  }

  const fromAddress = payload.from || getResendFromAddress()

  const body: Record<string, any> = {
    from: fromAddress,
    to: validRecipients,
    subject: payload.subject,
    html: payload.html,
  }

  if (payload.text) {
    body.text = payload.text
  }
  if (payload.replyTo) {
    body.reply_to = payload.replyTo
  }
  if (payload.headers) {
    body.headers = payload.headers
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (res.ok && data?.id) {
      console.log(`[Resend] Successfully sent email to ${validRecipients.join(', ')} (ID: ${data.id})`)
      return {
        success: true,
        id: data.id,
        status: res.status,
      }
    }

    const errorMsg = data?.message || data?.error || `Resend API error (${res.status})`
    console.error('[Resend] API error response:', data)
    return {
      success: false,
      error: errorMsg,
      status: res.status,
    }
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[Resend] Network / fetch error:', message)
    return {
      success: false,
      error: message,
    }
  }
}
