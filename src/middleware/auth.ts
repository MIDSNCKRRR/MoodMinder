import type { Request, Response, NextFunction } from "express";
import cookie from "cookie";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { URL } from "node:url";
import {
  JWT_JWKS_URL,
  COOKIE_DOMAIN,
  isProd,
} from "../config/env";
import { AppError } from "../utils/errors";

const JWKS = createRemoteJWKSet(new URL(JWT_JWKS_URL), {
  cache: true,
  cooldownDuration: 60_000,
});

export interface AuthenticatedUser {
  id: string;
  email?: string;
  exp?: number;
  [claim: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function verifyJwt(accessToken: string): Promise<AuthenticatedUser> {
  const { payload } = await jwtVerify(accessToken, JWKS, {
    clockTolerance: 30,
  });

  if (!payload.sub) {
    throw new AppError(401, "Token missing subject");
  }

  return {
    id: payload.sub,
    email: payload.email as string | undefined,
    exp: payload.exp,
    ...payload,
  };
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
    domain: COOKIE_DOMAIN,
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
  res.clearCookie("sb-access-token", { path: "/", domain: COOKIE_DOMAIN });
  res.clearCookie("sb-refresh-token", { path: "/", domain: COOKIE_DOMAIN });
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
