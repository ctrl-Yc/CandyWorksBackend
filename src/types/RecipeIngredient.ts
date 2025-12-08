// src/types/RecipeIngredient.ts
export interface RecipeIngredient {
  ingredient_id: string;
  recipe_id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  order_index: number | null;
  note: string | null;
}