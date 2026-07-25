import { Router } from "express";
import { User } from "../models/User";
import { comparePassword, signToken } from "../utils/auth";
import { loginSchema } from "../utils/validation";
import { env } from "../config/env";
import { requireAuth, AuthedRequest } from "../middleware/requireAuth";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? ("none" as const) : ("lax" as const),
  maxAge: 12 * 60 * 60 * 1000, // 12h, matches JWT_EXPIRES_IN default
  path: "/",
};

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user._id.toString() });
    res.cookie(env.cookieName, token, COOKIE_OPTIONS);
    return res.status(200).json({ id: user._id, email: user.email, name: user.name });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(env.cookieName, { ...COOKIE_OPTIONS, maxAge: undefined });
  return res.status(200).json({ ok: true });
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const user = await User.findById(req.userId).select("email name");
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    return res.status(200).json({ id: user._id, email: user.email, name: user.name });
  } catch {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
