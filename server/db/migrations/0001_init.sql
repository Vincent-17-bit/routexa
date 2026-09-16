CREATE TABLE IF NOT EXISTS devices (
  device_id TEXT PRIMARY KEY,
  fingerprint_hash TEXT NOT NULL,
  first_seen TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen TEXT NOT NULL DEFAULT (datetime('now')),
  device_type TEXT NOT NULL,
  os TEXT,
  browser TEXT,
  is_currently_online INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS login_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL REFERENCES devices(device_id),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  geo_city TEXT,
  geo_country TEXT,
  user_agent TEXT,
  success INTEGER NOT NULL,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_login_logs_ts ON login_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_login_logs_device ON login_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_deleted ON login_logs(deleted_at);

CREATE TABLE IF NOT EXISTS search_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL REFERENCES devices(device_id),
  session_id TEXT,
  query_text TEXT NOT NULL,
  query_type TEXT,
  mode TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  result_count INTEGER,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_search_logs_ts ON search_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_search_logs_device ON search_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_search_logs_deleted ON search_logs(deleted_at);

CREATE TABLE IF NOT EXISTS route_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL REFERENCES devices(device_id),
  origin TEXT,
  destination TEXT,
  mode TEXT,
  distance_km REAL,
  eta_min REAL,
  tolls_detected INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_route_logs_ts ON route_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_route_logs_device ON route_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_route_logs_deleted ON route_logs(deleted_at);

CREATE TABLE IF NOT EXISTS device_daily_stats (
  device_id TEXT NOT NULL REFERENCES devices(device_id),
  day TEXT NOT NULL,
  logins_ok INTEGER NOT NULL DEFAULT 0,
  logins_fail INTEGER NOT NULL DEFAULT 0,
  searches INTEGER NOT NULL DEFAULT 0,
  routes INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (device_id, day)
);
CREATE INDEX IF NOT EXISTS idx_device_daily_stats_day ON device_daily_stats(day);
