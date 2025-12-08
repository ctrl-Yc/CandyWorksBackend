import { Router } from "express";
import { supabase } from "../config/supabase.js";
import type { User } from "../types/User.js";

const router = Router();

/** サインアップ */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    return res.json({ success: true, user: data.user, session: data.session });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).json({ error: message });
  }
});

/** サインイン */
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    return res.json({ success: true, session: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(401).json({ error: message });
  }
});

/** プロフィール登録 */
router.post("/register-profile", async (req, res) => {
  try {
    const { nickname, avatarUrl } = req.body as { nickname?: string; avatarUrl?: string };
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ error: "Missing token" });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: "Unauthorized" });

    const now = new Date().toISOString();
    const newUser: User = {
      user_id: user.id,
      nickname: nickname ?? null,   // null に変換
      avatar_url: avatarUrl ?? null,
      role: "user",
      level_diagnosed: false,
      created_at: now,
      updated_at: now,
    };

    const { error } = await supabase.from("users").insert(newUser);
    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).json({ error: message });
  }
});

/** プロフィール更新 */
router.patch("/update-profile", async (req, res) => {
  try {
    const { userId, nickname, avatarUrl } = req.body as {
      userId: string; nickname?: string; avatarUrl?: string;
    };

    const updates: Partial<User> = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("user_id", userId); // u_id → user_id に統一

    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).json({ error: message });
  }
});

/** 認証情報更新（メール・パスワード） */
router.patch("/update-auth", async (req, res) => {
  try {
    const { password, email } = req.body as { password?: string; email?: string };
    const updates: { password?: string; email?: string } = {};
    if (password) updates.password = password;
    if (email) updates.email = email;

    const { error } = await supabase.auth.updateUser(updates);
    if (error) throw error;

    return res.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return res.status(400).json({ error: message });
  }
});

export default router;