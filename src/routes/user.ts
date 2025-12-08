import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/profile", authenticate, UserService.updateProfile);
router.put("/email", authenticate, UserService.updateEmail);
router.put("/password", authenticate, UserService.updatePassword);

export default router;
