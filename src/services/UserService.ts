import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { supabase } from "../config/supabase.js"; // createClient済み

export class UserService {
  static async updateProfile(req: Request, res: Response) {
    const { nickname, avatar_url } = req.body;
    const userId = req.user?.sub;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updates: Record<string, any> = {};
    if (nickname) updates.nickname = nickname;
    if (avatar_url) updates.avatar_url = avatar_url;
    // updated_at は不要、自動更新される

    try {
      await prisma.users.update({
        where: { u_id: userId },
        data: updates,
      });
      return res.json({ success: true, message: "Profile updated" });
    } catch (err) {
      return res.status(400).json({ error: "Failed to update profile" });
    }
  }

  static async updateEmail(req: Request, res: Response) {
    const { new_email } = req.body;
    if (!new_email) return res.status(400).json({ error: "New email is required" });

    const { error } = await supabase.auth.updateUser({ email: new_email });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: "Email updated" });
  }

  static async updatePassword(req: Request, res: Response) {
    const { new_password } = req.body;
    if (!new_password) return res.status(400).json({ error: "New password is required" });

    const { error } = await supabase.auth.updateUser({ password: new_password });
    if (error) return res.status(400).json({ error: error.message });
    return res.json({ success: true, message: "Password updated" });
  }
}