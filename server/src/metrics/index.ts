import client from 'prom-client';

export const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Łączna liczba żądań HTTP',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDurationMs = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Czas trwania żądania w milisekundach',
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000],
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Liczba aktualnie obsługiwanych połączeń',
  registers: [register],
});

export const apiErrorsTotal = new client.Counter({
  name: 'api_errors_total',
  help: 'Liczba błędów API według typu',
  labelNames: ['type'],
  registers: [register],
});
