// src/types/Evaluation.ts
export interface Evaluation {
  evaluation_id: string;
  submission_id: string;
  user_id: string;
  is_passed: boolean;    // null許容しない
  advice: string | null;
  evaluated_at: string;  // null許容しない
}