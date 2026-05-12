import request from "supertest";
import app from "../app";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  USER_EMAIL,
  resetAndSeed,
  tokenFor,
} from "./helpers";

let adminToken: string;
let userToken: string;

beforeEach(async () => {
  await resetAndSeed();
  adminToken = await tokenFor(ADMIN_EMAIL);
  userToken = await tokenFor(USER_EMAIL);
});

describe("POST /api/users/register", () => {
  it("rejestruje nowego użytkownika → 201", async () => {
    const res = await request(app).post("/api/users/register").send({
      email: "new@example.com",
      password: "password1",
      confirmPassword: "password1",
    });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe("new@example.com");
    expect(res.body).not.toHaveProperty("password");
  });
});

describe("POST /api/users/login", () => {
  it("zwraca 200 z tokenem JWT i danymi użytkownika", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(ADMIN_EMAIL);
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("zwraca 401 dla błędnego hasła", async () => {
    const res = await request(app).post("/api/users/login").send({
      email: USER_EMAIL,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/users", () => {
  it("admin widzi listę użytkowników → 200", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it("zwykły użytkownik dostaje 403", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });
});
