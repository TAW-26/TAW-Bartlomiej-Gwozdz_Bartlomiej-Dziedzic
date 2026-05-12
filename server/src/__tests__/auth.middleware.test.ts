import request from "supertest";
import app from "../app";
import { ADMIN_EMAIL, resetAndSeed, tokenFor } from "./helpers";

beforeEach(async () => {
  await resetAndSeed();
});

describe("authenticateJWT", () => {
  it("returns 401 when Authorization header is missing", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
  });

  it("returns 401 for an invalid token", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer not.a.valid.token");
    expect(res.status).toBe(401);
  });

  it("allows access with a valid admin token", async () => {
    const token = await tokenFor(ADMIN_EMAIL);
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
