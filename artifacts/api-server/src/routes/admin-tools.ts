import { Router, type IRouter, type Response } from "express";
import { query } from "../lib/db";
import { type AuthedRequest, requireUser, requireAdmin } from "../lib/auth";
import { logActivity, rowsToCsv } from "../lib/activity";

const router: IRouter = Router();

// ----- DASHBOARD STATS -----
router.get("/stats", requireUser, requireAdmin, async (_req, res) => {
  const [
    usersTotal,
    usersToday,
    usersWeek,
    usersBanned,
    requestsTotal,
    requestsPending,
    requestsApproved,
    revenueTotal,
    revenueToday,
    revenueWeek,
    paymentsSuccess,
    paymentsPending,
    activeNow,
    topTipsters,
    dailyChart,
  ] = await Promise.all([
    query<any>(`SELECT COUNT(*)::int AS c FROM users`),
    query<any>(`SELECT COUNT(*)::int AS c FROM users WHERE created_at >= NOW() - INTERVAL '1 day'`),
    query<any>(`SELECT COUNT(*)::int AS c FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`),
    query<any>(`SELECT COUNT(*)::int AS c FROM users WHERE banned = true`),
    query<any>(`SELECT COUNT(*)::int AS c FROM ticket_requests`),
    query<any>(`SELECT COUNT(*)::int AS c FROM ticket_requests WHERE status = 'pending'`),
    query<any>(`SELECT COUNT(*)::int AS c FROM ticket_requests WHERE status = 'approved'`),
    query<any>(`SELECT COALESCE(SUM(amount), 0)::float AS s FROM ticket_requests WHERE status = 'approved'`),
    query<any>(`SELECT COALESCE(SUM(amount), 0)::float AS s FROM ticket_requests WHERE status = 'approved' AND created_at >= NOW() - INTERVAL '1 day'`),
    query<any>(`SELECT COALESCE(SUM(amount), 0)::float AS s FROM ticket_requests WHERE status = 'approved' AND created_at >= NOW() - INTERVAL '7 days'`),
    query<any>(`SELECT COUNT(*)::int AS c FROM payment_orders WHERE status = 'SUCCESS'`),
    query<any>(`SELECT COUNT(*)::int AS c FROM payment_orders WHERE status = 'PENDING'`),
    query<any>(`SELECT COUNT(DISTINCT user_id)::int AS c FROM sessions WHERE expires_at > NOW() AND created_at > NOW() - INTERVAL '24 hours'`),
    query<any>(
      `SELECT tipster_name, COUNT(*)::int AS unlocks, COALESCE(SUM(amount),0)::float AS revenue
       FROM ticket_requests WHERE status = 'approved'
       GROUP BY tipster_name ORDER BY unlocks DESC LIMIT 5`,
    ),
    query<any>(
      `SELECT TO_CHAR(d::date, 'YYYY-MM-DD') AS day,
        COALESCE(u.users, 0)::int AS users,
        COALESCE(r.revenue, 0)::float AS revenue,
        COALESCE(r.requests, 0)::int AS requests
       FROM generate_series(NOW()::date - INTERVAL '6 days', NOW()::date, '1 day'::interval) d
       LEFT JOIN (
         SELECT created_at::date AS day, COUNT(*) AS users FROM users
         WHERE created_at >= NOW() - INTERVAL '7 days' GROUP BY created_at::date
       ) u ON u.day = d::date
       LEFT JOIN (
         SELECT created_at::date AS day, SUM(amount) AS revenue, COUNT(*) AS requests
         FROM ticket_requests WHERE status = 'approved' AND created_at >= NOW() - INTERVAL '7 days'
         GROUP BY created_at::date
       ) r ON r.day = d::date
       ORDER BY day`,
    ),
  ]);

  res.json({
    users: {
      total: usersTotal.rows[0].c,
      today: usersToday.rows[0].c,
      week: usersWeek.rows[0].c,
      banned: usersBanned.rows[0].c,
      activeNow: activeNow.rows[0].c,
    },
    requests: {
      total: requestsTotal.rows[0].c,
      pending: requestsPending.rows[0].c,
      approved: requestsApproved.rows[0].c,
    },
    revenue: {
      total: revenueTotal.rows[0].s,
      today: revenueToday.rows[0].s,
      week: revenueWeek.rows[0].s,
    },
    payments: {
      success: paymentsSuccess.rows[0].c,
      pending: paymentsPending.rows[0].c,
    },
    topTipsters: topTipsters.rows,
    dailyChart: dailyChart.rows,
  });
});

