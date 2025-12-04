// src/server.ts
import dotenv from "dotenv";
dotenv.config();

console.log("🔑 Loaded JWT Secret:", process.env.SUPABASE_JWT_SECRET);
import app from "./app.js";
import { prisma } from "./config/prisma.js";

const port = process.env.PORT || 3000;

// サーバー起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Prisma の終了処理（Ctrl+C のとき）
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected. Server shutting down.");
  process.exit(0);
});

// Dockerやクラウド環境用に SIGTERM も追加するとさらに安全
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  console.log("Prisma disconnected. Server shutting down (SIGTERM).");
  process.exit(0);
});
