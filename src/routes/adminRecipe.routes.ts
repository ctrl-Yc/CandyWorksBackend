import { Router } from "express";
import { AdminRecipeService } from "../services/AdminRecipeService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// POST /admin/recipes
router.post("/recipes", AdminRecipeService.createRecipe);

export default router;