// ----- USERS: ban / unban / details / search -----
router.put("/users/:id/ban", requireUser, requireAdmin, async (req: AuthedRequest, res: Response) => {
  const { banned } = req.body ?? {};
  await query(`UPDATE users SET banned = $1 WHERE id = $2`, [!!banned, req.params.id]);
  if (banned) {
    await query(`DELETE FROM sessions WHERE user_id = $1`, [req.params.id]);
  }
  await logActivity({
    actorEmail: req.user?.email,
    actorRole: req.isSuperAdmin ? "super_admin" : "admin",
    action: banned ? "user_ban" : "user_unban",
    targetType: "user",
    targetId: String(req.params.id),
  });
  res.json({ ok: true });
});

router.get("/users/:id/details", requireUser, requireAdmin, async (req, res) => {
  const u = await query<any>(
    `SELECT id, name, email, phone, banned, last_login, login_count, notes, created_at FROM users WHERE id = $1`,
    [req.params.id],
  );
  if (!u.rows.length) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [requests, unlocked, payments] = await Promise.all([
    query<any>(`SELECT * FROM ticket_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.params.id]),
    query<any>(`SELECT * FROM unlocked_tickets WHERE user_id = $1`, [req.params.id]),
    query<any>(`SELECT * FROM payment_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.params.id]),
  ]);
  res.json({
    user: u.rows[0],
    requests: requests.rows,
    unlocked: unlocked.rows,
    payments: payments.rows,
    totalSpent: requests.rows.filter((r: any) => r.status === "approved").reduce((s: number, r: any) => s + Number(r.amount || 0), 0),
  });
});

router.put("/users/:id/notes", requireUser, requireAdmin, async (req: AuthedRequest, res: Response) => {
  const { notes } = req.body ?? {};
  await query(`UPDATE users SET notes = $1 WHERE id = $2`, [String(notes ?? ""), req.params.id]);
  await logActivity({
    actorEmail: req.user?.email,
    actorRole: req.isSuperAdmin ? "super_admin" : "admin",
    action: "user_notes_update",
    targetType: "user",
    targetId: String(req.params.id),
  });
  res.json({ ok: true });
});

// Enhanced users list with extra fields + search
router.get("/users-enhanced", requireUser, requireAdmin, async (req, res) => {
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const filter = String(req.query.filter ?? "all"); // all | active | banned | new
  const params: any[] = [];
  const where: string[] = [];
  if (search) {
    params.push(`%${search}%`);
    where.push(`(LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR phone LIKE $${params.length})`);
  }
  if (filter === "banned") where.push(`banned = true`);
  if (filter === "active") where.push(`(banned = false OR banned IS NULL)`);
  if (filter === "new") where.push(`created_at >= NOW() - INTERVAL '7 days'`);
  const sql = `SELECT id, name, email, phone, COALESCE(banned, false) AS banned, last_login, COALESCE(login_count, 0) AS login_count, COALESCE(notes, '') AS notes, created_at
               FROM users ${where.length ? "WHERE " + where.join(" AND ") : ""}
               ORDER BY created_at DESC LIMIT 500`;
  const r = await query<any>(sql, params);
  res.json({ users: r.rows });
});

// ----- BROADCASTS -----
router.get("/broadcasts", requireUser, requireAdmin, async (_req, res) => {
  const r = await query<any>(`SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 100`);
  res.json({ broadcasts: r.rows });
});

