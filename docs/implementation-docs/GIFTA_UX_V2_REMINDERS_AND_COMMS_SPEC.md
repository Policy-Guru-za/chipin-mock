# Gifta UX v2 Reminders and Communications Spec

## Purpose

Define required reminder scheduling/dispatch and communications behavior for UX v2.

## Communication Channels

- WhatsApp templates
- Email templates

## Event Matrix

| Event | Recipient | Channel | Trigger |
|---|---|---|---|
| Dreamboard created | Parent/Host | WhatsApp + Email | Successful board creation |
| New contribution | Parent/Host | WhatsApp + Email | Contribution moves to `completed` |
| Contribution confirmation | Contributor | Email | Contribution `completed` |
| Reminder requested | Contributor | Email | Reminder due time reached |
| Campaign complete | Parent/Host | WhatsApp + Email | Board closes and payouts generated |
| Payout completed | Parent/Host | WhatsApp + Email | Gift payout marked `completed` |

## Reminder Scheduling Contract

Input API:

- `dreamBoardId`
- `email`
- `remindInDays` (1-14)

Rules:

- reminder must be before campaign close datetime
- if requested time exceeds close datetime, clamp to close-of-day
- reject if computed reminder time <= now
- dedupe by `(dream_board_id, email, remind_at)`

## Reminder Dispatch Job Contract

Required job behavior:

1. Query unsent reminders where `remind_at <= now` and `sent_at IS NULL`.
2. Send reminder template.
3. Mark `sent_at` on success.
4. Record send outcome in logs/audit.
5. Retry transient failures with bounded attempts.

Idempotency:

- each reminder row must be send-once from system perspective
- retried sends must not produce duplicate user messages

## Template Variable Contract

### Reminder Email

Required variables:

- `child_name`
- `dreamboard_url`
- `campaign_close_date`

### Contribution Notification (Parent)

Required variables:

- `contributor_name`
- `amount`
- `child_name`
- `new_total`

### Campaign Complete (Parent)

Required variables:

- `child_name`
- `gross`
- `platform_fees`
- `charity_amount` (if applicable)
- `net_payout`
- `payout_method`

## Error Handling and Observability

- template render failures -> hard error with reason code
- delivery failures -> retryable/non-retryable classification
- metrics required:
  - reminders queued
  - reminders sent
  - reminder failure rate
  - comms latency percentile

Alert thresholds:

- reminder send failure rate > 2% over 15 min
- zero reminders sent for 24h while due reminders exist

## Compliance and Safety

- no repeated unsolicited reminders
- include opt-out context where applicable
- avoid exposing sensitive payout data in outbound messages

## Acceptance Criteria

- `P0`: due reminders dispatch and set `sent_at` exactly once
- `P0`: invalid reminder windows rejected with explicit code
- `P1`: all required template variables validated before send
- `P1`: delivery and failure metrics visible in dashboards
