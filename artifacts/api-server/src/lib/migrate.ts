import { query } from "./db";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR DEFAULT '',
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  role VARCHAR DEFAULT 'admin',
  permissions JSONB DEFAULT '[]'::jsonb,
  added_by VARCHAR DEFAULT 'system',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  token VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS ticket_requests (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  user_name VARCHAR NOT NULL,
  user_phone VARCHAR DEFAULT '',
  user_email VARCHAR NOT NULL,
  tipster_id INTEGER NOT NULL,
  tipster_name VARCHAR NOT NULL,
  amount NUMERIC NOT NULL,
  payment_number VARCHAR DEFAULT '',
  payment_method VARCHAR DEFAULT '',
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS unlocked_tickets (
  user_id VARCHAR NOT NULL,
  tipster_id INTEGER NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, tipster_id)
);

CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR PRIMARY KEY,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tipsters (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS history_entries (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id INTEGER PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_pin (
  id VARCHAR PRIMARY KEY DEFAULT 'main',
  pin VARCHAR DEFAULT '1234'
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_user ON ticket_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON ticket_requests(status);
CREATE INDEX IF NOT EXISTS idx_unlocked_user ON unlocked_tickets(user_id);
`;

export async function runMigrations() {
  await query(SCHEMA_SQL);
  console.log("[migrate] Schema ready (all tables created/verified)");
}
