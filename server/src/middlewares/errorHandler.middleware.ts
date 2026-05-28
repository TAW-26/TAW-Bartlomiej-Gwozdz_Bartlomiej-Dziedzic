import { NextFunction, Request, Response } from "express";
import { logError } from "../logger";

export function globalErrorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logError(error, { method: req.method, path: req.path });

  if (res.headersSent) return;

  const message = error instanceof Error ? error.message : "Internal server error";
  res.status(500).json({ error: message });
}
