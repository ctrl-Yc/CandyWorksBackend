import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export class SkillService {
  static async updateSkill(req: Request, res: Response) {
    const { skill_id, level } = req.body;
    const userId = (req as any).user?.sub;
    const role = (req as any).user?.role;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (typeof level !== "number" || level < 1 || level > 5) {
      return res.status(400).json({ error: "Invalid level range" });
    }

    const { data: current, error: fetchError } = await supabase
      .from("user_skills")
      .select("level")
      .eq("user_id", userId)
      .eq("skill_id", skill_id)
      .single();

    if (fetchError || !current) return res.status(404).json({ error: "Skill not found" });

    // ユーザーはレベルを下げる（ダウングレード）のみ許可
    if (role === "user" && level >= current.level) {
      return res.status(403).json({ error: "Regular users can only downgrade their skill level" });
    }

    const { data: updated, error } = await supabase
      .from("user_skills")
      .update({ level })
      .eq("user_id", userId)
      .eq("skill_id", skill_id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, skill: updated });
  }
}