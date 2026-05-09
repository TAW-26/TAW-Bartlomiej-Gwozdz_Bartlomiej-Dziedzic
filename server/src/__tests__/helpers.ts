import { createAccessToken } from "../middlewares/auth.middleware";
import {
  ensureAdminSeed,
  getUserByEmail,
  resetMemoryStore,
} from "../store-memory";

export const ADMIN_EMAIL = "admin@local-events.app";
export const ORGANIZER_EMAIL = "organizer@local-events.app";
export const USER_EMAIL = "user@example.com";

export const ADMIN_PASSWORD = "admin1234";
export const ORGANIZER_PASSWORD = "organizer1234";
export const USER_PASSWORD = "password123";

/** Resets in-memory store and seeds default admin/organizer/user + 4 events. */
export const resetAndSeed = async (): Promise<void> => {
  resetMemoryStore();
  await ensureAdminSeed();
};

/** Returns a valid JWT for a seeded user looked up by e-mail. */
export const tokenFor = async (email: string): Promise<string> => {
  const user = await getUserByEmail(email);
  if (!user) throw new Error(`Seeded user not found: ${email}`);
  return createAccessToken({ id: user.id, role: user.role, email: user.email });
};

/** Minimal valid event body for POST /api/events. */
export const eventBody = (overrides: Record<string, unknown> = {}) => ({
  name: "Test Event",
  description: "A test event description",
  startsAt: "2027-06-01T10:00:00.000Z",
  endsAt: "2027-06-01T12:00:00.000Z",
  location: "Test Hall",
  city: "Testowo",
  category: "Tech",
  ...overrides,
});
