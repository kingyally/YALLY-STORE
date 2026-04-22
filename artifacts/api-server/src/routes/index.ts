import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import adminsRouter from "./admins";
import requestsRouter from "./requests";
import bannersRouter from "./banners";
import contentRouter from "./content";
import paymentsRouter from "./payments";
import adminToolsRouter from "./admin-tools";
import { loadAdminContext, requireUser } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", requireUser, loadAdminContext, usersRouter);
router.use("/admins", requireUser, loadAdminContext, adminsRouter);
router.use("/requests", requireUser, loadAdminContext, requestsRouter);
router.use("/banners", requireUser, loadAdminContext, bannersRouter);
router.use("/content", (req, res, next) => {
  // GET routes are public; only protect mutations with auth+admin context
  if (req.method === "GET") return next();
  return requireUser(req as any, res, (err?: any) => {
    if (err) return next(err);
    return loadAdminContext(req as any, res, next);
  });
}, contentRouter);
router.use("/payments", paymentsRouter);
router.use("/admin-tools", requireUser, loadAdminContext, adminToolsRouter);

export default router;
