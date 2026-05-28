import request from "supertest";
import app from "../app";
import { resetAndSeed } from "./helpers";

const CONCURRENT_REQUESTS = 50;
const MAX_AVG_RESPONSE_MS = 200;
const MAX_SINGLE_RESPONSE_MS = 1000;

beforeEach(async () => {
  await resetAndSeed();
});

describe(`GET /api/events — ${CONCURRENT_REQUESTS} równoległych żądań`, () => {
  jest.setTimeout(30_000);

  it("wszystkie żądania zwracają 200, średnia < 200ms, każde < 1000ms", async () => {
    const results = await Promise.all(
      Array.from({ length: CONCURRENT_REQUESTS }, async () => {
        const start = Date.now();
        const res = await request(app).get("/api/events");
        return { status: res.status, durationMs: Date.now() - start };
      }),
    );

    const failed = results.filter((r) => r.status !== 200);
    expect(failed).toHaveLength(0);

    const avg = results.reduce((sum, r) => sum + r.durationMs, 0) / results.length;
    expect(avg).toBeLessThan(MAX_AVG_RESPONSE_MS);

    const slow = results.filter((r) => r.durationMs >= MAX_SINGLE_RESPONSE_MS);
    expect(slow).toHaveLength(0);
  });
});
