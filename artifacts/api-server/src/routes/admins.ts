import { Router, type IRouter } from "express";
import { query } from "../lib/db";
import { requireUser, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/", requireUser, requireAdmin, async (_req, res) => {
  const r = await query<any>(
    `SELECT id, email, role, permissions, added_by, created_at FROM admins ORDER BY created_at`,
  );
  res.json({ admins: r.rows });
});

router.post("/", requireUser, requireAdmin, async (req, res) => {
  const { email, addedBy, permissions } = req.body ?? {};
  if (!email) {
    res.status(400).json({ error: "Email inahitajika" });
    return;
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const exist = await query(`SELECT id FROM admins WHERE LOWER(email) = $1`, [cleanEmail]);
  if (exist.rows.length) {
    res.status(400).json({ error: "Email hii ipo tayari!" });
    return;
  }
  const id = `admin_${Date.now()}`;
  const perms = Array.isArray(permissions) ? permissions : ["requests"];
  await query(
    `INSERT INTO admins (id, email, role, permissions, added_by) VALUES ($1, $2, 'admin', $3::jsonb, $4)`,
    [id, cleanEmail, JSON.stringify(perms), addedBy ?? "system"],
  );
  res.json({ ok: true });
});

router.put("/:id/permissions", requireUser, requireAdmin, async (req, res) => {
  const { permissions } = req.body ?? {};
  await query(
    `UPDATE admins SET permissions = $1::jsonb WHERE id = $2`,
    [JSON.stringify(permissions ?? []), req.params.id],
  );
  res.json({ ok: true });
});

router.delete("/:id", requireUser, requireAdmin, async (req, res) => {
  await query(`DELETE FROM admins WHERE id = $1 AND role <> 'super_admin'`, [req.params.id]);
  res.json({ ok: true });
});

router.get("/pin", requireUser, requireAdmin, async (_req, res) => {
  const r = await query<{ pin: string }>(`SELECT pin FROM admin_pin WHERE id = 'main'`);
  res.json({ pin: r.rows[0]?.pin ?? "1234" });
});

router.put("/pin", requireUser, requireAdmin, async (req, res) => {
  const { pin } = req.body ?? {};
  await query(
    `INSERT INTO admin_pin (id, pin) VALUES ('main', $1) ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin`,
    [String(pin ?? "1234")],
  );
  res.json({ ok: true });
});

export default router;
