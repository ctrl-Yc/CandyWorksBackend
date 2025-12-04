import { Router } from "express";
import { UserService } from "../services/UserService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.put("/profile", UserService.updateProfile);
router.put("/email", UserService.updateEmail);
router.put("/password", UserService.updatePassword);

export default router;
