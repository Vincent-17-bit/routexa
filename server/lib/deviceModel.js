import { UAParser } from 'ua-parser-js'

function watchModel(ua) {
  const m = ua.match(/Watch\s?OS\s?([\d_.]+)/i)
  if (m) return `watchOS ${m[1].replace(/_/g, '.')}`
  if (/wear\s?os/i.test(ua)) return 'Wear OS'
  return null
}

export function parseDevice(ua) {
  if (!ua) return { device_type: 'unknown', device_model: null }

  const isWearable = /watch\s?os|wear\s?os/i.test(ua)
  const { device, os, browser } = new UAParser(ua).getResult()
  const type = isWearable ? 'wearable' : device.type

  if (type === 'mobile' || type === 'tablet') {
    const isApple = /iphone|ipad/i.test(ua)
    const model = isApple ? (type === 'tablet' ? 'iPad' : 'iPhone') : (device.model || device.vendor || null)
    return { device_type: type, device_model: model }
  }

  if (type === 'smarttv') {
    return { device_type: 'smart_tv', device_model: [os.name, os.version].filter(Boolean).join(' ') || device.model || 'Smart TV' }
  }

  if (type === 'wearable') {
    return { device_type: 'smartwatch', device_model: watchModel(ua) || [os.name, os.version].filter(Boolean).join(' ') || device.model || 'Smartwatch' }
  }

  if (!type && os.name) {
    const osStr = [os.name, os.version].filter(Boolean).join(' ')
    const browserStr = [browser.name, browser.version?.split('.')[0]].filter(Boolean).join(' ')
    return { device_type: 'pc', device_model: [osStr, browserStr].filter(Boolean).join(' · ') || null }
  }

  return { device_type: 'unknown', device_model: ua.slice(0, 100) }
}