import bcrypt from "bcryptjs";
import { query } from "./db";

const SUPER_ADMIN = {
  id: "u_superadmin",
  name: "King Yally",
  email: "kingyally25@gmail.com",
  phone: "0655779081",
  password: "matikiti30",
};

const OLD_SUPER_ADMIN_EMAILS = ["seif83470@gmail.com"];

const ALL_PERMISSIONS = [
  "requests",
  "tipsters",
  "history",
  "settings",
  "users",
  "banners",
  "packages",
  "admins",
];

const INITIAL_TIPSTERS = [
  { id: 1, category: "VIP TICKET", name: "Coach Mwamba", avatar: "", odds: "15.50", code: "BET-7X9K2", company: "Dbet", isFree: false, expiryTime: 11000, expiryDate: "2026-04-04T23:59:00", prices: [{ name: "Siku 1", p: 1500, discount: 0 }] },
  { id: 2, category: "VIP TICKET", name: "Boss Kelvin", avatar: "", odds: "18.20", code: "BET-M4P8L", company: "Sportbety", isFree: false, expiryTime: 12000, expiryDate: "2026-04-04T23:59:00", prices: [{ name: "Siku 1", p: 2000, discount: 0 }] },
  { id: 3, category: "VIP TICKET", name: "Pro Danny", avatar: "", odds: "22.00", code: "BET-R6T3W", company: "BetPawa", isFree: false, expiryTime: 13000, expiryDate: "2026-04-05T18:00:00", prices: [{ name: "Siku 1", p: 2500, discount: 0 }] },
  { id: 4, category: "VIP TICKET", name: "King Amos", avatar: "", odds: "25.00", code: "BET-N1Y5H", company: "1win", isFree: false, expiryTime: 14000, expiryDate: "2026-04-05T20:00:00", prices: [{ name: "Siku 1", p: 3000, discount: 0 }] },
  { id: 5, category: "FIXED GAME", name: "Fixed Master", avatar: "", odds: "85.00", code: "FIX-Q8J2V", company: "Paripesa", isFree: false, expiryTime: 10500, expiryDate: "2026-04-04T22:00:00", prices: [{ name: "Siku 1", p: 3000, discount: 500 }] },
  { id: 6, category: "FIXED GAME", name: "Sure Bet Pro", avatar: "", odds: "95.00", code: "FIX-D5K9M", company: "TOPBET", isFree: false, expiryTime: 11500, expiryDate: "2026-04-05T15:00:00", prices: [{ name: "Siku 1", p: 3500, discount: 500 }] },
  { id: 7, category: "FIXED GAME", name: "Golden Tips", avatar: "", odds: "110.0", code: "FIX-A7P4R", company: "Dbet", isFree: false, expiryTime: 12500, expiryDate: "2026-04-06T12:00:00", prices: [{ name: "Siku 1", p: 4000, discount: 500 }] },
  { id: 8, category: "FIXED GAME", name: "Mega Win", avatar: "", odds: "150.0", code: "FIX-C3X8Z", company: "Sportbety", isFree: false, expiryTime: 13500, expiryDate: "2026-04-06T18:00:00", prices: [{ name: "Siku 1", p: 5000, discount: 500 }] },
  { id: 9, category: "CORRECT SCORE", name: "CS King", avatar: "", odds: "250.0", code: "CS-B6N2F", company: "BetPawa", isFree: false, expiryTime: 10000, expiryDate: "2026-04-04T21:00:00", prices: [{ name: "Siku 1", p: 25000, discount: 2000 }] },
  { id: 10, category: "CORRECT SCORE", name: "Score Expert", avatar: "", odds: "300.0", code: "CS-H4W7T", company: "1win", isFree: false, expiryTime: 11000, expiryDate: "2026-04-05T19:00:00", prices: [{ name: "Siku 1", p: 28000, discount: 2000 }] },
  { id: 11, category: "CORRECT SCORE", name: "Predict Pro", avatar: "", odds: "350.0", code: "CS-L9E5G", company: "Paripesa", isFree: false, expiryTime: 12000, expiryDate: "2026-04-06T16:00:00", prices: [{ name: "Siku 1", p: 30000, discount: 2000 }] },
  { id: 12, category: "CORRECT SCORE", name: "Yally CS", avatar: "", odds: "400.0", code: "CS-U2R8K", company: "TOPBET", isFree: false, expiryTime: 13000, expiryDate: "2026-04-07T14:00:00", prices: [{ name: "Siku 1", p: 35000, discount: 2000 }] },
];

