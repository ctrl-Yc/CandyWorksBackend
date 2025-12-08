// src/types/AuthPayload.ts
export interface AuthPayload {
  sub: string;       // Supabase user id
  exp: number;       // expiration
  iat: number;       // issued at
  role?: string;     // custom claim
}