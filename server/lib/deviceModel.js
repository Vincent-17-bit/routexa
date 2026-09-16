// Best-effort model extraction from the User-Agent header.
// Android UAs commonly embed the exact model (e.g. "SM-A165F", "itel S665L").
// iOS never exposes the exact model in the UA (Apple strips it by design),
// so iPhone/iPad only ever resolve to the generic family name.
export function parseDeviceModel(ua) {
  if (!ua) return null

  if (/iphone/i.test(ua)) return 'iPhone'
  if (/ipad/i.test(ua)) return 'iPad'

  const androidMatch = ua.match(/Android[^;]*;\s*([^;)]+?)\s*(Build\/|\))/i)
  if (androidMatch) {
    const raw = androidMatch[1].trim()
    if (raw && !/^(K|wv|Mobile)$/i.test(raw)) return raw
  }

  if (/Macintosh/i.test(ua)) return 'Mac'
  if (/Windows/i.test(ua)) return 'Windows PC'
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return 'Linux PC'

  return null
}
