import request from "supertest";
import app from "../app";
import { ADMIN_EMAIL, ORGANIZER_EMAIL, eventBody, resetAndSeed, tokenFor } from "./helpers";

let adminToken: string;
let organizerToken: string;
let eventId: string;

beforeEach(async () => {
  await resetAndSeed();
  adminToken = await tokenFor(ADMIN_EMAIL);
  organizerToken = await tokenFor(ORGANIZER_EMAIL);

  const createRes = await request(app)
    .post("/api/events")
    .set("Authorization", `Bearer ${organizerToken}`)
    .send(eventBody({ name: "Event do moderacji" }));
  eventId = createRes.body.id;
});

describe("POST /api/moderation/remove-event", () => {
  it("admin usuwa wydarzenie → 201 z moderationId", async () => {
    const res = await request(app)
      .post("/api/moderation/remove-event")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId, reason: "Naruszenie regulaminu" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("moderationId");

    // wydarzenie nie jest już dostępne
    const check = await request(app).get(`/api/events/${eventId}`);
    expect(check.status).toBe(404);
  });

  it("organizer dostaje 403", async () => {
    const res = await request(app)
      .post("/api/moderation/remove-event")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ eventId });
    expect(res.status).toBe(403);
  });
});
