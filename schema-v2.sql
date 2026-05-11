-- Run this against the remote D1 database:
-- wrangler d1 execute grantspartner-db --remote --file=schema-v2.sql

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT    NOT NULL,
  slug         TEXT    NOT NULL UNIQUE,
  excerpt      TEXT,
  content      TEXT    NOT NULL DEFAULT '',
  status       TEXT    NOT NULL DEFAULT 'draft',
  created_at   TEXT    NOT NULL,
  updated_at   TEXT    NOT NULL,
  published_at TEXT
);

CREATE TABLE IF NOT EXISTS site_pages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  title            TEXT    NOT NULL,
  slug             TEXT    NOT NULL UNIQUE,
  content          TEXT    NOT NULL DEFAULT '',
  meta_description TEXT,
  status           TEXT    NOT NULL DEFAULT 'draft',
  created_at       TEXT    NOT NULL,
  updated_at       TEXT    NOT NULL,
  published_at     TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id    TEXT    NOT NULL,
  data       TEXT    NOT NULL,
  created_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_slug      ON posts (slug);
CREATE INDEX IF NOT EXISTS idx_posts_status    ON posts (status);
CREATE INDEX IF NOT EXISTS idx_pages_slug      ON site_pages (slug);
CREATE INDEX IF NOT EXISTS idx_pages_status    ON site_pages (status);
CREATE INDEX IF NOT EXISTS idx_forms_form_id   ON form_submissions (form_id);
