import { Router } from "express";
import { requireAuth } from "../../shared/require-auth.js";
import * as controller from "./auth.controller.js";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
router.get("/me", requireAuth, controller.me);

export default router;
