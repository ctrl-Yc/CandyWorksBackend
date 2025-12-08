import { Router } from "express";
import { SkillService } from "../services/SkillService.js";
import { EvaluationService } from "../services/EvaluationService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// スキル更新
router.put("/update", authenticate, SkillService.updateSkill);

// 提出物評価
router.post("/evaluations", authenticate, EvaluationService.createSubmissionEvaluation);

// スキル評価
router.post("/skill-evaluations", authenticate, EvaluationService.createSkillEvaluation);


export default router;