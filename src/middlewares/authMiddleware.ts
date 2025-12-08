// src/middlewares/authMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { AuthPayload } from "../types/AuthPayload.js";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string,
      { algorithms: ["HS256"] }
    ) as JwtPayload & AuthPayload;

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
}