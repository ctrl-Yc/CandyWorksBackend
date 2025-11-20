import express, { Request, Response } from "express";
import cors from "cors";
import supabase from "./supabase";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!!");
});

app.get("/auth/profile", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Token required" });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData.user) return res.status(401).json({ error: "Invalid token" });

    const userId = userData.user.id;

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    const { data: skills } = await supabase
      .from("user_skills")
      .select("*")
      .eq("user_id", userId);

    return res.json({ user: profile, skills });

  } catch (err) {
    return res.status(500).json({ error: "Failed to get profile" });
  }
});

export default app;
