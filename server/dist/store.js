"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeEventView = exports.logModerationAction = exports.listEventParticipants = exports.removeParticipant = exports.addParticipant = exports.deleteEvent = exports.updateEvent = exports.listEventsByOrganizer = exports.listEvents = exports.getEventById = exports.createEvent = exports.deleteUser = exports.updateUser = exports.getPublicUsers = exports.getPublicUserById = exports.getUserById = exports.getUserByEmail = exports.createUser = exports.db = void 0;
const crypto_1 = require("crypto");
const users = [];
const events = [];
const moderationLog = [];
const nowIso = () => new Date().toISOString();
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
const seedAdmin = () => {
    if (users.some((item) => item.role === "admin")) {
        return;
    }
    users.push({
        id: (0, crypto_1.randomUUID)(),
        email: "admin@local-events.app",
        password: "admin1234",
        fullName: "System Administrator",
        role: "admin",
        createdAt: nowIso(),
    });
};
seedAdmin();
exports.db = {
    users,
    events,
    moderationLog,
};
const createUser = (input) => {
    const user = {
        id: (0, crypto_1.randomUUID)(),
        email: input.email.toLowerCase().trim(),
        password: input.password,
        fullName: input.fullName,
        role: input.role ?? "user",
        createdAt: nowIso(),
    };
    users.push(user);
    return sanitizeUser(user);
};
exports.createUser = createUser;
const getUserByEmail = (email) => users.find((user) => user.email === email.toLowerCase().trim());
exports.getUserByEmail = getUserByEmail;
const getUserById = (id) => users.find((user) => user.id === id);
exports.getUserById = getUserById;
const getPublicUserById = (id) => {
    const user = (0, exports.getUserById)(id);
    return user ? sanitizeUser(user) : undefined;
};
exports.getPublicUserById = getPublicUserById;
const getPublicUsers = () => users.map(sanitizeUser);
exports.getPublicUsers = getPublicUsers;
const updateUser = (id, patch) => {
    const user = (0, exports.getUserById)(id);
    if (!user) {
        return undefined;
    }
    if (patch.fullName !== undefined) {
        user.fullName = patch.fullName;
    }
    if (patch.password !== undefined) {
        user.password = patch.password;
    }
    if (patch.role !== undefined) {
        user.role = patch.role;
    }
    return sanitizeUser(user);
};
exports.updateUser = updateUser;
const deleteUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
        return false;
    }
    users.splice(index, 1);
    for (let idx = events.length - 1; idx >= 0; idx -= 1) {
        if (events[idx].organizerId === id) {
            events.splice(idx, 1);
            continue;
        }
        events[idx].participants = events[idx].participants.filter((participantId) => participantId !== id);
    }
    return true;
};
exports.deleteUser = deleteUser;
const createEvent = (input) => {
    const createdAt = nowIso();
    const event = {
        id: (0, crypto_1.randomUUID)(),
        name: input.name,
        description: input.description,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        location: input.location,
        city: input.city,
        category: input.category,
        maxParticipants: input.maxParticipants,
        imageUrl: input.imageUrl,
        organizerId: input.organizerId,
        status: input.status,
        participants: [],
        createdAt,
        updatedAt: createdAt,
    };
    events.push(event);
    return toEventView(event);
};
exports.createEvent = createEvent;
const getEventById = (id) => events.find((event) => event.id === id);
exports.getEventById = getEventById;
const listEvents = (filters) => {
    const fromDate = filters.from ? new Date(filters.from) : undefined;
    const toDate = filters.to ? new Date(filters.to) : undefined;
    return events
        .filter((event) => {
        if (filters.q) {
            const q = filters.q.toLowerCase().trim();
            const match = event.name.toLowerCase().includes(q) ||
                event.description.toLowerCase().includes(q) ||
                event.location.toLowerCase().includes(q) ||
                event.city.toLowerCase().includes(q);
            if (!match) {
                return false;
            }
        }
        if (filters.city &&
            event.city.toLowerCase() !== filters.city.toLowerCase()) {
            return false;
        }
        if (filters.category &&
            event.category.toLowerCase() !== filters.category.toLowerCase()) {
            return false;
        }
        if (filters.status && event.status !== filters.status) {
            return false;
        }
        if (fromDate && new Date(event.startsAt) < fromDate) {
            return false;
        }
        if (toDate && new Date(event.startsAt) > toDate) {
            return false;
        }
        return true;
    })
        .sort((left, right) => {
        const leftPopularity = left.participants.length;
        const rightPopularity = right.participants.length;
        if (rightPopularity !== leftPopularity) {
            return rightPopularity - leftPopularity;
        }
        return (new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
    })
        .map(toEventView);
};
exports.listEvents = listEvents;
const listEventsByOrganizer = (organizerId) => events.filter((event) => event.organizerId === organizerId).map(toEventView);
exports.listEventsByOrganizer = listEventsByOrganizer;
const updateEvent = (id, patch) => {
    const event = (0, exports.getEventById)(id);
    if (!event) {
        return undefined;
    }
    if (patch.name !== undefined) {
        event.name = patch.name;
    }
    if (patch.description !== undefined) {
        event.description = patch.description;
    }
    if (patch.startsAt !== undefined) {
        event.startsAt = patch.startsAt;
    }
    if (patch.endsAt !== undefined) {
        event.endsAt = patch.endsAt;
    }
    if (patch.location !== undefined) {
        event.location = patch.location;
    }
    if (patch.city !== undefined) {
        event.city = patch.city;
    }
    if (patch.category !== undefined) {
        event.category = patch.category;
    }
    if (patch.maxParticipants !== undefined) {
        event.maxParticipants = patch.maxParticipants;
    }
    if (patch.imageUrl !== undefined) {
        event.imageUrl = patch.imageUrl;
    }
    if (patch.status !== undefined) {
        event.status = patch.status;
    }
    event.updatedAt = nowIso();
    return toEventView(event);
};
exports.updateEvent = updateEvent;
const deleteEvent = (id) => {
    const index = events.findIndex((event) => event.id === id);
    if (index === -1) {
        return false;
    }
    events.splice(index, 1);
    return true;
};
exports.deleteEvent = deleteEvent;
const addParticipant = (eventId, userId) => {
    const event = (0, exports.getEventById)(eventId);
    if (!event) {
        return "not_found";
    }
    if (event.status !== "open") {
        return "closed";
    }
    if (event.participants.includes(userId)) {
        return "already_joined";
    }
    if (event.maxParticipants &&
        event.participants.length >= event.maxParticipants) {
        return "full";
    }
    event.participants.push(userId);
    event.updatedAt = nowIso();
    return toEventView(event);
};
exports.addParticipant = addParticipant;
const removeParticipant = (eventId, userId) => {
    const event = (0, exports.getEventById)(eventId);
    if (!event) {
        return "not_found";
    }
    const hadUser = event.participants.includes(userId);
    if (!hadUser) {
        return "not_joined";
    }
    event.participants = event.participants.filter((participantId) => participantId !== userId);
    event.updatedAt = nowIso();
    return toEventView(event);
};
exports.removeParticipant = removeParticipant;
const listEventParticipants = (eventId) => {
    const event = (0, exports.getEventById)(eventId);
    if (!event) {
        return undefined;
    }
    return event.participants
        .map((participantId) => (0, exports.getUserById)(participantId))
        .filter((user) => Boolean(user))
        .map(sanitizeUser);
};
exports.listEventParticipants = listEventParticipants;
const logModerationAction = (input) => {
    const action = {
        id: (0, crypto_1.randomUUID)(),
        adminId: input.adminId,
        eventId: input.eventId,
        action: "remove_event",
        reason: input.reason,
        createdAt: nowIso(),
    };
    moderationLog.push(action);
    return action;
};
exports.logModerationAction = logModerationAction;
const toSafeEventView = (event) => toEventView(event);
exports.toSafeEventView = toSafeEventView;
