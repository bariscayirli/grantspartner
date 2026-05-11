CREATE TABLE IF NOT EXISTS subscribers (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  organisation TEXT,
  email        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  created_at   TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email   ON subscribers (email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created ON subscribers (created_at);
