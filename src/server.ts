// src/server.ts
import app from "./app.js";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";
dotenv.config();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
