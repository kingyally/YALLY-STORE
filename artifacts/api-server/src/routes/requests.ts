import { Router, type IRouter, type Response } from "express";
import { query } from "../lib/db";
import {
  type AuthedRequest,
  requireUser,
  requireAdmin,
} from "../lib/auth";

const router: IRouter = Router();

router.get("/", requireUser, requireAdmin, async (_req, res) => {
  const r = await query<any>(
    `SELECT * FROM ticket_requests ORDER BY created_at DESC`,
  );
  res.json({ requests: r.rows });
});

router.post("/", requireUser, async (req: AuthedRequest, res: Response) => {
  const u = req.user!;
  const {
    tipster_id,
    tipster_name,
    amount,
    payment_number,
    payment_method,
  } = req.body ?? {};
  const id = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await query(
    `INSERT INTO ticket_requests
      (id, user_id, user_name, user_phone, user_email, tipster_id, tipster_name, amount, payment_number, payment_method, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')`,
    [
      id,
      u.id,
      u.name,
      u.phone,
      u.email,
      Number(tipster_id),
      String(tipster_name ?? ""),
      Number(amount ?? 0),
      String(payment_number ?? ""),
      String(payment_method ?? ""),
    ],
  );
  const r = await query<any>(`SELECT * FROM ticket_requests WHERE id = $1`, [id]);
  res.json({ request: r.rows[0] });
});

router.put("/:id/status", requireUser, requireAdmin, async (req, res) => {
  const { status, tipsterId, userId } = req.body ?? {};
  if (!["approved", "rejected"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  await query(`UPDATE ticket_requests SET status = $1 WHERE id = $2`, [status, req.params.id]);
  if (status === "approved" && tipsterId && userId) {
    await query(
      `INSERT INTO unlocked_tickets (user_id, tipster_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [String(userId), Number(tipsterId)],
    );
  }
  res.json({ ok: true });
});

export default router;
