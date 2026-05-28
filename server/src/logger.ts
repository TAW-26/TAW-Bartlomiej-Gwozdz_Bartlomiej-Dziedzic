const SLOW_REQUEST_THRESHOLD_MS = 500;

export interface ErrorContext {
  method?: string;
  path?: string;
  userId?: string;
  [key: string]: unknown;
}

export function logError(error: unknown, context: ErrorContext = {}): void {
  const errorType = error instanceof Error ? error.constructor.name : "UnknownError";
  const message = error instanceof Error ? error.message : String(error);

  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      type: errorType,
      message,
      context,
    }),
  );
}

export function logRequest(method: string, path: string, statusCode: number, durationMs: number): void {
  const slow = durationMs >= SLOW_REQUEST_THRESHOLD_MS;
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level: slow ? "warn" : "info",
    method,
    path,
    statusCode,
    durationMs,
    ...(slow && { slow: true }),
  };

  if (slow) {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}
