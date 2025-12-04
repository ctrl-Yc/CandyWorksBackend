import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export class SkillService {
  static async updateSkill(req: Request, res: Response) {
    const { sk_id, level } = req.body;
    const userId = req.user?.sub;
    const role = req.user?.role; // JWTに含める or DBから取得

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    if (level < 1 || level > 5) {
      return res.status(400).json({ error: "Invalid level range" });
    }

    const current = await prisma.user_skills.findUnique({
      where: { u_id_sk_id: { u_id: userId, sk_id } },
    });

    if (!current) return res.status(404).json({ error: "Skill not found" });

    // 一般ユーザーは降格のみ許可
    if (role === "user" && level >= current.level) {
      return res.status(403).json({ error: "Regular users can only downgrade their skill level" });
    }

    try {
      const updated = await prisma.user_skills.update({
        where: { u_id_sk_id: { u_id: userId, sk_id } },
        data: { level }, // updated_at は不要、自動更新される
      });
      return res.json({ success: true, skill: updated });
    } catch (err) {
      return res.status(400).json({ error: "Failed to update skill" });
    }
  }
}