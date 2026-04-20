import bcrypt from "bcryptjs";
import { query } from "./db";

const SUPER_ADMIN = {
  id: "u_superadmin",
  name: "Ally Seif",
  email: "seif83470@gmail.com",
  phone: "0655779081",
  password: "matikiti",
};

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

export async function seedSuperAdmin() {
  const hash = await bcrypt.hash(SUPER_ADMIN.password, 10);

  await query(
    `INSERT INTO users (id, name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, phone = EXCLUDED.phone`,
    [SUPER_ADMIN.id, SUPER_ADMIN.name, SUPER_ADMIN.email, SUPER_ADMIN.phone, hash],
  );

  await query(
    `INSERT INTO admins (id, email, role, permissions, added_by)
     VALUES ($1, $2, 'super_admin', $3::jsonb, 'system')
     ON CONFLICT (email) DO UPDATE SET role = 'super_admin', permissions = EXCLUDED.permissions`,
    ["admin_superadmin", SUPER_ADMIN.email, JSON.stringify(ALL_PERMISSIONS)],
  );

  await query(
    `INSERT INTO admin_pin (id, pin) VALUES ('main', '1234') ON CONFLICT (id) DO NOTHING`,
  );
  await query(
    `INSERT INTO app_settings (id, data) VALUES ('main', '{}'::jsonb) ON CONFLICT (id) DO NOTHING`,
  );

  console.log("[seed] Super admin ready:", SUPER_ADMIN.email);
}
