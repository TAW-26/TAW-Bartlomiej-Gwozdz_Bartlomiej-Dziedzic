/**
 * In-memory store — active when USE_MEMORY_DB=true.
 * Exports the same interface as store.ts but persists data in process memory.
 * All data is lost on server restart.
 */
import crypto from "crypto";
import {
  Event,
  EventStatus,
  EventView,
  ModerationAction,
  PublicUser,
  User,
  UserRole,
} from "./types";

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const _users = new Map<string, User>();
const _events = new Map<string, Event>();
const _modActions = new Map<string, ModerationAction>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const newId = (): string => crypto.randomBytes(12).toString("hex");

const now = (): string => new Date().toISOString();

const sanitizeUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  createdAt: user.createdAt,
});

const toEventView = (event: Event): EventView => ({
  id: event.id,
  name: event.name,
  description: event.description,
  startsAt: event.startsAt,
  endsAt: event.endsAt,
  location: event.location,
  city: event.city,
  category: event.category,
  maxParticipants: event.maxParticipants,
  imageUrl: event.imageUrl,
  organizerId: event.organizerId,
  status: event.status,
  participantsCount: event.participants.length,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export const ensureAdminSeed = async (): Promise<void> => {
  const existing = [..._users.values()].find((u) => u.role === "admin");
  if (existing) return;

  const adminId = newId();
  const timestamp = now();

  _users.set(adminId, {
    id: adminId,
    email: "admin@local-events.app",
    password: "admin1234",
    fullName: "System Administrator",
    role: "admin",
    createdAt: timestamp,
  });

  // Seed organizer account
  const orgId = newId();
  _users.set(orgId, {
    id: orgId,
    email: "organizer@local-events.app",
    password: "organizer1234",
    fullName: "Jan Kowalski",
    role: "organizer",
    createdAt: timestamp,
  });

  // Seed regular user account
  const userId = newId();
  _users.set(userId, {
    id: userId,
    email: "user@example.com",
    password: "password123",
    fullName: "Test User",
    role: "user",
    createdAt: timestamp,
  });

  // Seed sample events
  const seedEvents: Omit<Event, "id" | "participants" | "createdAt" | "updatedAt">[] = [
    {
      name: "Warsztaty Python od podstaw",
      description: "3-godzinne warsztaty dla osób początkujących. Laptop wymagany.",
      startsAt: "2026-05-10T16:00:00.000Z",
      endsAt: "2026-05-10T19:00:00.000Z",
      location: "Centrum Nauki, sala A12",
      city: "Krakow",
      category: "Edukacja",
      maxParticipants: 25,
      imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      organizerId: adminId,
      status: "open",
    },
    {
      name: "Hackathon Miejski 2026",
      description: "48-godzinny hackathon z nagrodami dla najlepszych zespołów.",
      startsAt: "2026-05-20T09:00:00.000Z",
      endsAt: "2026-05-22T09:00:00.000Z",
      location: "Strefa Innowacji, ul. Nowa 1",
      city: "Warszawa",
      category: "Tech",
      maxParticipants: 100,
      imageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
      organizerId: orgId,
      status: "open",
    },
    {
      name: "Koncert Jazzu na świeżym powietrzu",
      description: "Wieczór z muzyką jazzową w parku miejskim. Wstęp wolny.",
      startsAt: "2026-06-01T18:00:00.000Z",
      endsAt: "2026-06-01T22:00:00.000Z",
      location: "Park Miejski",
      city: "Gdansk",
      category: "Muzyka",
      maxParticipants: 200,
      imageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
      organizerId: adminId,
      status: "open",
    },
    {
      name: "Bieg Uliczny - Wiosenny Sprint",
      description: "Otwarty bieg uliczny na 5 km. Zapisy do godziny startu.",
      startsAt: "2026-06-15T09:00:00.000Z",
      endsAt: "2026-06-15T11:00:00.000Z",
      location: "Rynek Główny",
      city: "Wroclaw",
      category: "Sport",
      maxParticipants: 500,
      organizerId: orgId,
      status: "open",
    },
  ];

  for (const ev of seedEvents) {
    const id = newId();
    _events.set(id, { ...ev, id, participants: [], createdAt: timestamp, updatedAt: timestamp });
  }

  console.log("[MemDB] Seeded admin, organizer, user and 4 sample events.");
  console.log("[MemDB] Admin:     admin@local-events.app / admin1234");
  console.log("[MemDB] Organizer: organizer@local-events.app / organizer1234");
  console.log("[MemDB] User:      user@example.com / password123");
};

// ---------------------------------------------------------------------------
// Stub models — not applicable in memory mode
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = {
  UserModel: null,
  EventModel: null,
  ModerationActionModel: null,
};

// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------

export const createUser = async (input: {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
}): Promise<PublicUser> => {
  const id = newId();
  const user: User = {
    id,
    email: input.email.toLowerCase().trim(),
    password: input.password,
    fullName: input.fullName,
    role: input.role ?? "user",
    createdAt: now(),
  };
  _users.set(id, user);
  return sanitizeUser(user);
};

export const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const lower = email.toLowerCase().trim();
  return [..._users.values()].find((u) => u.email === lower);
};

export const getUserById = async (id: string): Promise<User | undefined> => _users.get(id);

export const getPublicUserById = async (id: string): Promise<PublicUser | undefined> => {
  const user = _users.get(id);
  return user ? sanitizeUser(user) : undefined;
};

export const getPublicUsers = async (): Promise<PublicUser[]> =>
  [..._users.values()].map(sanitizeUser);

export const updateUser = async (
  id: string,
  patch: Partial<Pick<User, "fullName" | "password" | "role">>,
): Promise<PublicUser | undefined> => {
  const user = _users.get(id);
  if (!user) return undefined;
  const updated: User = { ...user, ...patch };
  _users.set(id, updated);
  return sanitizeUser(updated);
};

export const deleteUser = async (id: string): Promise<boolean> => {
  if (!_users.has(id)) return false;
  _users.delete(id);
  for (const [entryId, event] of _events) {
    if (event.organizerId === id) _events.delete(entryId);
  }
  for (const [entryId, event] of _events) {
    if (event.participants.includes(id)) {
      _events.set(entryId, {
        ...event,
        participants: event.participants.filter((participantId) => participantId !== id),
        updatedAt: now(),
      });
    }
  }
  return true;
};

// ---------------------------------------------------------------------------
// Event operations
// ---------------------------------------------------------------------------

export const createEvent = async (
  input: Omit<Event, "id" | "participants" | "createdAt" | "updatedAt">,
): Promise<EventView> => {
  const id = newId();
  const timestamp = now();
  const event: Event = {
    ...input,
    id,
    participants: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  _events.set(id, event);
  return toEventView(event);
};

export const getEventById = async (id: string): Promise<Event | undefined> => _events.get(id);

export const listEvents = async (filters: {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: EventStatus;
}): Promise<EventView[]> => {
  let result = [..._events.values()];

  if (filters.q?.trim()) {
    const regex = new RegExp(escapeRegex(filters.q.trim()), "i");
    result = result.filter(
      (e) =>
        regex.test(e.name) ||
        regex.test(e.description) ||
        regex.test(e.location) ||
        regex.test(e.city),
    );
  }
  if (filters.city?.trim()) {
    const regex = new RegExp(`^${escapeRegex(filters.city.trim())}$`, "i");
    result = result.filter((e) => regex.test(e.city));
  }
  if (filters.category?.trim()) {
    const regex = new RegExp(`^${escapeRegex(filters.category.trim())}$`, "i");
    result = result.filter((e) => regex.test(e.category));
  }
  if (filters.status) {
    result = result.filter((e) => e.status === filters.status);
  }
  if (filters.from) {
    const from = new Date(filters.from);
    result = result.filter((e) => new Date(e.startsAt) >= from);
  }
  if (filters.to) {
    const to = new Date(filters.to);
    result = result.filter((e) => new Date(e.startsAt) <= to);
  }

  return result
    .sort((a, b) => {
      if (b.participants.length !== a.participants.length)
        return b.participants.length - a.participants.length;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map(toEventView);
};

export const listEventsByOrganizer = async (organizerId: string): Promise<EventView[]> => {
  return [..._events.values()].filter((e) => e.organizerId === organizerId).map(toEventView);
};

export const listEventsByParticipant = async (userId: string): Promise<EventView[]> => {
  return [..._events.values()]
    .filter((e) => e.participants.includes(userId))
    .sort((a, b) => {
      if (b.participants.length !== a.participants.length)
        return b.participants.length - a.participants.length;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map(toEventView);
};

export const updateEvent = async (
  id: string,
  patch: Partial<
    Pick<
      Event,
      | "name"
      | "description"
      | "startsAt"
      | "endsAt"
      | "location"
      | "city"
      | "category"
      | "maxParticipants"
      | "imageUrl"
      | "status"
    >
  >,
): Promise<EventView | undefined> => {
  const event = _events.get(id);
  if (!event) return undefined;
  const updated: Event = { ...event, ...patch, updatedAt: now() };
  _events.set(id, updated);
  return toEventView(updated);
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  if (!_events.has(id)) return false;
  _events.delete(id);
  return true;
};

export const addParticipant = async (
  eventId: string,
  userId: string,
): Promise<EventView | "not_found" | "closed" | "full" | "already_joined"> => {
  const event = _events.get(eventId);
  if (!event) return "not_found";
  if (event.status !== "open") return "closed";
  if (event.participants.includes(userId)) return "already_joined";
  if (event.maxParticipants && event.participants.length >= event.maxParticipants) return "full";

  const updated: Event = {
    ...event,
    participants: [...event.participants, userId],
    updatedAt: now(),
  };
  _events.set(eventId, updated);
  return toEventView(updated);
};

export const removeParticipant = async (
  eventId: string,
  userId: string,
): Promise<EventView | "not_found" | "not_joined"> => {
  const event = _events.get(eventId);
  if (!event) return "not_found";
  if (!event.participants.includes(userId)) return "not_joined";

  const updated: Event = {
    ...event,
    participants: event.participants.filter((p) => p !== userId),
    updatedAt: now(),
  };
  _events.set(eventId, updated);
  return toEventView(updated);
};

export const listEventParticipants = async (eventId: string): Promise<PublicUser[] | undefined> => {
  const event = _events.get(eventId);
  if (!event) return undefined;
  return event.participants
    .map((uid) => _users.get(uid))
    .filter((u): u is User => Boolean(u))
    .map(sanitizeUser);
};

// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------

export const logModerationAction = async (
  input: Omit<ModerationAction, "id" | "createdAt">,
): Promise<ModerationAction> => {
  const id = newId();
  const action: ModerationAction = { ...input, id, createdAt: now() };
  _modActions.set(id, action);
  return action;
};

// ---------------------------------------------------------------------------
// Re-exported helper (identical to store.ts)
// ---------------------------------------------------------------------------

export const toSafeEventView = (event: Event): EventView => toEventView(event);

// ---------------------------------------------------------------------------
// Test utility — clears all in-memory data (use in beforeEach)
// ---------------------------------------------------------------------------

export const resetMemoryStore = (): void => {
  _users.clear();
  _events.clear();
  _modActions.clear();
};
