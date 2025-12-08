// src/types/Submission.ts
export interface Submission {
  submission_id: string;
  user_id: string;
  recipe_id: string;
  image_urls: string[] | null;
  submitted_at: string;   // null許容しない
  status: string;
  feedback: string | null;
}