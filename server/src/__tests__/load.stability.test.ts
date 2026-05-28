import request from "supertest";
import app from "../app";
import { createAccessToken } from "../middlewares/auth.middleware";
import { ORGANIZER_EMAIL, eventBody, resetAndSeed, tokenFor } from "./helpers";

const CONCURRENT_REQUESTS = 50;
const MAX_AVG_RESPONSE_MS = 200;
const MAX_SINGLE_RESPONSE_MS = 1000;
const CONCURRENT_WRITES = 10;

let organizerToken: string;

beforeEach(async () => {
  await resetAndSeed();
  organizerToken = await tokenFor(ORGANIZER_EMAIL);
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

describe(`POST /api/events — ${CONCURRENT_WRITES} równoległych zapisów`, () => {
  jest.setTimeout(30_000);

  it("każdy zapis tworzy unikalne wydarzenie, liczba wydarzeń wzrasta dokładnie o liczbę sukcesów", async () => {
    const beforeCount: number = (await request(app).get("/api/events").then((r) => r.body as unknown[])).length;

    const results = await Promise.all(
      Array.from({ length: CONCURRENT_WRITES }, async (_, i) => {
        const res = await request(app)
          .post("/api/events")
          .set("Authorization", `Bearer ${organizerToken}`)
          .send(eventBody({ name: `Load event ${i}` }));
        return { status: res.status, id: res.body.id as string };
      }),
    );

    const created = results.filter((r) => r.status === 201);
    expect(created).toHaveLength(CONCURRENT_WRITES);

    const ids = new Set(created.map((r) => r.id));
    expect(ids.size).toBe(CONCURRENT_WRITES);

    const afterCount: number = (await request(app).get("/api/events").then((r) => r.body as unknown[])).length;
    expect(afterCount).toBe(beforeCount + CONCURRENT_WRITES);
  });
});

describe("POST /api/events/:id/join — równoległe dołączanie różnych użytkowników", () => {
  jest.setTimeout(30_000);

  it("participantsCount odpowiada dokładnie liczbie zaakceptowanych dołączeń", async () => {
    const CONCURRENT_JOINS = 15;

    const createRes = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send(eventBody({ name: "Wydarzenie pod obciążeniem" }));
    expect(createRes.status).toBe(201);
    const eventId: string = createRes.body.id;

    const tokens = Array.from({ length: CONCURRENT_JOINS }, (_, i) =>
      createAccessToken({ id: `load-user-${i}`, role: "user", email: `load${i}@test.com` }),
    );

    const statuses = await Promise.all(
      tokens.map(async (token) => {
        const res = await request(app)
          .post(`/api/events/${eventId}/join`)
          .set("Authorization", `Bearer ${token}`);
        return res.status;
      }),
    );

    const successes = statuses.filter((s) => s === 201).length;
    expect(successes).toBe(CONCURRENT_JOINS);

    const eventRes = await request(app).get(`/api/events/${eventId}`);
    expect(eventRes.body.participantsCount).toBe(successes);
  });
});
