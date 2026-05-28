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
