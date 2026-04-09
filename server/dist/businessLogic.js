"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderateEventRemoval = exports.removeUserByAdmin = exports.changeUserRole = exports.listUsersForAdmin = exports.removeParticipantFromEvent = exports.listParticipantsForEvent = exports.listOrganizerEvents = exports.removeEvent = exports.editOrganizerEvent = exports.createOrganizerEvent = exports.cancelParticipation = exports.confirmParticipation = exports.getEventDetails = exports.browseEvents = exports.loginUser = exports.registerUser = void 0;
const store_1 = require("./store");
const normalizeIso = (value) => new Date(value).toISOString();
const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};
const registerUser = async (input) => {
    assert(Boolean(input.email?.trim()), "E-mail is required");
    assert(input.password.length >= 8, "Password must be at least 8 characters");
    assert(input.password === input.confirmPassword, "Passwords must match");
    assert(!(await (0, store_1.getUserByEmail)(input.email)), "User with this e-mail already exists");
    return (0, store_1.createUser)({
        email: input.email,
        password: input.password,
        fullName: input.fullName,
        role: "user",
    });
};
exports.registerUser = registerUser;
const loginUser = async (input) => {
    const user = await (0, store_1.getUserByEmail)(input.email);
    assert(Boolean(user), "Invalid e-mail or password");
    assert(user?.password === input.password, "Invalid e-mail or password");
    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
    };
};
exports.loginUser = loginUser;
const browseEvents = async (filters = {}) => (0, store_1.listEvents)(filters);
exports.browseEvents = browseEvents;
const getEventDetails = async (eventId) => {
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    const organizer = await (0, store_1.getPublicUserById)(event.organizerId);
    return {
        event: (0, store_1.toSafeEventView)(event),
        organizer,
    };
};
exports.getEventDetails = getEventDetails;
const confirmParticipation = async (eventId, userId) => {
    assert(Boolean(await (0, store_1.getUserById)(userId)), "User not found");
    const result = await (0, store_1.addParticipant)(eventId, userId);
    assert(result !== "not_found", "Event not found");
    assert(result !== "closed", "Event is closed");
    assert(result !== "full", "Event reached maximum number of participants");
    assert(result !== "already_joined", "User already joined this event");
    if (typeof result === "string") {
        throw new Error("Unexpected participation state");
    }
    return result;
};
exports.confirmParticipation = confirmParticipation;
const cancelParticipation = async (eventId, userId) => {
    const result = await (0, store_1.removeParticipant)(eventId, userId);
    assert(result !== "not_found", "Event not found");
    assert(result !== "not_joined", "User is not a participant of this event");
    if (typeof result === "string") {
        throw new Error("Unexpected participation state");
    }
    return result;
};
exports.cancelParticipation = cancelParticipation;
const createOrganizerEvent = async (organizerId, input) => {
    const organizer = await (0, store_1.getUserById)(organizerId);
    assert(Boolean(organizer), "Organizer not found");
    assert(organizer.role === "organizer" || organizer.role === "admin", "Only organizer or admin can create event");
    assert(new Date(input.endsAt) > new Date(input.startsAt), "endsAt must be greater than startsAt");
    return (0, store_1.createEvent)({
        ...input,
        startsAt: normalizeIso(input.startsAt),
        endsAt: normalizeIso(input.endsAt),
        organizerId,
        status: input.status ?? "open",
    });
};
exports.createOrganizerEvent = createOrganizerEvent;
const editOrganizerEvent = async (actorId, eventId, patch) => {
    const actor = await (0, store_1.getUserById)(actorId);
    assert(Boolean(actor), "Actor not found");
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    const isOwner = event.organizerId === actorId;
    const isAdmin = actor.role === "admin";
    assert(isOwner || isAdmin, "Only owner or admin can edit this event");
    const startsAt = patch.startsAt
        ? normalizeIso(patch.startsAt)
        : event.startsAt;
    const endsAt = patch.endsAt ? normalizeIso(patch.endsAt) : event.endsAt;
    assert(new Date(endsAt) > new Date(startsAt), "endsAt must be greater than startsAt");
    const updated = await (0, store_1.updateEvent)(eventId, {
        ...patch,
        startsAt: patch.startsAt ? startsAt : undefined,
        endsAt: patch.endsAt ? endsAt : undefined,
    });
    assert(Boolean(updated), "Event not found");
    return updated;
};
exports.editOrganizerEvent = editOrganizerEvent;
const removeEvent = async (actorId, eventId) => {
    const actor = await (0, store_1.getUserById)(actorId);
    assert(Boolean(actor), "Actor not found");
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    const isOwner = event.organizerId === actorId;
    const isAdmin = actor.role === "admin";
    assert(isOwner || isAdmin, "Only owner or admin can delete this event");
    await (0, store_1.deleteEvent)(eventId);
};
exports.removeEvent = removeEvent;
const listOrganizerEvents = async (actorId) => {
    const actor = await (0, store_1.getUserById)(actorId);
    assert(Boolean(actor), "Actor not found");
    if (actor.role === "admin") {
        return (0, store_1.listEvents)({});
    }
    assert(actor.role === "organizer", "Only organizer or admin can list own events");
    return (0, store_1.listEventsByOrganizer)(actorId);
};
exports.listOrganizerEvents = listOrganizerEvents;
const listParticipantsForEvent = async (actorId, eventId) => {
    const actor = await (0, store_1.getUserById)(actorId);
    assert(Boolean(actor), "Actor not found");
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    const isOwner = event.organizerId === actorId;
    const isAdmin = actor.role === "admin";
    assert(isOwner || isAdmin, "Only owner or admin can view participants");
    return (await (0, store_1.listEventParticipants)(eventId)) ?? [];
};
exports.listParticipantsForEvent = listParticipantsForEvent;
const removeParticipantFromEvent = async (actorId, eventId, participantId) => {
    const actor = await (0, store_1.getUserById)(actorId);
    assert(Boolean(actor), "Actor not found");
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    const isOwner = event.organizerId === actorId;
    const isAdmin = actor.role === "admin";
    assert(isOwner || isAdmin, "Only owner or admin can remove participants");
    const result = await (0, store_1.removeParticipant)(eventId, participantId);
    assert(result !== "not_found", "Event not found");
    assert(result !== "not_joined", "Participant not found in this event");
    if (typeof result === "string") {
        throw new Error("Unexpected participation state");
    }
    return result;
};
exports.removeParticipantFromEvent = removeParticipantFromEvent;
const listUsersForAdmin = async (adminId) => {
    const admin = await (0, store_1.getUserById)(adminId);
    assert(Boolean(admin), "Admin not found");
    assert(admin.role === "admin", "Only admin can list users");
    return (0, store_1.getPublicUsers)();
};
exports.listUsersForAdmin = listUsersForAdmin;
const changeUserRole = async (adminId, userId, role) => {
    const admin = await (0, store_1.getUserById)(adminId);
    assert(Boolean(admin), "Admin not found");
    assert(admin.role === "admin", "Only admin can change roles");
    const updated = await (0, store_1.updateUser)(userId, { role });
    assert(Boolean(updated), "User not found");
    return updated;
};
exports.changeUserRole = changeUserRole;
const removeUserByAdmin = async (adminId, userId) => {
    const admin = await (0, store_1.getUserById)(adminId);
    assert(Boolean(admin), "Admin not found");
    assert(admin.role === "admin", "Only admin can delete users");
    assert(adminId !== userId, "Administrator cannot delete own account");
    const deleted = await (0, store_1.deleteUser)(userId);
    assert(deleted, "User not found");
};
exports.removeUserByAdmin = removeUserByAdmin;
const moderateEventRemoval = async (adminId, eventId, reason) => {
    const admin = await (0, store_1.getUserById)(adminId);
    assert(Boolean(admin), "Admin not found");
    assert(admin.role === "admin", "Only admin can moderate content");
    const event = await (0, store_1.getEventById)(eventId);
    assert(Boolean(event), "Event not found");
    await (0, store_1.deleteEvent)(eventId);
    const log = await (0, store_1.logModerationAction)({
        adminId,
        eventId,
        action: "remove_event",
        reason,
    });
    return { moderationId: log.id };
};
exports.moderateEventRemoval = moderateEventRemoval;
