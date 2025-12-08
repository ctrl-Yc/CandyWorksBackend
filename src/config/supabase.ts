// src/config/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Supabase クライアントを共通化
export const supabase = createClient(
  process.env.SUPABASE_URL!,              // Supabase プロジェクトの URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // 管理用の Service Role Key
);