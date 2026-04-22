import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { query } from "../lib/db";
import { generateToken, getTokenFromReq, getSessionUser } from "../lib/auth";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body ?? {};
    if (!name || !email || !password) {
      res.status(400).json({ error: "Jaza taarifa zote." });
      return;
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const exist = await query(`SELECT id FROM users WHERE LOWER(email) = $1`, [
      cleanEmail,
    ]);
    if (exist.rows.length) {
      res.status(400).json({ error: "Email hii imeshatumika. Jaribu nyingine." });
      return;
    }
    const id = `u_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const hash = await bcrypt.hash(String(password), 10);
    await query(
      `INSERT INTO users (id, name, email, phone, password_hash) VALUES ($1, $2, $3, $4, $5)`,
      [id, String(name).trim(), cleanEmail, String(phone ?? "").trim(), hash],
    );

    const token = generateToken();
    await query(
      `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '90 days')`,
      [token, id],
    );

    const user = await getSessionUser(token);
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: "Jaza email na nywila." });
      return;
    }
    const cleanEmail = String(email).toLowerCase().trim();
    const r = await query<any>(
      `SELECT id, password_hash, banned FROM users WHERE LOWER(email) = $1`,
      [cleanEmail],
    );
    if (!r.rows.length) {
      res.status(400).json({ error: "Email hii haijasajiliwa." });
      return;
    }
    if (r.rows[0].banned) {
      res.status(403).json({ error: "Akaunti yako imefungwa. Wasiliana na admin." });
      return;
    }
    const ok = await bcrypt.compare(String(password), r.rows[0].password_hash);
    if (!ok) {
      res.status(400).json({ error: "Nywila si sahihi." });
      return;
    }
    const token = generateToken();
    await query(
      `INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '90 days')`,
      [token, r.rows[0].id],
    );
    await query(
      `UPDATE users SET last_login = NOW(), login_count = COALESCE(login_count, 0) + 1 WHERE id = $1`,
      [r.rows[0].id],
    );
    const user = await getSessionUser(token);
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ error: err?.message ?? "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const token = getTokenFromReq(req);
  if (token) {
    await query(`DELETE FROM sessions WHERE token = $1`, [token]);
  }
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const user = await getSessionUser(getTokenFromReq(req));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ user });
});

export default router;
