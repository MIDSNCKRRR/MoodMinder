import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import {
  createSupabaseAdmin,
  createSupabaseAuthClient,
} from "../lib/supabase";
import {
  clearSessionCookies,
  setSessionCookies,
  requireAuth,
} from "../middleware/auth";
import { AppError } from "../utils/errors";
import { logger } from "../utils/logger";
import type { AuthError } from "@supabase/supabase-js";

const router = Router();
const supabaseAdmin = createSupabaseAdmin();

/* ───── validation schema ───── */
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/\d/, "Password must contain at least one number"),
  nickname: z
    .string()
    .regex(
      /^[A-Za-z0-9_\- ]{1,32}$/,
      "Nickname must be 1-32 safe characters",
    )
    .optional(),
});

/* ───── login rate limiter & soft-lock state ───── */
const loginLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const LOCK_DURATION_MS = 5 * 60_000; // 5 minutes soft lock
const failureState = new Map<
  string,
  { attempts: number; lockedUntil?: number }
>();

function getFailureKey(email: string) {
  return email.toLowerCase();
}

function recordFailure(key: string) {
  const state = failureState.get(key) ?? { attempts: 0 };
  state.attempts += 1;
  if (state.attempts >= 5) {
    state.lockedUntil = Date.now() + LOCK_DURATION_MS;
  }
  failureState.set(key, state);
}

function clearFailure(key: string) {
  failureState.delete(key);
}

function checkLocked(key: string): number | undefined {
  const state = failureState.get(key);
  if (!state || !state.lockedUntil) return undefined;
  if (Date.now() >= state.lockedUntil) {
    failureState.delete(key);
    return undefined;
  }
  return state.lockedUntil;
}

/* ───── Supabase error mapping ───── */
function mapSupabaseError(error: AuthError): AppError {
  logger.error({ supabaseError: error });
  if (error.code === "user_already_exists") {
    return new AppError(409, "Email already registered");
  }
  if (error.code === "email_address_invalid") {
    return new AppError(400, "Invalid email address");
  }
  if (error.status >= 400 && error.status < 500) {
    return new AppError(401, "Invalid credentials");
  }
  return new AppError(502, "Auth service error");
}

/* ───── login handler ───── */
async function handleLogin(req: any, res: any, next: any) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const key = getFailureKey(email);

    const lockedUntil = checkLocked(key);
    if (lockedUntil) {
      const seconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      throw new AppError(
        429,
        `Too many attempts. Try again in ${seconds}s.`,
      );
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      recordFailure(key);
      throw error ? mapSupabaseError(error) : new AppError(401, "Invalid credentials");
    }

    clearFailure(key);

    setSessionCookies(res, data.session);
    return res.status(200).json({
      userId: data.user.id,
      expiresAt: data.session.expires_at,
    });
  } catch (err) {
    next(err);
  }
}

function handleLogout(_req: any, res: any) {
  clearSessionCookies(res);
  return res.status(204).end();
}

/* ───── signup handler (existing) ───── */
async function handleSignup(req: any, res: any, next: any) {
  try {
    const { email, password, nickname } = signupSchema.parse(req.body);
    const authClient = createSupabaseAuthClient();

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: nickname ? { nickname } : undefined,
      },
    });

    if (error || !data.user) {
      throw mapSupabaseError(error!);
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: data.user.id,
          nickname: nickname ?? null,
        },
        { onConflict: "id" },
      );

    if (profileError) {
      throw new AppError(500, "Failed to create profile", profileError);
    }

    if (data.session) {
      setSessionCookies(res, data.session);
      return res.status(201).json({
        userId: data.user.id,
        expiresAt: data.session.expires_at,
      });
    }

    return res.status(201).json({
      message: "Check email to confirm",
    });
  } catch (err) {
    next(err);
  }
}

/* ───── existing me / refresh routes (unchanged) ───── */
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post("/refresh", async (req, res, next) => {
  try {
    const refreshToken =
      req.cookies?.["sb-refresh-token"] ??
      req.body?.refresh_token ??
      req.headers["x-refresh-token"];

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new AppError(401, "Refresh token missing");
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new AppError(
        401,
        error?.message ?? "Failed to refresh session",
      );
    }

    setSessionCookies(res, data.session);

    res.status(200).json({
      userId: data.user.id,
      expiresAt: data.session.expires_at,
    });
  } catch (err) {
    next(err);
  }
});

/* ───── new login/logout endpoints plus legacy aliases ───── */
router.post("/signup", handleSignup);
router.post("/login", loginLimiter, handleLogin);
router.post("/auth/login", loginLimiter, handleLogin); // optional alias

router.post("/logout", handleLogout);
router.post("/auth/logout", handleLogout); // optional alias

// Legacy aliases (if you still need to support them temporarily)
router.post("/sign-in", loginLimiter, handleLogin);
router.post("/sign-out", handleLogout);

export { router as authRouter };
