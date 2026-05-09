import {
  cancelParticipation,
  confirmParticipation,
  createOrganizerEvent,
  loginUser,
  registerUser,
} from "../businessLogic";
import { getUserByEmail } from "../store-memory";
import {
  ORGANIZER_EMAIL,
  USER_EMAIL,
  USER_PASSWORD,
  eventBody,
  resetAndSeed,
} from "./helpers";

const organizerId = async () => (await getUserByEmail(ORGANIZER_EMAIL))!.id;
const userId = async () => (await getUserByEmail(USER_EMAIL))!.id;

beforeEach(async () => {
  await resetAndSeed();
});

// --- UC04: Rejestracja ---

describe("registerUser", () => {
  it("tworzy użytkownika i zwraca PublicUser (bez hasła)", async () => {
    const user = await registerUser({
      email: "new@example.com",
      password: "securepass",
      confirmPassword: "securepass",
    });
    expect(user.email).toBe("new@example.com");
    expect(user.role).toBe("user");
    expect((user as unknown as Record<string, unknown>).password).toBeUndefined();
  });

  it("rzuca błąd dla zduplikowanego e-maila", async () => {
    await registerUser({ email: "dup@example.com", password: "pass1234", confirmPassword: "pass1234" });
    await expect(
      registerUser({ email: "dup@example.com", password: "pass1234", confirmPassword: "pass1234" }),
    ).rejects.toThrow("already exists");
  });

  it("rzuca błąd gdy hasło ma mniej niż 8 znaków", async () => {
    await expect(
      registerUser({ email: "x@x.com", password: "short", confirmPassword: "short" }),
    ).rejects.toThrow("8 characters");
  });
});

// --- UC05: Logowanie ---

describe("loginUser", () => {
  it("zwraca PublicUser dla poprawnych danych", async () => {
    const user = await loginUser({ email: USER_EMAIL, password: USER_PASSWORD });
    expect(user.email).toBe(USER_EMAIL);
    expect((user as unknown as Record<string, unknown>).password).toBeUndefined();
  });

  it("rzuca błąd dla złego hasła", async () => {
    await expect(
      loginUser({ email: USER_EMAIL, password: "wrongpassword" }),
    ).rejects.toThrow("Invalid e-mail or password");
  });
});

// --- UC08: Tworzenie wydarzenia ---

describe("createOrganizerEvent", () => {
  it("organizator tworzy wydarzenie", async () => {
    const event = await createOrganizerEvent(await organizerId(), eventBody());
    expect(event.name).toBe("Test Event");
    expect(event.status).toBe("open");
    expect(event.participantsCount).toBe(0);
  });

  it("rzuca błąd gdy zwykły użytkownik próbuje stworzyć wydarzenie", async () => {
    await expect(
      createOrganizerEvent(await userId(), eventBody()),
    ).rejects.toThrow("Only organizer or admin");
  });
});

// --- UC06 / UC07: Dołączanie i opuszczanie ---

describe("confirmParticipation / cancelParticipation", () => {
  it("użytkownik dołącza do wydarzenia", async () => {
    const ev = await createOrganizerEvent(await organizerId(), eventBody());
    const result = await confirmParticipation(ev.id, await userId());
    expect(result.participantsCount).toBe(1);
  });

  it("użytkownik opuszcza wydarzenie", async () => {
    const ev = await createOrganizerEvent(await organizerId(), eventBody());
    await confirmParticipation(ev.id, await userId());
    const result = await cancelParticipation(ev.id, await userId());
    expect(result.participantsCount).toBe(0);
  });
});
