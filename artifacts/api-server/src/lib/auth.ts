import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import { query } from "./db";

const SUPER_ADMIN_EMAIL = "seif83470@gmail.com";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export async function getSessionUser(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  const r = await query<any>(
    `SELECT u.id, u.name, u.email, u.phone, u.created_at
     FROM sessions s JOIN users u ON s.user_id = u.id
     WHERE s.token = $1 AND s.expires_at > NOW()`,
    [token],
  );
  return r.rows[0] ?? null;
}

export function getTokenFromReq(req: Request): string | undefined {
  const auth = req.header("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return undefined;
}

export interface AuthedRequest extends Request {
  user?: SessionUser;
  isSuperAdmin?: boolean;
  adminPermissions?: string[];
}

export async function requireUser(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const user = await getSessionUser(getTokenFromReq(req));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.user = user;
  next();
}

export async function loadAdminContext(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  if (!req.user) return next();
  const r = await query<any>(
    `SELECT role, permissions FROM admins WHERE LOWER(email) = LOWER($1)`,
    [req.user.email],
  );
  const admin = r.rows[0];
  if (admin) {
    req.isSuperAdmin =
      admin.role === "super_admin" ||
      req.user.email.toLowerCase() === SUPER_ADMIN_EMAIL;
    req.adminPermissions = Array.isArray(admin.permissions)
      ? admin.permissions
      : [];
  }
  next();
}

export async function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!req.isSuperAdmin && (!req.adminPermissions || req.adminPermissions.length === 0)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

export { SUPER_ADMIN_EMAIL };
