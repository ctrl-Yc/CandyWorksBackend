import type { Request, Response, NextFunction } from "express";

// Example middleware that decodes a JWT and populates req.user.sub with the user_id.
// Replace with your real auth implementation (e.g., Supabase Auth, Auth0, etc.).
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Expecting a decoded token set upstream or do minimal mock here.
  // In production, validate Authorization header and set req.user.sub.
  const userId = req.headers["x-user-id"] as string | undefined;
  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  (req as any).user = { sub: userId };
  next();
}