const INITIAL_PACKAGES = [
  { id: 1, name: "Daily VIP", price: 5000 },
  { id: 2, name: "Weekly VIP", price: 25000, discount: 5000 },
  { id: 3, name: "Monthly VIP", price: 80000, discount: 20000 },
];

const INITIAL_HISTORY = [
  { id: 1, title: "Arsenal vs Chelsea - VIP TICKET", date: "2026-04-02", result: "WON" },
  { id: 2, title: "Man City vs Liverpool - FIXED", date: "2026-04-02", result: "WON" },
  { id: 3, title: "Barcelona 2:1 Real Madrid", date: "2026-04-01", result: "WON" },
  { id: 4, title: "PSG vs Bayern - VIP TICKET", date: "2026-04-01", result: "WON" },
  { id: 5, title: "Inter vs Juventus - FIXED", date: "2026-03-31", result: "WON" },
  { id: 6, title: "Napoli vs Roma - Free Odds", date: "2026-03-31", result: "LOST" },
  { id: 7, title: "Simba vs Yanga - VIP TICKET", date: "2026-03-30", result: "WON" },
  { id: 8, title: "Dortmund 3:1 Leverkusen", date: "2026-03-30", result: "WON" },
];

const INITIAL_SETTINGS = {
  telegramChannel: "https://t.me/yallybetting",
  whatsappGroup: "https://chat.whatsapp.com/yallyvip",
  whatsappNumber: "255765902829",
  supportEmail: "support@yallybet.co.tz",
  paymentNumber: "0765 902 829",
  paymentMethods: ["M-PESA", "TIGO PESA", "AIRTEL MONEY"],
};

async function seedTableIfEmpty(
  table: string,
  items: Array<{ id: number; [k: string]: any }>,
) {
  const r = await query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM ${table}`);
  if (Number(r.rows[0]?.count ?? 0) > 0) return;
  for (const it of items) {
    await query(
      `INSERT INTO ${table} (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING`,
      [it.id, JSON.stringify(it)],
    );
  }
  console.log(`[seed] ${table}: imejazwa data ${items.length} ya awali`);
}

export async function seedSuperAdmin() {
  const hash = await bcrypt.hash(SUPER_ADMIN.password, 10);

  // If a previous super admin user row exists with the fixed id but a different email,
  // delete it so we can re-insert cleanly with the new email.
  await query(`DELETE FROM users WHERE id = $1 AND email <> $2`, [
    SUPER_ADMIN.id,
    SUPER_ADMIN.email,
  ]);

  await query(
    `INSERT INTO users (id, name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id, password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, phone = EXCLUDED.phone`,
    [SUPER_ADMIN.id, SUPER_ADMIN.name, SUPER_ADMIN.email, SUPER_ADMIN.phone, hash],
  );

  // Same for the admins table — clear any old admin row holding the fixed id.
  await query(`DELETE FROM admins WHERE id = $1 AND email <> $2`, [
    "admin_superadmin",
    SUPER_ADMIN.email,
  ]);

  await query(
    `INSERT INTO admins (id, email, role, permissions, added_by)
     VALUES ($1, $2, 'super_admin', $3::jsonb, 'system')
     ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id, role = 'super_admin', permissions = EXCLUDED.permissions`,
    ["admin_superadmin", SUPER_ADMIN.email, JSON.stringify(ALL_PERMISSIONS)],
  );

  await query(
    `INSERT INTO admin_pin (id, pin) VALUES ('main', '1234') ON CONFLICT (id) DO NOTHING`,
  );
  await query(
    `INSERT INTO app_settings (id, data) VALUES ('main', $1::jsonb) ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(INITIAL_SETTINGS)],
  );

  // Remove any previous super admin records so old credentials no longer have power.
  if (OLD_SUPER_ADMIN_EMAILS.length > 0) {
    await query(
      `DELETE FROM admins WHERE email = ANY($1::text[]) AND email <> $2`,
      [OLD_SUPER_ADMIN_EMAILS, SUPER_ADMIN.email],
    );
  }

  console.log("[seed] Super admin ready:", SUPER_ADMIN.email);

  // Seed initial app content (only if tables are still empty).
  await seedTableIfEmpty("tipsters", INITIAL_TIPSTERS);
  await seedTableIfEmpty("packages", INITIAL_PACKAGES);
  await seedTableIfEmpty("history_entries", INITIAL_HISTORY);
}
