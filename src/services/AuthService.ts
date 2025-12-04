import axios from "axios";
import { prisma } from "../config/prisma.js";
import { User } from "../models/User.js";

export class AuthService {
  constructor() {}

  /**
   * サインアップ処理
   * Supabase Auth にユーザー作成 → Prisma にプロフィール保存
   */
  async signup(user: User) {
    try {
      console.log("✅ Signup API called");

      const { data } = await axios.post(
        `${process.env.SUPABASE_URL}/auth/v1/signup`,
        {
          email: user.email,
          password: user.password,
        },
        {
          headers: {
            apikey: process.env.SUPABASE_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("📦 Supabase response:", JSON.stringify(data, null, 2));

      const supabaseUser = data.user;
      if (!supabaseUser?.id) {
        console.error("❌ Supabase signup response missing user ID:", JSON.stringify(data));
        throw new Error("Supabase signup failed");
      }

      const createdUser = await prisma.users.create({
        data: {
          u_id: supabaseUser.id,
          role: "user",
          level_diagnosed: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: "User created successfully",
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          profile: createdUser,
        },
      };
    } catch (err: any) {
      // Supabase 側のエラーを詳細に出力
      console.error("❌ Signup error:", JSON.stringify(err.response?.data || err.message, null, 2));
      throw new Error(
        `Failed to signup user via Supabase: ${
          err.response?.data?.msg ||
          err.response?.data?.message ||
          err.response?.data?.error_description ||
          err.message
        }`
      );
    }
  }

  /**
   * サインイン処理
   * Supabase Auth にログイン → セッション情報返却
   */
  async signin(email: string, password: string) {
    try {
      const { data } = await axios.post(
        `${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email, password },
        {
          headers: {
            apikey: process.env.SUPABASE_KEY, // ← anon key に統一
            "Content-Type": "application/json",
          }
        }
      );

      return {
        success: true,
        message: "Login success",
        session: data, // access_token, refresh_token, user が含まれる
      };
    } catch (err: any) {
      console.error("Signin error:", err.response?.data || err.message);
      throw new Error(
        `Invalid email or password: ${err.response?.data?.msg || err.message}`
      );
    }
  }
}
