// single source of truth for "how long since last_seen before a device
// is considered offline" — used both when writing sessions (track.js)
// and when reading online status (devices.js), so the two can't drift.
export const SESSION_GAP_MINUTES = Number(process.env.SESSION_GAP_MINUTES) || 30
