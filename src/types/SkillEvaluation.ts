// src/types/SkillEvaluation.ts
export interface SkillEvaluation {
  skill_evaluation_id: string;
  submission_id: string;
  skill_id: string;
  user_id: string;
  is_passed: boolean;    // null許容しない
  evaluated_at: string;  // null許容しない
}