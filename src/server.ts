// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const port = process.env.PORT || 3000;

// サーバー起動
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// 終了処理（Prismaは不要なので削除済み）
process.on("SIGINT", () => {
  console.log("Server shutting down (SIGINT).");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Server shutting down (SIGTERM).");
  process.exit(0);
});