import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import adminsRouter from "./admins";
import requestsRouter from "./requests";
import bannersRouter from "./banners";
import contentRouter from "./content";
import { loadAdminContext, requireUser } from "../lib/auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", requireUser, loadAdminContext, usersRouter);
router.use("/admins", requireUser, loadAdminContext, adminsRouter);
router.use("/requests", requireUser, loadAdminContext, requestsRouter);
router.use("/banners", bannersRouter);
router.use("/content", contentRouter);

export default router;
