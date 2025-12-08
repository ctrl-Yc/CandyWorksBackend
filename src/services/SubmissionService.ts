import type { Request, Response } from "express";
import  { supabase } from "../config/supabase.js";

export class SubmissionService {
  // 挑戦開始：submissions を in_progress で作成
  static async startSubmission(req: Request, res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const { recipe_id } = req.body;
    if (!recipe_id) return res.status(400).json({ error: "Missing recipe_id." });

    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: userId,
        recipe_id,
        status: "in_progress",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: "Failed to start submission." });
    return res.json(data);
  }

  // ステップ写真保存：step_photos（個人履歴）＋ submission_step_images（提出物）
  static async saveSubmissionStepPhoto(req: Request, res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const { submission_id, step_id, image_url } = req.body;
    if (!submission_id || !step_id || !image_url) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // 自分の提出物か確認（RLSも効くが、明示チェックで早期エラー）
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("submission_id, user_id")
      .eq("submission_id", submission_id)
      .single();

    if (subErr || !submission) return res.status(404).json({ error: "Submission not found." });
    if (submission.user_id !== userId) return res.status(403).json({ error: "Forbidden." });

    // 個人履歴へ保存（step_photos）
    const { error: stepPhotoErr } = await supabase.from("step_photos").insert({
      user_id: userId,
      step_id,
      image_url,
      uploaded_at: new Date().toISOString(),
    });
    if (stepPhotoErr) return res.status(400).json({ error: "Failed to save personal step photo." });

    // 提出物へ保存（submission_step_images）
    const { error: subImgErr } = await supabase.from("submission_step_images").insert({
      submission_id,
      step_id,
      image_url,
    });
    if (subImgErr) return res.status(400).json({ error: "Failed to save submission step photo." });

    return res.json({ message: "Photo saved successfully." });
  }

  // 挑戦完了：status を submitted に更新
  static async completeSubmission(req: Request, res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const { submission_id } = req.body;
    if (!submission_id) return res.status(400).json({ error: "Missing submission_id." });

    // 自分の提出物か確認
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("submission_id, user_id, status")
      .eq("submission_id", submission_id)
      .single();

    if (subErr || !submission) return res.status(404).json({ error: "Submission not found." });
    if (submission.user_id !== userId) return res.status(403).json({ error: "Forbidden." });
    if (submission.status === "submitted") {
      return res.json({ message: "Already submitted." });
    }

    const { error } = await supabase
      .from("submissions")
      .update({ status: "submitted", submitted_at: new Date().toISOString() })
      .eq("submission_id", submission_id);

    if (error) return res.status(400).json({ error: "Failed to complete submission." });
    return res.json({ message: "Submission completed." });
  }

  // （参考）提出物詳細取得：自分の提出物のみ
  static async getSubmissionDetail(req: Request, res: Response) {
    const userId = (req as any).user?.sub;
    if (!userId) return res.status(401).json({ error: "Unauthorized." });

    const { submission_id } = req.params;

    // submissions（RLS: user_id = auth.uid()）により他人の提出物は取得不可
    const { data: submission, error } = await supabase
      .from("submissions")
      .select("submission_id, user_id, recipe_id, status, feedback, submitted_at")
      .eq("submission_id", submission_id)
      .single();

    if (error || !submission) return res.status(404).json({ error: "Submission not found." });

    const { data: images, error: imgErr } = await supabase
      .from("submission_step_images")
      .select("submission_step_image_id, step_id, image_url")
      .eq("submission_id", submission_id);

    if (imgErr) return res.status(400).json({ error: "Failed to fetch submission images." });

    return res.json({ submission, images });
  }
}