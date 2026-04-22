import { query } from "./db";

export async function logActivity(opts: {
  actorEmail?: string;
  actorRole?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO activity_log (actor_email, actor_role, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
      [
        opts.actorEmail ?? "",
        opts.actorRole ?? "",
        opts.action,
        opts.targetType ?? "",
        opts.targetId ?? "",
        JSON.stringify(opts.details ?? {}),
      ],
    );
  } catch (err) {
    console.error("[activity] failed to log:", err);
  }
}

export function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}
