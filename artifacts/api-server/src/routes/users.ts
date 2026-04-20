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
    `SELECT id, name, email, phone, created_at FROM users ORDER BY created_at DESC`,
  );
  res.json({ users: r.rows });
});

router.delete("/:id", requireUser, requireAdmin, async (req, res) => {
  await query(`DELETE FROM unlocked_tickets WHERE user_id = $1`, [req.params.id]);
  await query(`DELETE FROM sessions WHERE user_id = $1`, [req.params.id]);
  await query(`DELETE FROM ticket_requests WHERE user_id = $1`, [req.params.id]);
  await query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

router.get("/me/unlocked", requireUser, async (req: AuthedRequest, res: Response) => {
  const r = await query<{ tipster_id: number }>(
    `SELECT tipster_id FROM unlocked_tickets WHERE user_id = $1`,
    [req.user!.id],
  );
  res.json({ tipsterIds: r.rows.map((x) => x.tipster_id) });
});

export default router;
