// src/routes/auth.routes.ts
import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ✅ プロフィール登録
 */
router.post("/register-profile", async (req, res) => {
  try {
    const { nickname, avatar_url } = req.body;

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user)
      return res.status(401).json({ error: "Unauthorized" });

    const now = new Date().toISOString();

    const { error } = await supabase.from("users").insert({
      u_id: user.id,
      nickname,
      avatar_url,
      role: "user",
      level_diagnosed: false,
      created_at: now,
      updated_at: now,
    });

    if (error) throw error;

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * ✅ プロフィール更新
 */
router.patch("/update-profile", async (req, res) => {
  try {
    const { userId, nickname, avatarUrl } = req.body;

    const updates: any = {};
    if (nickname) updates.nickname = nickname;
    if (avatarUrl) updates.avatar_url = avatarUrl;

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("u_id", userId);

    if (error) throw error;

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * ✅ 認証情報更新（メール・パスワード）
 */
router.patch("/update-auth", async (req, res) => {
  try {
    const { password, email } = req.body;

    const updates: any = {};
    if (password) updates.password = password;
    if (email) updates.email = email;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw error;

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
