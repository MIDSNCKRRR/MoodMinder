import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { FRONTEND_URL, PORT, isProd } from "./config/env";
import { authRouter } from "./routers/auth.router";
import { profileRouter } from "./routers/profile.router";
import { privacyRouter } from "./routers/privacy.router";
import { httpLogger, logger } from "./utils/logger";
import { errorHandler } from "./utils/errors";

const app = express();

app.disable("x-powered-by");
app.use(httpLogger);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        connectSrc: ["'self'", FRONTEND_URL, "*.supabase.co"],
        imgSrc: ["'self'", "data:", "blob:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/health", (req, res) => {
  res.setHeader("x-request-id", (req as any).id ?? "");
  res.status(200).json({ status: "ok", env: process.env.NODE_ENV });
});

app.use("/api", rateLimit({ windowMs: 60_000, max: 100 })); // 기존 전역
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/privacy", privacyRouter);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info({ port: PORT, mode: isProd ? "production" : "development" }, "Server started");
});
