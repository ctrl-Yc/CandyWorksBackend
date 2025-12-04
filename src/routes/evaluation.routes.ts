import { Router } from "express";
import { EvaluationService } from "../services/EvaluationService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /evaluation/process
router.post("/process", EvaluationService.processSubmissionEvaluation);

export default router;