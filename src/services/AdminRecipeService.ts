import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export class AdminRecipeService {
  static async createRecipe(req: Request, res: Response) {
    if (req.headers["content-type"] !== "application/json") {
      return res.status(415).json({ error: "Invalid content type." });
    }

    const {
      title,
      description,
      difficulty,
      finish_url,
      skills,       // [{ sk_id }]
      ingredients,  // [{ name, quantity, unit, order_index, note }]
      steps         // [{ step_number, instruction, sk_id, requires_photo, images: [url1, url2] }]
    } = req.body;

    // ✅ 認証 (Node.jsではJWTをreq.userに展開している想定)
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    // ✅ 管理者チェック
    const { data: roleCheck } = await supabase
      .from("users")
      .select("role")
      .eq("u_id", userId)
      .single();

    if (!roleCheck || roleCheck.role !== "admin") {
      return res.status(403).json({ error: "Forbidden. Admin only." });
    }

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

    const r_id = recipe.r_id;

    // ✅ recipe_skills を登録
    for (const { sk_id } of skills ?? []) {
      const { error } = await supabase.from("recipe_skills").insert({ r_id, sk_id });
      if (error) {
        console.error(error);
        return res.status(400).json({ error: "Failed to insert recipe_skills." });
      }
    }

    // ✅ recipe_ingredients を登録
    for (const ing of ingredients ?? []) {
      const { error } = await supabase.from("recipe_ingredients").insert({
        r_id,
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
      const { data: stepRecord, error: stepError } = await supabase
        .from("recipe_steps")
        .insert({
          r_id,
          step_number: step.step_number,
          instruction: step.instruction,
          sk_id: step.sk_id,
          requires_photo: step.requires_photo,
        })
        .select()
        .single();

      if (stepError) {
        console.error(stepError);
        return res.status(400).json({ error: "Failed to insert recipe step." });
      }

      const step_id = stepRecord.step_id;

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

    return res.json({ message: "Recipe created successfully.", r_id });
  }
}