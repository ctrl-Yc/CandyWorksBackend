// src/types/Skill.ts
export interface Skill {
  skill_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  tags: Record<string, any> | null;
}