router.post("/broadcasts", requireUser, requireAdmin, async (req: AuthedRequest, res: Response) => {
  const { title, message, audience } = req.body ?? {};
  if (!title || !message) {
    res.status(400).json({ error: "Jaza title na message." });
    return;
  }
  const aud = ["all", "vip", "new"].includes(String(audience)) ? String(audience) : "all";
  let userIds: string[] = [];
  if (aud === "all") {
    const r = await query<any>(`SELECT id FROM users WHERE COALESCE(banned, false) = false`);
    userIds = r.rows.map((x: any) => x.id);
  } else if (aud === "vip") {
    const r = await query<any>(`SELECT DISTINCT user_id AS id FROM unlocked_tickets`);
    userIds = r.rows.map((x: any) => x.id);
  } else if (aud === "new") {
    const r = await query<any>(`SELECT id FROM users WHERE created_at >= NOW() - INTERVAL '7 days' AND COALESCE(banned, false) = false`);
    userIds = r.rows.map((x: any) => x.id);
  }
  const ins = await query<any>(
    `INSERT INTO broadcasts (title, message, audience, sent_by, sent_count) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [String(title), String(message), aud, req.user?.email ?? "", userIds.length],
  );
  const broadcastId = ins.rows[0].id;
  for (const uid of userIds) {
    await query(
      `INSERT INTO user_notifications (user_id, broadcast_id, title, message) VALUES ($1, $2, $3, $4)`,
      [uid, broadcastId, String(title), String(message)],
    );
  }
  await logActivity({
    actorEmail: req.user?.email,
    actorRole: req.isSuperAdmin ? "super_admin" : "admin",
    action: "broadcast_send",
    targetType: "broadcast",
    targetId: String(broadcastId),
    details: { audience: aud, count: userIds.length },
  });
  res.json({ ok: true, broadcastId, sentCount: userIds.length });
});

router.delete("/broadcasts/:id", requireUser, requireAdmin, async (req, res) => {
  await query(`DELETE FROM user_notifications WHERE broadcast_id = $1`, [req.params.id]);
  await query(`DELETE FROM broadcasts WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

// ----- USER NOTIFICATIONS (read-side) -----
router.get("/notifications/me", requireUser, async (req: AuthedRequest, res: Response) => {
  const r = await query<any>(
    `SELECT id, title, message, read, created_at FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [req.user!.id],
  );
  res.json({ notifications: r.rows });
});

router.post("/notifications/me/read", requireUser, async (req: AuthedRequest, res: Response) => {
  await query(`UPDATE user_notifications SET read = true WHERE user_id = $1`, [req.user!.id]);
  res.json({ ok: true });
});

// ----- ACTIVITY LOG -----
router.get("/activity-log", requireUser, requireAdmin, async (req, res) => {
  const limit = Math.max(1, Math.min(parseInt(String(req.query.limit ?? "100"), 10) || 100, 500));
  const r = await query<any>(
    `SELECT * FROM activity_log ORDER BY created_at DESC LIMIT $1`,
    [limit],
  );
  res.json({ entries: r.rows });
});

// ----- QUICK ACTIONS -----
router.post("/quick/approve-all-pending", requireUser, requireAdmin, async (req: AuthedRequest, res: Response) => {
  const r = await query<any>(`UPDATE ticket_requests SET status = 'approved' WHERE status = 'pending' RETURNING id, user_id, tipster_id`);
  for (const row of r.rows) {
    await query(
      `INSERT INTO unlocked_tickets (user_id, tipster_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [row.user_id, row.tipster_id],
    );
  }
  await logActivity({
    actorEmail: req.user?.email,
    actorRole: req.isSuperAdmin ? "super_admin" : "admin",
    action: "quick_approve_all",
    details: { count: r.rows.length },
  });
  res.json({ ok: true, approved: r.rows.length });
});

// ----- CSV EXPORTS -----
router.get("/export/:type", requireUser, requireAdmin, async (req: AuthedRequest, res: Response) => {
  const t = req.params.type;
  let rows: any[] = [];
  if (t === "users") {
    const r = await query<any>(`SELECT id, name, email, phone, banned, login_count, last_login, created_at FROM users ORDER BY created_at DESC`);
    rows = r.rows;
  } else if (t === "requests") {
    const r = await query<any>(`SELECT id, user_name, user_email, user_phone, tipster_name, amount, payment_method, payment_number, status, created_at FROM ticket_requests ORDER BY created_at DESC`);
    rows = r.rows;
  } else if (t === "payments") {
    const r = await query<any>(`SELECT order_id, user_name, user_email, user_phone, tipster_name, amount, currency, status, channel, reference, transid, created_at FROM payment_orders ORDER BY created_at DESC`);
    rows = r.rows;
  } else if (t === "activity") {
    const r = await query<any>(`SELECT id, actor_email, actor_role, action, target_type, target_id, details, created_at FROM activity_log ORDER BY created_at DESC LIMIT 5000`);
    rows = r.rows;
  } else {
    res.status(400).json({ error: "Aina si sahihi" });
    return;
  }
  const csv = rowsToCsv(rows);
  await logActivity({
    actorEmail: req.user?.email,
    actorRole: req.isSuperAdmin ? "super_admin" : "admin",
    action: "export_csv",
    targetType: t,
    details: { rows: rows.length },
  });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${t}-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

export default router;
