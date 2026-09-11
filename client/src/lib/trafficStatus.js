export const TRAFFIC_STATUS = {
  HEAVY: 'heavy',
  MODERATE: 'moderate',
  CLEAR: 'clear'
}

const STATUS_META = {
  [TRAFFIC_STATUS.HEAVY]: { label: 'Heavy Traffic', color: '#D32F2F' },
  [TRAFFIC_STATUS.MODERATE]: { label: 'Moderate Delay', color: '#F57C00' },
  [TRAFFIC_STATUS.CLEAR]: { label: 'Clear / Fast Flow', color: '#388E3C' }
}

export function resolveTrafficStatus(speedKmh) {
  if (speedKmh < 15) return TRAFFIC_STATUS.HEAVY
  if (speedKmh < 40) return TRAFFIC_STATUS.MODERATE
  return TRAFFIC_STATUS.CLEAR
}

export function getStatusMeta(status) {
  return STATUS_META[status]
}
