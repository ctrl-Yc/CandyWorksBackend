import { Router } from "express";
import { SkillService } from "../services/SkillService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/update", authenticate, SkillService.updateSkill);

export default router;