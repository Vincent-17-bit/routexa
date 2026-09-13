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

export function segmentMessage(segment, aheadKm) {
  const status = resolveTrafficStatus(segment.speedKmh)
  const speed = Math.round(segment.speedKmh)
  const name = segment.name
  const lead = aheadKm == null
    ? `At ${name}, `
    : aheadKm < 1
      ? `In ${Math.round(aheadKm * 1000)} m, `
      : `In ${aheadKm.toFixed(1)} km, `

  if (status === TRAFFIC_STATUS.HEAVY) {
    return { status, text: aheadKm == null ? `${lead}it's very stuck — barely moving.` : `${lead}${name} is very stuck — barely moving.` }
  }
  if (status === TRAFFIC_STATUS.MODERATE) {
    return { status, text: aheadKm == null ? `${lead}there's moderate traffic but moving.` : `${lead}moderate traffic at ${name}.` }
  }
  return { status, text: aheadKm == null ? `${lead}traffic is clear — cruising at ${speed} km/h.` : `${lead}${name} is clear — cruising at ${speed} km/h.` }
}
