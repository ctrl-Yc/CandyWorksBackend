import { supabase } from "../config/supabase.js";

export class AuthService {
  async signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  }

  async signin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    return {
      success: true,
      session: data,
    };
  }
}