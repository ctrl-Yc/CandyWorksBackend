// src/app.ts
import express from "express";
import cors from "cors";
import type { Request, Response } from "express";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!");
});

export default app;
