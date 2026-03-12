export const SUPPORTED_WEBHOOK_EVENT_TYPES = [
  'contribution.received',
  'pot.funded',
] as const;

export type SupportedWebhookEventType = (typeof SUPPORTED_WEBHOOK_EVENT_TYPES)[number];

const SUPPORTED_WEBHOOK_EVENT_SET = new Set<string>(SUPPORTED_WEBHOOK_EVENT_TYPES);

export const isSupportedWebhookEventType = (
  value: string
): value is SupportedWebhookEventType => SUPPORTED_WEBHOOK_EVENT_SET.has(value);

export const normalizeWebhookEndpointEvents = (
  events: readonly string[]
): SupportedWebhookEventType[] => {
  const normalized = new Set<SupportedWebhookEventType>();

  for (const event of events) {
    if (event === '*') {
      SUPPORTED_WEBHOOK_EVENT_TYPES.forEach((supportedEvent) => normalized.add(supportedEvent));
      continue;
    }

    if (isSupportedWebhookEventType(event)) {
      normalized.add(event);
    }
  }

  return SUPPORTED_WEBHOOK_EVENT_TYPES.filter((event) => normalized.has(event));
};

export const hasLegacyWebhookEventSelection = (events: readonly string[]) =>
  events.some((event) => event === '*' || !isSupportedWebhookEventType(event));

export const matchesWebhookEndpointEvent = (
  events: readonly string[],
  eventType: string
): eventType is SupportedWebhookEventType =>
  isSupportedWebhookEventType(eventType) && normalizeWebhookEndpointEvents(events).includes(eventType);
