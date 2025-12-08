// src/types/User.ts
export interface User {
  user_id: string;
  nickname?: string | null;
  avatar_url?: string | null;
  rank?: number | null;
  role: "user" | "admin" | "evaluator";
  level_diagnosed?: boolean;
  created_at?: string;
  updated_at?: string;
}