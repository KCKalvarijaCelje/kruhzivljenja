# Email Queue — honest delivery status

## Root cause

The current "sent" badge is **misleading**. It does NOT mean the email reached an inbox.

Pipeline today (`src/routes/lovable/email/queue/process.ts:223-248`):

1. App enqueues into pgmq → row in `email_send_log` with `status = 'pending'`.
2. The cron dispatcher calls `sendLovableEmail(...)`. If that call **does not throw**, the dispatcher inserts a new row with `status = 'sent'` and deletes the message from the queue.
3. That's it. No bounce webhook, no delivery confirmation, no provider message id stored.

So `sent` in this app means exactly: **"the Lovable email API call returned without an error."** That is provider acceptance, not delivery. Gmail can still defer, spam-filter, reject after SMTP handoff, or drop silently — and the row will still say `sent`.

Also: `sendTestEmailToSelf` and the driver assignment path both enqueue into the same `transactional_emails` queue and go through the same dispatcher, so they share this same misleading status logic. The `driver_notification_log.status` field follows the same pattern (`'sent'` set right after enqueue success in `driver-emails.functions.ts:194-202`, which is even earlier — just "queued").

There is currently **no provider delivery callback wired in**. `src/routes/lovable/email/suppression.ts` exists for bounce/complaint suppression, but its events (if any) are not reflected back into `email_send_log` as a delivery outcome per `message_id`.

## What to change

### 1) Status vocabulary (truthful)

Introduce a clear ladder. We keep the existing DB column `email_send_log.status` (cheap), but expand its meaning and surface it differently in the UI:

| DB status | UI label | Meaning |
|---|---|---|
| `pending` | Queued | In pgmq, not yet attempted |
| `sent` | Handed to provider | Provider API accepted the request (no inbox guarantee) |
| `delivered` | Delivered | Provider webhook confirmed delivery to recipient MTA |
| `bounced` | Bounced | Provider webhook reported a hard/soft bounce |
| `complained` | Marked as spam | Provider webhook reported a complaint |
| `failed` | Send error | Non-429/403 error from provider, will retry |
| `dlq` | Gave up | Exhausted retries or TTL expired |
| `suppressed` | Suppressed | Address on suppression list |

The key rename: the green badge today labelled **"sent"** becomes **"Handed to provider"** (neutral/secondary variant, not success-green). Only `delivered` gets the success-green badge. A small tooltip on each status explains exactly what it means.

### 2) Capture provider message id + raw response

Update the dispatcher to read the return value of `sendLovableEmail` and store provider metadata:

- Add columns to `email_send_log`: `provider_message_id text`, `provider_response jsonb` (nullable).
- On success, insert the `sent` row with `provider_message_id` and a small response snapshot (status code, accepted recipients, any provider id). If `sendLovableEmail` doesn't currently return these, log what it does return and store whatever's available; show it in the UI row's expandable detail.

### 3) Wire delivery webhook (if the provider supports it)

`src/routes/lovable/email/suppression.ts` is already the webhook entry point for bounces/complaints. Extend it (or add a sibling `delivery.ts` under `/lovable/email/`) to:

- Accept delivery events (`delivered`, `bounced`, `complained`, `deferred`) from the Lovable email service.
- Look up the row by `provider_message_id` (or our `message_id` if passed through).
- Append a new `email_send_log` row with the appropriate status (`delivered` / `bounced` / `complained`). We never UPDATE — append-only is the existing convention.

If the provider does **not** emit delivery callbacks, we still ship steps 1–2 and the UI clearly shows "Handed to provider — delivery unknown" instead of pretending. The `delivered` status simply never appears, which is honest.

I'll verify webhook availability against the Lovable Email docs while implementing; if absent, the UI copy stays "Delivery unknown" by default.

### 4) Driver notification log

`driver_notification_log.status = 'sent'` is set right after enqueue (even more misleading than the queue's "sent"). Change that immediate insert to `status = 'queued'` and let the queue dispatcher's `email_send_log` row be the source of truth for downstream delivery state. The merge logic in `email-admin.functions.ts:108-115` already prefers `email_send_log` status over `driver_notification_log` status, so the UI is already correlating — the fix is just to not call the enqueue moment "sent."

### 5) UI changes (`src/routes/_authenticated/email-queue.tsx`)

- Update `statusVariant` so only `delivered` is the success-green `"default"` variant; `sent` becomes `"secondary"` (neutral).
- Add a small `<Tooltip>` per status badge with the meaning from the table above.
- Add summary tile **"Delivered"** alongside "Handed to provider".
- Show `provider_message_id` in the row's error/detail column (or a new "Provider ref" column) so admins can correlate with provider logs.
- Replace "Sent" column header label with "Handed to provider" and add a "Delivered" column with timestamp (empty when unknown).
- Keep historical failed rows visible (already the case).

### 6) i18n

Add the new label keys (queued / handedToProvider / delivered / deliveryUnknown / bounced / complained / sendError / gaveUp / providerRef) to `src/lib/i18n.tsx` in both languages.

## Out of scope

- Not rebuilding the queue or retry logic — only adding truthful labels + delivery hook.
- Not changing the sender domain configuration.
- Not touching auth emails (same dispatcher, but UI is driver-focused; the dispatcher changes naturally cover both).

## Files touched

- `supabase/migrations/<new>.sql` — add `provider_message_id`, `provider_response` to `email_send_log`.
- `src/routes/lovable/email/queue/process.ts` — capture provider response, store it.
- `src/routes/lovable/email/suppression.ts` (or new `delivery.ts`) — append `delivered`/`bounced`/`complained` rows on webhook.
- `src/lib/driver-emails.functions.ts` — set initial `driver_notification_log.status = 'queued'` instead of `'sent'`.
- `src/lib/email-admin.functions.ts` — surface `provider_message_id`, add `delivered` to summary, keep `senderDomainOk` heuristic.
- `src/routes/_authenticated/email-queue.tsx` — tooltips, recolored badges, new column, new summary tile.
- `src/lib/i18n.tsx` — new strings.

## What each status will mean after the fix

- **Queued** — in our internal queue, not yet attempted.
- **Handed to provider** — provider accepted the API call; inbox arrival not yet confirmed.
- **Delivered** — provider webhook confirmed recipient mail server accepted the message.
- **Bounced / Marked as spam** — provider webhook reported a delivery failure or complaint.
- **Send error** — provider call failed (network/5xx); will retry automatically.
- **Gave up** — exceeded retries or TTL; will not be retried.
- **Suppressed** — address on suppression list; not attempted.