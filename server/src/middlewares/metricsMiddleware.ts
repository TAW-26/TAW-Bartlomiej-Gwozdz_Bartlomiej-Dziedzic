import { NextFunction, Request, Response } from 'express';
import { logRequest } from '../logger';
import { activeConnections, httpRequestDurationMs, httpRequestsTotal } from '../metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startMs = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const durationMs = Date.now() - startMs;
    const route = (req.route?.path as string | undefined) ?? req.path;
    const labels = { method: req.method, route, status_code: String(res.statusCode) };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, durationMs);
    activeConnections.dec();

    logRequest(req.method, route, res.statusCode, durationMs);
  });

  next();
}
