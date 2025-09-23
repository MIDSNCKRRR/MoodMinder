// server/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import { COOKIE_DOMAIN, isProd } from "../config/env";
import { createSupabaseAuthClient } from "../lib/supabase";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  [claim: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

async function verifyWithSupabase(accessToken: string): Promise<AuthenticatedUser> {
  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AppError(401, error?.message ?? "Invalid or expired session");
  }

  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
    ...data.user.user_metadata,
  };
}

export async function verifyJwt(accessToken: string): Promise<AuthenticatedUser> {
  return verifyWithSupabase(accessToken);
}

export function setSessionCookies(
  res: Response,
  session: {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
  },
) {
  const base = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    domain: COOKIE_DOMAIN || undefined,
    path: "/",
  };

  res.cookie("sb-access-token", session.access_token, {
    ...base,
    maxAge: (session.expires_in ?? 60 * 60) * 1000,
  });
  res.cookie("sb-refresh-token", session.refresh_token, {
    ...base,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookies(res: Response) {
  const options = { path: "/", domain: COOKIE_DOMAIN || undefined };
  res.clearCookie("sb-access-token", options);
  res.clearCookie("sb-refresh-token", options);
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  try {
    const bearer = req.headers.authorization;
    const cookieToken = req.cookies?.["sb-access-token"];

    let token: string | undefined;

    if (bearer?.startsWith("Bearer ")) {
      token = bearer.slice(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    req.user = await verifyJwt(token);
    return next();
  } catch (err) {
    return next(err);
  }
}
