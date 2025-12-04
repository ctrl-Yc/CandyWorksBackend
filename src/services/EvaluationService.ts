import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { getSkillLevel, countLevels, getUserRankSequential } from "../utils/evaluationUtils.js";

export class EvaluationService {
  static async processSubmissionEvaluation(req: Request, res: Response) {
    if (req.headers["content-type"] !== "application/json") {
      return res.status(415).json({ error: "Invalid content type." });
    }

    const { submissionId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: "submissionId is required." });
    }

    // ✅ 1. skill_evaluations を取得
    const { data: evaluations, error: evalError } = await supabase
      .from("skill_evaluations")
      .select("u_id, sk_id, is_passed")
      .eq("s_id", submissionId);

    if (evalError || !evaluations?.length) {
      console.error("評価取得失敗:", evalError);
      return res.status(400).json({ error: "Failed to fetch evaluations." });
    }

    // ✅ 合格スキルのみ抽出
    const passed = evaluations.filter((e) => e.is_passed);
    if (passed.length === 0) {
      return res.json({ message: "No passed skills." });
    }

    const userId = passed[0]!.u_id;

    // ✅ 2. user_skills を更新
    for (const { sk_id } of passed) {
      const { data: existing } = await supabase
        .from("user_skills")
        .select("passed_count, acquired_at")
        .eq("u_id", userId)
        .eq("sk_id", sk_id)
        .maybeSingle();

      const newCount = (existing?.passed_count ?? 0) + 1;
      const newLevel = getSkillLevel(newCount);

      const { error: upsertError } = await supabase.from("user_skills").upsert({
        u_id: userId,
        sk_id,
        passed_count: newCount,
        level: newLevel,
        acquired_at: existing ? existing.acquired_at : new Date().toISOString(),
      });

      if (upsertError) {
        console.error("user_skills 更新失敗:", upsertError);
        return res.status(400).json({ error: "Failed to update user_skills." });
      }
    }

    // ✅ 3. 全スキルのレベルを取得
    const { data: skills, error: skillError } = await supabase
      .from("user_skills")
      .select("level")
      .eq("u_id", userId);

    if (skillError || !skills) {
      console.error("スキル集計失敗:", skillError);
      return res.status(400).json({ error: "Failed to fetch user_skills." });
    }

    const levelCounts = countLevels(skills.map((s) => s.level ?? 0));

    // ✅ 4. ランク算出
    const newRank = getUserRankSequential(levelCounts);

    // ✅ 5. users.rank を更新
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ rank: newRank })
      .eq("u_id", userId);

    if (updateUserError) {
      console.error(updateUserError);
      return res.status(400).json({ error: "Failed to update user rank." });
    }

    return res.json({
      message: "Skill evaluation processed.",
      userId,
      newRank,
    });
  }
}