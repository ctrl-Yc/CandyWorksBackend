import { Router } from "express";
import { RecipeService } from "../services/RecipeService.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

// 管理者のみ POST
router.post("/recipes", authenticate, RecipeService.createRecipe);

// ユーザー用 GET 一覧
router.get("/recipes", authenticate, RecipeService.getRecipes);

// ユーザー用 GET 個別
router.get("/recipes/:id", authenticate, RecipeService.getRecipeById);

// ユーザー用 オススメ料理一覧取得
router.get("/recipes/recommended", authenticate, RecipeService.getRecommendedRecipes);

// ユーザー用 スキル別料理一覧取得
router.get("/recipes/challenge", authenticate, RecipeService.getChallengeRecipes);

// ユーザー用 挑戦料理の詳細取得
router.get("/recipes/challenge/detail/:recipe_id", authenticate, RecipeService.getRecipeDetailForChallenge);

// 写真保存 API
router.post("/recipes/challenge/photo", authenticate, RecipeService.saveStepPhoto);
export default router;