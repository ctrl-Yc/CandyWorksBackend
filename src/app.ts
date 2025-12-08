import express from "express";
import cors from "cors";
import type { Request, Response } from "express";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import skillRoutes from "./routes/skill.js";
import adminRecipeRoutes from "./routes/recipe.js";
import evaluationRoutes from "./routes/evaluation.js";

const app = express();
app.use(cors());
app.use(express.json());

// 動作確認
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!");
});

// ルート登録
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/skills", skillRoutes);
app.use("/admin", adminRecipeRoutes);
app.use("/evaluation", evaluationRoutes);

export default app;