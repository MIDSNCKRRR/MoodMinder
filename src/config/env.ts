import { z } from "zod";

const baseSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Service role key is required"),
  SUPABASE_ANON_KEY: z.string().optional(),
  JWT_JWKS_URL: z.string().optional(),
  FRONTEND_URL: z.string().url(),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().optional(),
});

const parsed = baseSchema.safeParse(process.env);

if (!parsed.success) {
  // Dump all env errors up front
  const message = parsed.error.errors
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

const env = parsed.data;

export const NODE_ENV = env.NODE_ENV;
export const isProd = env.NODE_ENV === "production";
export const SUPABASE_URL = env.SUPABASE_URL;
export const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
export const SUPABASE_ANON_KEY = env.SUPABASE_ANON_KEY;

export const JWT_JWKS_URL =
  env.JWT_JWKS_URL ?? `${env.SUPABASE_URL.replace(/\/+$/, "")}/auth/v1/jwks`;

export const FRONTEND_URL = env.FRONTEND_URL;
export const COOKIE_DOMAIN = env.COOKIE_DOMAIN;
export const PORT = env.PORT ?? 8787;
