import { Router } from "express";
import { SkillService } from "../services/SkillService.js";
import { authenticate } from "../middlewares/authMiddleware.js";


const router = Router();

// 降格・昇格を含むスキル更新API
router.put("/update", SkillService.updateSkill);

export default router;