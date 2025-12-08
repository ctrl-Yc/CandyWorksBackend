// src/types/StepPhoto.ts
export interface StepPhoto {
  photo_id: string;
  step_id: string;
  user_id: string;
  image_url: string;
  uploaded_at: string;   // null許容しない
}