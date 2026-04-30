"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeEventView = exports.logModerationAction = exports.listEventParticipants = exports.removeParticipant = exports.addParticipant = exports.deleteEvent = exports.updateEvent = exports.listEventsByParticipant = exports.listEventsByOrganizer = exports.listEvents = exports.getEventById = exports.createEvent = exports.deleteUser = exports.updateUser = exports.getPublicUsers = exports.getPublicUserById = exports.getUserById = exports.getUserByEmail = exports.createUser = exports.db = exports.ensureAdminSeed = void 0;
/**
 * In-memory store — używany gdy USE_MEMORY_DB=true.
 * Eksportuje dokładnie te same funkcje co store.ts, ale trzyma dane w pamięci RAM.
 * Dane są resetowane przy każdym restarcie serwera.
 */
const crypto_1 = __importDefault(require("crypto"));
// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------
const _users = new Map();
const _events = new Map();
const _modActions = new Map();
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const newId = () => crypto_1.default.randomBytes(12).toString("hex");
const now = () => new Date().toISOString();
const sanitizeUser = (user) => ({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    createdAt: user.createdAt,
});
const toEventView = (event) => ({
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
const escapeRegex = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
const ensureAdminSeed = async () => {
    const existing = [..._users.values()].find((u) => u.role === "admin");
    if (existing)
        return;
    const adminId = newId();
    const ts = now();
    _users.set(adminId, {
        id: adminId,
        email: "admin@local-events.app",
        password: "admin1234",
        fullName: "System Administrator",
        role: "admin",
        createdAt: ts,
    });
    // Seed organisatora (do testów)
    const orgId = newId();
    _users.set(orgId, {
        id: orgId,
        email: "organizer@local-events.app",
        password: "organizer1234",
        fullName: "Jan Kowalski",
        role: "organizer",
        createdAt: ts,
    });
    // Seed zwykłego użytkownika
    const userId = newId();
    _users.set(userId, {
        id: userId,
        email: "user@example.com",
        password: "password123",
        fullName: "Test User",
        role: "user",
        createdAt: ts,
    });
    // Seed przykładowych wydarzeń (organizator: admin)
    const seedEvents = [
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
        _events.set(id, { ...ev, id, participants: [], createdAt: ts, updatedAt: ts });
    }
    console.log("[MemDB] Seeded admin, organizer, user and 4 sample events.");
    console.log("[MemDB] Admin:     admin@local-events.app / admin1234");
    console.log("[MemDB] Organizer: organizer@local-events.app / organizer1234");
    console.log("[MemDB] User:      user@example.com / password123");
};
exports.ensureAdminSeed = ensureAdminSeed;
// ---------------------------------------------------------------------------
// Fake db export (null models – not used in memory mode)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.db = {
    UserModel: null,
    EventModel: null,
    ModerationActionModel: null,
};
// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------
const createUser = async (input) => {
    const id = newId();
    const user = {
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
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    const lower = email.toLowerCase().trim();
    return [..._users.values()].find((u) => u.email === lower);
};
exports.getUserByEmail = getUserByEmail;
const getUserById = async (id) => _users.get(id);
exports.getUserById = getUserById;
const getPublicUserById = async (id) => {
    const user = _users.get(id);
    return user ? sanitizeUser(user) : undefined;
};
exports.getPublicUserById = getPublicUserById;
const getPublicUsers = async () => [..._users.values()].map(sanitizeUser);
exports.getPublicUsers = getPublicUsers;
const updateUser = async (id, patch) => {
    const user = _users.get(id);
    if (!user)
        return undefined;
    const updated = { ...user, ...patch };
    _users.set(id, updated);
    return sanitizeUser(updated);
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    if (!_users.has(id))
        return false;
    _users.delete(id);
    // Remove organizer's events
    for (const [eid, ev] of _events) {
        if (ev.organizerId === id)
            _events.delete(eid);
    }
    // Remove from participants
    for (const [eid, ev] of _events) {
        if (ev.participants.includes(id)) {
            _events.set(eid, {
                ...ev,
                participants: ev.participants.filter((p) => p !== id),
                updatedAt: now(),
            });
        }
    }
    return true;
};
exports.deleteUser = deleteUser;
// ---------------------------------------------------------------------------
// Event operations
// ---------------------------------------------------------------------------
const createEvent = async (input) => {
    const id = newId();
    const ts = now();
    const event = { ...input, id, participants: [], createdAt: ts, updatedAt: ts };
    _events.set(id, event);
    return toEventView(event);
};
exports.createEvent = createEvent;
const getEventById = async (id) => _events.get(id);
exports.getEventById = getEventById;
const listEvents = async (filters) => {
    let result = [..._events.values()];
    if (filters.q?.trim()) {
        const re = new RegExp(escapeRegex(filters.q.trim()), "i");
        result = result.filter((e) => re.test(e.name) || re.test(e.description) || re.test(e.location) || re.test(e.city));
    }
    if (filters.city?.trim()) {
        const re = new RegExp(`^${escapeRegex(filters.city.trim())}$`, "i");
        result = result.filter((e) => re.test(e.city));
    }
    if (filters.category?.trim()) {
        const re = new RegExp(`^${escapeRegex(filters.category.trim())}$`, "i");
        result = result.filter((e) => re.test(e.category));
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
exports.listEvents = listEvents;
const listEventsByOrganizer = async (organizerId) => {
    return [..._events.values()]
        .filter((e) => e.organizerId === organizerId)
        .map(toEventView);
};
exports.listEventsByOrganizer = listEventsByOrganizer;
const listEventsByParticipant = async (userId) => {
    return [..._events.values()]
        .filter((e) => e.participants.includes(userId))
        .sort((a, b) => {
        if (b.participants.length !== a.participants.length)
            return b.participants.length - a.participants.length;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
        .map(toEventView);
};
exports.listEventsByParticipant = listEventsByParticipant;
const updateEvent = async (id, patch) => {
    const event = _events.get(id);
    if (!event)
        return undefined;
    const updated = { ...event, ...patch, updatedAt: now() };
    _events.set(id, updated);
    return toEventView(updated);
};
exports.updateEvent = updateEvent;
const deleteEvent = async (id) => {
    if (!_events.has(id))
        return false;
    _events.delete(id);
    return true;
};
exports.deleteEvent = deleteEvent;
const addParticipant = async (eventId, userId) => {
    const event = _events.get(eventId);
    if (!event)
        return "not_found";
    if (event.status !== "open")
        return "closed";
    if (event.participants.includes(userId))
        return "already_joined";
    if (event.maxParticipants && event.participants.length >= event.maxParticipants)
        return "full";
    const updated = {
        ...event,
        participants: [...event.participants, userId],
        updatedAt: now(),
    };
    _events.set(eventId, updated);
    return toEventView(updated);
};
exports.addParticipant = addParticipant;
const removeParticipant = async (eventId, userId) => {
    const event = _events.get(eventId);
    if (!event)
        return "not_found";
    if (!event.participants.includes(userId))
        return "not_joined";
    const updated = {
        ...event,
        participants: event.participants.filter((p) => p !== userId),
        updatedAt: now(),
    };
    _events.set(eventId, updated);
    return toEventView(updated);
};
exports.removeParticipant = removeParticipant;
const listEventParticipants = async (eventId) => {
    const event = _events.get(eventId);
    if (!event)
        return undefined;
    return event.participants
        .map((uid) => _users.get(uid))
        .filter((u) => Boolean(u))
        .map(sanitizeUser);
};
exports.listEventParticipants = listEventParticipants;
// ---------------------------------------------------------------------------
// Moderation
// ---------------------------------------------------------------------------
const logModerationAction = async (input) => {
    const id = newId();
    const action = { ...input, id, createdAt: now() };
    _modActions.set(id, action);
    return action;
};
exports.logModerationAction = logModerationAction;
// ---------------------------------------------------------------------------
// Re-exported helper (identical to store.ts)
// ---------------------------------------------------------------------------
const toSafeEventView = (event) => toEventView(event);
exports.toSafeEventView = toSafeEventView;
