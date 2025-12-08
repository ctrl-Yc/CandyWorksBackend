import type { Request, Response } from "express";
import { supabase } from "../config/supabase.js";
import { getSkillLevel, countLevels, getUserRankSequential } from "../utils/evaluationUtils.js";

export class EvaluationService {
  // 提出物評価に基づきスキル・ランクを更新
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
      .select("user_id, skill_id, is_passed")
      .eq("submission_id", submissionId);

    if (evalError || !evaluations?.length) {
      console.error("評価取得失敗:", evalError);
      return res.status(400).json({ error: "Failed to fetch evaluations." });
    }

    // ✅ 合格スキルのみ抽出
    const passed = evaluations.filter((e) => e.is_passed);
    if (passed.length === 0) {
      return res.json({ message: "No passed skills." });
    }

    const userId = passed[0]!.user_id;


   // ✅ 2. user_skills を更新
    for (const { skill_id } of passed) {
      const { data: existing } = await supabase
        .from("user_skills")
        .select("passed_count, acquired_at")
        .eq("user_id", userId)
        .eq("skill_id", skill_id)
        .maybeSingle();

      const newCount = (existing?.passed_count ?? 0) + 1;
      const newLevel = getSkillLevel(newCount);

      const { error: upsertError } = await supabase.from("user_skills").upsert({
        user_id: userId,
        skill_id,
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
      .eq("user_id", userId);

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
      .eq("user_id", userId);

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

  // 提出物評価（evaluations）を登録
  static async createSubmissionEvaluation(req: Request, res: Response) {
    const evaluatorId = (req as any).user?.sub;
    if (!evaluatorId) return res.status(401).json({ error: "Unauthorized." });

    // ユーザーの role を確認
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", evaluatorId)
      .single();

    if (userError || !user) return res.status(400).json({ error: "Failed to fetch user role." });
    if (!(user.role === "admin" || user.role === "evaluator")) {
      return res.status(403).json({ error: "Only admins or evaluators can create evaluations." });
    }

    const { submissionId, advice, isPassed } = req.body;
    if (!submissionId) return res.status(400).json({ error: "submissionId is required." });

    const { error } = await supabase.from("evaluations").insert({
      submission_id: submissionId,
      user_id: evaluatorId,
      is_passed: isPassed,
      advice,
      evaluated_at: new Date().toISOString(),
    });

    if (error) return res.status(400).json({ error: "Failed to create evaluation." });
    return res.json({ message: "Evaluation created." });
  }

  // スキル評価（skill_evaluations）を登録
  static async createSkillEvaluation(req: Request, res: Response) {
    const evaluatorId = (req as any).user?.sub;
    if (!evaluatorId) return res.status(401).json({ error: "Unauthorized." });

    // ユーザーの role を確認
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("user_id", evaluatorId)
      .single();

    if (userError || !user) return res.status(400).json({ error: "Failed to fetch user role." });
    if (!(user.role === "admin" || user.role === "evaluator")) {
      return res.status(403).json({ error: "Only admins or evaluators can create skill evaluations." });
    }

    const { submissionId, skillId, isPassed } = req.body;
    if (!submissionId || !skillId) {
      return res.status(400).json({ error: "submissionId and skillId are required." });
    }

    const { error } = await supabase.from("skill_evaluations").insert({
      submission_id: submissionId,
      skill_id: skillId,
      user_id: evaluatorId,
      is_passed: isPassed,
      evaluated_at: new Date().toISOString(),
    });

    if (error) return res.status(400).json({ error: "Failed to create skill evaluation." });
    return res.json({ message: "Skill evaluation created." });
  }
}