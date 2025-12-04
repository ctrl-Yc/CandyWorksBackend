import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

// ルートの .env を確実に読み込む
config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("cwd:", process.cwd());
  console.error("SUPABASE_URL:", supabaseUrl);
  console.error(
    "SUPABASE_KEY or SERVICE_ROLE_KEY:",
    supabaseKey ? "(loaded)" : "(undefined)"
  );
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// ユーザーモデル
export class User {
  email: string;
  password: string;
  username: string;

  constructor(email: string, password: string, username: string) {
    this.email = email;
    this.password = password;
    this.username = username;
  }
}