import { Router, type IRouter } from "express";
import { query } from "../lib/db";
import { requireUser, requireAdmin } from "../lib/auth";

const router: IRouter = Router();

function makeCrud(tableName: string, pathPrefix: string) {
  const r: IRouter = Router();

  r.get("/", async (_req, res) => {
    const result = await query<{ data: any }>(`SELECT data FROM ${tableName} ORDER BY id`);
    res.json({ items: result.rows.map((x) => x.data) });
  });

  r.post("/", requireUser, requireAdmin, async (req, res) => {
    const item = req.body ?? {};
    const id = Number(item.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "id must be a number" });
      return;
    }
    await query(
      `INSERT INTO ${tableName} (id, data, updated_at) VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
      [id, JSON.stringify(item)],
    );
    res.json({ ok: true });
  });

  r.put("/bulk", requireUser, requireAdmin, async (req, res) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : [];
    await query(`DELETE FROM ${tableName}`);
    for (const it of items) {
      const id = Number(it.id);
      if (!Number.isFinite(id)) continue;
      await query(
        `INSERT INTO ${tableName} (id, data) VALUES ($1, $2::jsonb)`,
        [id, JSON.stringify(it)],
      );
    }
    res.json({ ok: true });
  });

  r.delete("/:id", requireUser, requireAdmin, async (req, res) => {
    await query(`DELETE FROM ${tableName} WHERE id = $1`, [Number(req.params.id)]);
    res.json({ ok: true });
  });

  router.use(pathPrefix, r);
}

makeCrud("tipsters", "/tipsters");
makeCrud("history_entries", "/history");
makeCrud("packages", "/packages");

router.get("/settings", async (_req, res) => {
  const r = await query<{ data: any }>(`SELECT data FROM app_settings WHERE id = 'main'`);
  res.json({ settings: r.rows[0]?.data ?? null });
});

router.put("/settings", requireUser, requireAdmin, async (req, res) => {
  await query(
    `INSERT INTO app_settings (id, data, updated_at) VALUES ('main', $1::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    [JSON.stringify(req.body ?? {})],
  );
  res.json({ ok: true });
});

export default router;
