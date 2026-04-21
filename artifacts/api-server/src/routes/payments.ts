import { Router, type IRouter, type Response, type Request } from "express";
import crypto from "node:crypto";
import { query } from "../lib/db";
import { type AuthedRequest, requireUser } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const SONIC_BASE = process.env.SONICPESA_BASE_URL || "https://api.sonicpesa.com/api/v1";
const SONIC_API_KEY = process.env.SONICPESA_API_KEY || "";
const SONIC_API_SECRET = process.env.SONICPESA_API_SECRET || "";

function normalizePhone(input: string): string {
  const digits = (input || "").replace(/\D/g, "");
  if (digits.startsWith("255")) return digits;
  if (digits.startsWith("0")) return "255" + digits.slice(1);
  if (digits.length === 9) return "255" + digits;
  return digits;
}

async function unlockTicket(userId: string, tipsterId: number) {
  await query(
    `INSERT INTO unlocked_tickets (user_id, tipster_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [String(userId), Number(tipsterId)],
  );
}

async function applyStatus(orderRow: any, payload: any) {
  const status = String(payload?.payment_status || payload?.status || orderRow.status || "PENDING").toUpperCase();
  await query(
    `UPDATE payment_orders
       SET status = $1,
           channel = COALESCE(NULLIF($2, ''), channel),
           reference = COALESCE(NULLIF($3, ''), reference),
           transid = COALESCE(NULLIF($4, ''), transid),
           updated_at = NOW()
     WHERE order_id = $5`,
    [
      status,
      String(payload?.channel ?? ""),
      String(payload?.reference ?? ""),
      String(payload?.transid ?? ""),
      orderRow.order_id,
    ],
  );
  if (status === "SUCCESS") {
    await unlockTicket(orderRow.user_id, Number(orderRow.tipster_id));
  }
  return status;
}

// Create order — call SonicPesa, save row, return order_id
router.post("/sonicpesa/create", requireUser, async (req: AuthedRequest, res: Response) => {
  const u = req.user!;
  const { tipster_id, tipster_name, amount, phone } = req.body ?? {};
  const tipsterId = Number(tipster_id);
  const amt = Number(amount);
  const buyerPhone = normalizePhone(String(phone || u.phone || ""));

  if (!tipsterId || !amt || !buyerPhone) {
    res.status(400).json({ error: "tipster_id, amount, and phone are required" });
    return;
  }
  if (!SONIC_API_KEY) {
    res.status(500).json({ error: "Payment provider not configured" });
    return;
  }

  try {
    const r = await fetch(`${SONIC_BASE}/payment/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": SONIC_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({
        buyer_email: u.email,
        buyer_name: u.name,
        buyer_phone: buyerPhone,
        amount: amt,
        currency: "TZS",
      }),
    });

    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { /* keep text */ }

    if (!r.ok || json?.status !== "success" || !json?.data?.order_id) {
      logger.warn({ status: r.status, body: text }, "SonicPesa create_order failed");
      const code = String(json?.resultcode || json?.data?.resultcode || "");
      const rawMsg = String(json?.message || json?.data?.message || "");
      // Translate common SonicPesa error codes to clear Swahili
      let friendly = rawMsg;
      if (code === "9009" || /balance.*not enough/i.test(rawMsg)) {
        friendly = "Salio la simu yako halitoshi. Tafadhali ongeza salio kisha jaribu tena.";
      } else if (/invalid.*phone|phone.*invalid/i.test(rawMsg)) {
        friendly = "Namba ya simu si sahihi. Tumia namba ya M-Pesa, Tigo, Halo au Airtel inayotumika.";
      } else if (/timeout/i.test(rawMsg)) {
        friendly = "Mtandao wa malipo umechelewa. Jaribu tena baada ya sekunde chache.";
      } else if (!friendly) {
        friendly = "Imeshindwa kuanzisha malipo. Hakikisha namba ni sahihi na una salio.";
      }
      res.status(400).json({ error: friendly, code });
      return;
    }

    const orderId = String(json.data.order_id);
    await query(
      `INSERT INTO payment_orders
        (order_id, user_id, user_name, user_email, user_phone, tipster_id, tipster_name, amount, currency, status, reference)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'TZS',$9,$10)
       ON CONFLICT (order_id) DO NOTHING`,
      [
        orderId,
        u.id,
        u.name,
        u.email,
        buyerPhone,
        tipsterId,
        String(tipster_name ?? ""),
        amt,
        String(json.data.payment_status || "PENDING"),
        String(json.data.reference ?? ""),
      ],
    );

    res.json({
      order_id: orderId,
      reference: json.data.reference || null,
      status: json.data.payment_status || "PENDING",
      message: json.message || "Push USSD imetumwa kwenye simu yako.",
    });
  } catch (err) {
    logger.error({ err }, "SonicPesa create_order error");
    res.status(502).json({ error: "Tatizo la mtandao. Jaribu tena." });
  }
});

// Check status — also re-syncs with SonicPesa and unlocks if SUCCESS
router.get("/sonicpesa/status/:orderId", requireUser, async (req: AuthedRequest, res: Response) => {
  const u = req.user!;
  const orderId = String(req.params.orderId);

  const row = await query<any>(
    `SELECT * FROM payment_orders WHERE order_id = $1 AND user_id = $2`,
    [orderId, u.id],
  );
  if (row.rowCount === 0) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const order = row.rows[0];

  // If already success in DB, just return
  if (String(order.status).toUpperCase() === "SUCCESS") {
    res.json({ status: "SUCCESS", order });
    return;
  }

  // Otherwise poll SonicPesa
  try {
    const r = await fetch(`${SONIC_BASE}/payment/order_status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": SONIC_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ order_id: orderId }),
    });
    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { /* keep */ }

    const data = json?.data || {};
    const status = await applyStatus(order, data);
    res.json({ status, order: { ...order, status } });
  } catch (err) {
    logger.error({ err }, "SonicPesa order_status error");
    res.json({ status: order.status, order });
  }
});

// Webhook — verify HMAC and unlock ticket
router.post("/sonicpesa/webhook", async (req: Request, res: Response) => {
  try {
    const signature = String(
      req.header("X-SonicPesa-Signature") || req.header("x-sonicpesa-signature") || "",
    );
    const raw = (req as any).rawBody as string | undefined;
    const payloadRaw = raw ?? JSON.stringify(req.body ?? {});

    if (SONIC_API_SECRET) {
      const expected = crypto
        .createHmac("sha256", SONIC_API_SECRET)
        .update(payloadRaw)
        .digest("hex");
      const ok =
        signature.length > 0 &&
        signature.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
      if (!ok) {
        logger.warn({ signature }, "SonicPesa webhook signature mismatch");
        res.status(401).json({ error: "Invalid signature" });
        return;
      }
    }

    const body = req.body ?? {};
    const orderId = String(body.order_id || "");
    if (!orderId) {
      res.status(400).json({ error: "Missing order_id" });
      return;
    }

    const row = await query<any>(
      `SELECT * FROM payment_orders WHERE order_id = $1`,
      [orderId],
    );
    if (row.rowCount === 0) {
      logger.warn({ orderId }, "SonicPesa webhook for unknown order");
      res.json({ ok: true });
      return;
    }

    await applyStatus(row.rows[0], body);
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "SonicPesa webhook error");
    res.status(500).json({ error: "Webhook error" });
  }
});

export default router;
