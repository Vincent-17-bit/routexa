export const TRAFFIC_STATUS = {
  HEAVY: 'heavy',
  MODERATE: 'moderate',
  CLEAR: 'clear'
}

const STATUS_META = {
  [TRAFFIC_STATUS.HEAVY]: {
    label: 'Heavy Traffic',
    border: 'border-traffic-heavy-light dark:border-traffic-heavy-dark',
    badge: 'bg-traffic-heavy-badge',
    text: 'text-traffic-heavy-text-light dark:text-traffic-heavy-text-dark'
  },
  [TRAFFIC_STATUS.MODERATE]: {
    label: 'Moderate Delay',
    border: 'border-traffic-moderate-light dark:border-traffic-moderate-dark',
    badge: 'bg-traffic-moderate-badge',
    text: 'text-traffic-moderate-text-light dark:text-traffic-moderate-text-dark'
  },
  [TRAFFIC_STATUS.CLEAR]: {
    label: 'Clear / Fast Flow',
    border: 'border-traffic-clear-light dark:border-traffic-clear-dark',
    badge: 'bg-traffic-clear-badge',
    text: 'text-traffic-clear-text-light dark:text-traffic-clear-text-dark'
  }
}

export function resolveTrafficStatus(speedKmh) {
  if (speedKmh < 15) return TRAFFIC_STATUS.HEAVY
  if (speedKmh < 40) return TRAFFIC_STATUS.MODERATE
  return TRAFFIC_STATUS.CLEAR
}

export function getStatusMeta(status) {
  return STATUS_META[status]
}

export function segmentMessage(segment) {
  const status = resolveTrafficStatus(segment.speedKmh)
  const speed = Math.round(segment.speedKmh)
  const name = segment.name
  if (status === TRAFFIC_STATUS.HEAVY) return { status, text: `Heavy traffic on ${name} — crawling at ${speed} km/h` }
  if (status === TRAFFIC_STATUS.MODERATE) return { status, text: `Moderate delay on ${name} — averaging ${speed} km/h` }
  return { status, text: `Clear flow on ${name} — cruising at ${speed} km/h` }
}
