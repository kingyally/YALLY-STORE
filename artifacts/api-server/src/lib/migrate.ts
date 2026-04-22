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

CREATE TABLE IF NOT EXISTS payment_orders (
  order_id VARCHAR PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  user_name VARCHAR DEFAULT '',
  user_email VARCHAR DEFAULT '',
  user_phone VARCHAR DEFAULT '',
  tipster_id INTEGER NOT NULL,
  tipster_name VARCHAR DEFAULT '',
  amount NUMERIC NOT NULL,
  currency VARCHAR DEFAULT 'TZS',
  status VARCHAR DEFAULT 'PENDING',
  channel VARCHAR DEFAULT '',
  reference VARCHAR DEFAULT '',
  transid VARCHAR DEFAULT '',
  provider VARCHAR DEFAULT 'sonicpesa',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_user ON ticket_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON ticket_requests(status);
CREATE INDEX IF NOT EXISTS idx_unlocked_user ON unlocked_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  actor_email VARCHAR DEFAULT '',
  actor_role VARCHAR DEFAULT '',
  action VARCHAR NOT NULL,
  target_type VARCHAR DEFAULT '',
  target_id VARCHAR DEFAULT '',
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_email);

CREATE TABLE IF NOT EXISTS broadcasts (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  audience VARCHAR DEFAULT 'all',
  sent_by VARCHAR DEFAULT '',
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_broadcasts_created ON broadcasts(created_at DESC);

CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  broadcast_id INTEGER,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON user_notifications(user_id, read);
`;

export async function runMigrations() {
  await query(SCHEMA_SQL);
  console.log("[migrate] Schema ready (all tables created/verified)");
}
