// src/types/RecipeStep.ts
export interface RecipeStep {
  step_id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  skill_id: string | null;
  requires_photo: boolean;   // null許容しない
  title: string | null;
}