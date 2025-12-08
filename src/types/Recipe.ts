// src/types/Recipe.ts
export interface Recipe {
  recipe_id: string;
  title: string;
  description: string | null;
  difficulty: number;
  finish_url: string | null;
}