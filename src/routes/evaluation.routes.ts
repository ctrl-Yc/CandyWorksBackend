import { Router } from "express";
import { EvaluationService } from "../services/EvaluationService.js";

const router = Router();

// POST /evaluation/process
router.post("/process", EvaluationService.processSubmissionEvaluation);

export default router;
