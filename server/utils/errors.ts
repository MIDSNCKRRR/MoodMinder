
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = isAppError(err) ? err.statusCode : 500;
  const message = isAppError(err)
    ? err.message
    : "Internal Server Error";

  logger.error(
    { err, path: req.path, status },
    "Request failed",
  );

  res.status(status).json({
    error: message,
    status,
  });
}
