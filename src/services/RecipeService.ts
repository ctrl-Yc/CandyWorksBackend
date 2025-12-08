import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export class RecipeService {
  // 管理者のみ: レシピ作成
  static async createRecipe(req: Request, res: Response) {
    if (req.headers["content-type"] !== "application/json") {
      return res.status(415).json({ error: "Invalid content type." });
    }

    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    // 管理者チェック
    const { data: roleCheck } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", userId) // ✅ u_id → user_id に修正
      .single();

    if (!roleCheck || roleCheck.role !== "admin") {
      return res.status(403).json({ error: "Forbidden. Admin only." });
    }

    const {
      title,
      description,
      difficulty,
      finish_url,
      skills,       // [{ skill_id }]
      ingredients,  // [{ name, quantity, unit, order_index, note }]
      steps         // [{ step_number, instruction, skill_id, requires_photo, images: [url1, url2] }]
    } = req.body;

    // ✅ recipes を作成
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({ title, description, difficulty, finish_url })
      .select()
      .single();

    if (recipeError) {
      console.error(recipeError);
      return res.status(400).json({ error: "Failed to create recipe." });
    }

    const recipe_id = recipe.recipe_id;

    // ✅ recipe_skills を登録
    for (const { skill_id } of skills ?? []) {
      const { error } = await supabase.from("recipe_skills").insert({ recipe_id, skill_id });
      if (error) {
        console.error(error);
        return res.status(400).json({ error: "Failed to insert recipe_skills." });
      }
    }

    // ✅ recipe_ingredients を登録
    for (const ing of ingredients ?? []) {
      const { error } = await supabase.from("recipe_ingredients").insert({
        recipe_id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        order_index: ing.order_index,
        note: ing.note,
      });
      if (error) {
        console.error(error);
        return res.status(400).json({ error: "Failed to insert ingredients." });
      }
    }

    // ✅ recipe_steps と recipe_step_images を登録
    for (const step of steps ?? []) {
      // 複数ステップを1件ずつ登録
      const { data: stepRecord, error: stepError } = await supabase
        .from("recipe_steps")
        .insert({
          recipe_id, // ← 1レシピに複数ステップ紐付け
          step_number: step.step_number,
          instruction: step.instruction,
          skill_id: step.skill_id,
          requires_photo: step.requires_photo,
        })
        .select()
        .single();

      if (stepError) {
        console.error(stepError);
        return res.status(400).json({ error: "Failed to insert recipe step." });
      }

      const step_id = stepRecord.step_id;

      // ✅ 各ステップに複数画像を紐付け
      for (const url of step.images ?? []) {
        const { error: imgError } = await supabase
          .from("recipe_step_images")
          .insert({ step_id, image_url: url });

        if (imgError) {
          console.error(imgError);
          return res.status(400).json({ error: "Failed to insert step image." });
        }
      }
    }

    return res.json({ message: "Recipe created successfully.", recipe_id });
  }

  // ユーザー用: オススメ料理
  static async getRecommendedRecipes(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    // ユーザーのランク取得
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("rank")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      console.error(userError);
      return res.status(400).json({ error: "Failed to fetch user rank." });
    }

    // ランクと難易度が一致するレシピを取得
    const { data: recipes, error: recipeError } = await supabase
      .from("recipes")
      .select("recipe_id, title, finish_url") // ✅ 必要な情報だけ取得
      .eq("difficulty", user.rank);

    if (recipeError) {
      console.error(recipeError);
      return res.status(400).json({ error: "Failed to fetch recipes." });
    }

    // ランダムに3件選択
    const shuffled = recipes.sort(() => 0.5 - Math.random());
    const recommended = shuffled.slice(0, 3);

    // ✅ フロント用に完成画像と料理名のみ返す
    const result = recommended.map(r => ({
      recipe_id: r.recipe_id,
      title: r.title,
      image_url: r.finish_url,
    }));

    return res.json(result);
  }

  // ユーザー用: 挑戦料理（スキル選択）
  static async getChallengeRecipes(req: Request, res: Response) {
    const { skill_id } = req.params;

    // skill_id に紐づくレシピを取得
    const { data, error } = await supabase
      .from("recipe_skills")
      .select("recipes(recipe_id, title, finish_url)")
      .eq("skill_id", skill_id);

    if (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to fetch challenge recipes." });
    }

    // 必要な情報だけ返す（画像と料理名）
    const challengeRecipes = data.map((item: any) => ({
      recipe_id: item.recipes.recipe_id,
      title: item.recipes.title,
      image_url: item.recipes.finish_url,
    }));

    return res.json(challengeRecipes);
  }

  // ユーザー用: 挑戦料理の詳細取得
  static async getRecipeDetailForChallenge(req: Request, res: Response) {
    const { recipe_id } = req.params;

    // ✅ レシピ本体を取得
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("recipe_id, title, finish_url")
      .eq("recipe_id", recipe_id)
      .single();

    if (recipeError || !recipe) {
      console.error(recipeError);
      return res.status(404).json({ error: "Recipe not found." });
    }

    // ✅ 材料一覧を order_index 順に取得
    const { data: ingredients, error: ingError } = await supabase
      .from("recipe_ingredients")
      .select("name, quantity, unit, note")
      .eq("recipe_id", recipe_id)
      .order("order_index", { ascending: true });

    if (ingError) {
      console.error(ingError);
      return res.status(400).json({ error: "Failed to fetch ingredients." });
    }

    // ✅ フロント用に整形して返す
    return res.json({
      recipe_id: recipe.recipe_id,
      title: recipe.title,
      image_url: recipe.finish_url,
      ingredients: ingredients.map(i => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        note: i.note,
      })),
    });
  }

  // ユーザー用: ステップ写真保存
  static async saveStepPhoto(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const { recipe_id, step_id, image_url } = req.body;

    if (!recipe_id || !step_id || !image_url) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // ✅ step_photos に保存
    const { error } = await supabase.from("step_photos").insert({
      user_id: userId,
      recipe_id,
      step_id,
      image_url,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to save step photo." });
    }

    return res.json({ message: "Step photo saved successfully." });
  }

  // ユーザー用: レシピ一覧取得
  static async getRecipes(req: Request, res: Response) {
    const { data, error } = await supabase.from("recipes").select("*");

    if (error) {
      console.error(error);
      return res.status(400).json({ error: "Failed to fetch recipes." });
    }

    return res.json(data);
  }

  // ユーザー用: 個別レシピ取得
  static async getRecipeById(req: Request, res: Response) {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("recipe_id", id)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ error: "Recipe not found." });
    }

    return res.json(data);
  }
}