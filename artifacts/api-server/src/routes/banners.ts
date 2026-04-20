import { Router, type IRouter } from "express";
import { query } from "../lib/db";
import { requireUser, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

// Public: anyone can view active banners
router.get("/", async (_req, res) => {
  const r = await query<any>(
    `SELECT id, image_url, sort_order, active, created_at FROM banners ORDER BY sort_order, created_at`,
  );
  res.json({ banners: r.rows });
});

router.post("/", requireUser, requireAdmin, async (req, res) => {
  const { image_url, sort_order } = req.body ?? {};
  const id = `banner_${Date.now()}`;
  await query(
    `INSERT INTO banners (id, image_url, sort_order, active) VALUES ($1, $2, $3, true)`,
    [id, String(image_url ?? ""), Number(sort_order ?? 0)],
  );
  const r = await query(`SELECT * FROM banners WHERE id = $1`, [id]);
  res.json({ banner: r.rows[0] });
});

router.put("/:id", requireUser, requireAdmin, async (req, res) => {
  const { image_url, sort_order, active } = req.body ?? {};
  const sets: string[] = [];
  const vals: any[] = [];
  let i = 1;
  if (image_url !== undefined) { sets.push(`image_url = $${i++}`); vals.push(image_url); }
  if (sort_order !== undefined) { sets.push(`sort_order = $${i++}`); vals.push(Number(sort_order)); }
  if (active !== undefined) { sets.push(`active = $${i++}`); vals.push(Boolean(active)); }
  if (!sets.length) { res.json({ ok: true }); return; }
  vals.push(req.params.id);
  await query(`UPDATE banners SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  res.json({ ok: true });
});

router.delete("/:id", requireUser, requireAdmin, async (req, res) => {
  await query(`DELETE FROM banners WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
