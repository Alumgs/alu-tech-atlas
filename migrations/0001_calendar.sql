CREATE TABLE IF NOT EXISTS calendar_events (
 id TEXT PRIMARY KEY, source_id TEXT NOT NULL, event_key TEXT NOT NULL,
 day TEXT NOT NULL, end_day TEXT, payload TEXT NOT NULL, revision TEXT NOT NULL,
 first_seen TEXT NOT NULL, updated_at TEXT NOT NULL, last_checked TEXT NOT NULL,
 UNIQUE(source_id,event_key)
);
CREATE INDEX IF NOT EXISTS calendar_events_day ON calendar_events(day);
CREATE INDEX IF NOT EXISTS calendar_events_source ON calendar_events(source_id);
CREATE TABLE IF NOT EXISTS calendar_versions (
 sequence INTEGER PRIMARY KEY AUTOINCREMENT, event_id TEXT NOT NULL,
 recorded_at TEXT NOT NULL, day TEXT NOT NULL, revision TEXT NOT NULL, payload TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS calendar_versions_event ON calendar_versions(event_id,sequence);
CREATE TABLE IF NOT EXISTS calendar_source_state (
 source_id TEXT PRIMARY KEY, attempted_at TEXT, success_at TEXT,
 ok INTEGER NOT NULL DEFAULT 0, count INTEGER NOT NULL DEFAULT 0, error TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0, lease_owner TEXT
);
