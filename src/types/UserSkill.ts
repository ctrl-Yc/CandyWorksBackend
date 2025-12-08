export interface UserSkill {
  user_skill_id: string;
  user_id: string;
  skill_id: string;
  level: number;
  passed_count: number;
  acquired_at: string;   // null許容しない
  updated_at: string;    // null許容しない
}