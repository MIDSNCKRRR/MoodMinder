
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "http";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: {
    paths: [
      'req.headers["authorization"]',
      'req.headers["cookie"]',
      'res.headers["set-cookie"]',
    ],
    remove: true,
  },
  formatters: {
    level(label, number) {
      return { level: label, levelValue: number };
    },
  },
});

export const httpLogger = pinoHttp({
  logger,
  genReqId(req: IncomingMessage) {
    const header = req.headers["x-request-id"];
    return Array.isArray(header) ? header[0] : header ?? randomUUID();
  },
  serializers: {
    req(req: any) {
      req.body = undefined; // avoid logging bodies by default
      return req;
    },
    res(res: any) {
      return res;
    },
    err(err: any) {
      return {
        type: err.type,
        message: err.message,
        stack: err.stack,
      };
    },
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${req.url} -> ${res.statusCode}`;
  },
});
