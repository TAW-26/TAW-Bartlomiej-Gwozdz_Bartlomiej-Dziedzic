import request from "supertest";
import app from "../app";
import { ORGANIZER_EMAIL, USER_EMAIL, eventBody, resetAndSeed, tokenFor } from "./helpers";

let organizerToken: string;
let userToken: string;

beforeEach(async () => {
  await resetAndSeed();
  organizerToken = await tokenFor(ORGANIZER_EMAIL);
  userToken = await tokenFor(USER_EMAIL);
});

describe("GET /api/events", () => {
  it("zwraca 200 i tablicę wydarzeń (bez tokena)", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(4);
  });
});

describe("POST /api/events", () => {
  it("zwraca 401 bez tokena", async () => {
    const res = await request(app).post("/api/events").send(eventBody());
    expect(res.status).toBe(401);
  });

  it("zwraca 403 dla zwykłego użytkownika", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${userToken}`)
      .send(eventBody());
    expect(res.status).toBe(403);
  });

  it("organizator tworzy wydarzenie → 201", async () => {
    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send(eventBody({ name: "Nowe Wydarzenie" }));
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Nowe Wydarzenie");
    expect(res.body.participantsCount).toBe(0);
  });
});

describe("POST /api/events/:id/join", () => {
  it("zalogowany użytkownik dołącza do wydarzenia → 201", async () => {
    const createRes = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send(eventBody());
    const eventId = createRes.body.id;

    const res = await request(app)
      .post(`/api/events/${eventId}/join`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(201);
    expect(res.body.participantsCount).toBe(1);
  });
});
