import { Router } from "express";
import { SubmissionService } from "../services/SubmissionService.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

// 挑戦開始
router.post("/submissions/start", authenticate, SubmissionService.startSubmission);

// ステップ写真保存（提出物＋個人履歴）
router.post("/submissions/photo", authenticate, SubmissionService.saveSubmissionStepPhoto);

// 挑戦完了
router.post("/submissions/complete", authenticate, SubmissionService.completeSubmission);

// 提出物詳細（自分の提出物のみ）
router.get("/submissions/:submission_id", authenticate, SubmissionService.getSubmissionDetail);

export default router;