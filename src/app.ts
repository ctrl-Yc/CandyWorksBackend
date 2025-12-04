import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
import { AuthService } from "./services/AuthService.js";
import { User } from "./models/User.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import adminRecipeRoutes from "./routes/adminRecipe.routes.js";   // ← 追加
import evaluationRoutes from "./routes/evaluation.routes.js";     // ← 追加

import jwt from "jsonwebtoken"; // ← 追加

const app = express();
const authService = new AuthService();

app.use(cors());
app.use(express.json());

// 動作確認
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!");
});

/**
 * ✅ サインアップ
 */
app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;
    const user = new User(email, password, username);
    const result = await authService.signup(user);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * ✅ サインイン
 */
app.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await authService.signin(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

/**
 * ✅ 認証付きルート
 */
app.get("/protected", (req: Request, res: Response) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string,
      { algorithms: ["HS256"] }
    );
    return res.json({
      success: true,
      message: "Protected route accessed",
      user: decoded,
    });
  } catch (err) {
    console.error("❌ JWT verify error:", err);
    return res.status(403).json({ error: "Invalid token" });
  }
});

// ログイン後の処理
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/skills", skillRoutes);
app.use("/admin", adminRecipeRoutes);     // 管理者レシピ作成
app.use("/evaluation", evaluationRoutes); // 提出評価処理

export default app;