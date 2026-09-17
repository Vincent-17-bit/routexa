export const CATEGORY_ICON = {
  mobile: '▯',
  tablet: '▭',
  pc: '▢',
  smart_tv: '▬',
  smartwatch: '◔',
  unknown: '?'
}

export const CATEGORY_LABEL = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  pc: 'PC',
  smart_tv: 'Smart TV',
  smartwatch: 'Smartwatch',
  unknown: 'Unknown'
}

export function categoryModelLabel(device_category, device_model) {
  if (device_category === 'mobile' && device_model === 'iPhone') return 'iPhone (exact model not available)'
  return device_model || CATEGORY_LABEL[device_category] || device_category || '—'
}