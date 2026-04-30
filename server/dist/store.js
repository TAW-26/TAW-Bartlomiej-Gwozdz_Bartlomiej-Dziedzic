"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSafeEventView = exports.logModerationAction = exports.listEventParticipants = exports.removeParticipant = exports.addParticipant = exports.deleteEvent = exports.updateEvent = exports.listEventsByParticipant = exports.listEventsByOrganizer = exports.listEvents = exports.getEventById = exports.createEvent = exports.deleteUser = exports.updateUser = exports.getPublicUsers = exports.getPublicUserById = exports.getUserById = exports.getUserByEmail = exports.createUser = exports.ensureAdminSeed = exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    fullName: { type: String },
    role: {
        type: String,
        enum: ["user", "organizer", "admin"],
        required: true,
        default: "user",
    },
    createdAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false });
const eventSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    category: { type: String, required: true },
    maxParticipants: { type: Number },
    imageUrl: { type: String },
    organizerId: { type: String, required: true },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    participants: { type: [String], default: [] },
}, { timestamps: true, versionKey: false });
const moderationActionSchema = new mongoose_1.default.Schema({
    adminId: { type: String, required: true },
    eventId: { type: String, required: true },
    action: {
        type: String,
        enum: ["remove_event"],
        required: true,
        default: "remove_event",
    },
    reason: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false });
const UserModel = mongoose_1.default.models.User ||
    mongoose_1.default.model("User", userSchema);
const EventModel = mongoose_1.default.models.Event ||
    mongoose_1.default.model("Event", eventSchema);
const ModerationActionModel = mongoose_1.default.models.ModerationAction ||
    mongoose_1.default.model("ModerationAction", moderationActionSchema);
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
const mapUserDocument = (doc) => ({
    id: doc._id.toString(),
    email: doc.email,
    password: doc.password,
    fullName: doc.fullName,
    role: doc.role,
    createdAt: doc.createdAt.toISOString(),
});
const mapEventDocument = (doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    startsAt: doc.startsAt.toISOString(),
    endsAt: doc.endsAt.toISOString(),
    location: doc.location,
    city: doc.city,
    category: doc.category,
    maxParticipants: doc.maxParticipants,
    imageUrl: doc.imageUrl,
    organizerId: doc.organizerId,
    status: doc.status,
    participants: doc.participants,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
exports.db = {
    UserModel,
    EventModel,
    ModerationActionModel,
};
const ensureAdminSeed = async () => {
    const existing = await UserModel.findOne({ role: "admin" }).exec();
    if (existing) {
        return;
    }
    await UserModel.create({
        email: "admin@local-events.app",
        password: "admin1234",
        fullName: "System Administrator",
        role: "admin",
    });
};
exports.ensureAdminSeed = ensureAdminSeed;
const createUser = async (input) => {
    const created = await UserModel.create({
        email: input.email.toLowerCase().trim(),
        password: input.password,
        fullName: input.fullName,
        role: input.role ?? "user",
    });
    return sanitizeUser(mapUserDocument(created));
};
exports.createUser = createUser;
const getUserByEmail = async (email) => {
    const user = await UserModel.findOne({
        email: email.toLowerCase().trim(),
    }).exec();
    return user ? mapUserDocument(user) : undefined;
};
exports.getUserByEmail = getUserByEmail;
const getUserById = async (id) => {
    const user = await UserModel.findById(id).exec();
    return user ? mapUserDocument(user) : undefined;
};
exports.getUserById = getUserById;
const getPublicUserById = async (id) => {
    const user = await (0, exports.getUserById)(id);
    return user ? sanitizeUser(user) : undefined;
};
exports.getPublicUserById = getPublicUserById;
const getPublicUsers = async () => {
    const users = await UserModel.find({}).exec();
    return users.map((user) => sanitizeUser(mapUserDocument(user)));
};
exports.getPublicUsers = getPublicUsers;
const updateUser = async (id, patch) => {
    const updated = await UserModel.findByIdAndUpdate(id, {
        ...(patch.fullName !== undefined ? { fullName: patch.fullName } : {}),
        ...(patch.password !== undefined ? { password: patch.password } : {}),
        ...(patch.role !== undefined ? { role: patch.role } : {}),
    }, { new: true }).exec();
    return updated ? sanitizeUser(mapUserDocument(updated)) : undefined;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const deleted = await UserModel.findByIdAndDelete(id).exec();
    if (!deleted) {
        return false;
    }
    await EventModel.deleteMany({ organizerId: id }).exec();
    await EventModel.updateMany({}, { $pull: { participants: id } }).exec();
    return true;
};
exports.deleteUser = deleteUser;
const createEvent = async (input) => {
    const created = await EventModel.create({
        name: input.name,
        description: input.description,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(input.endsAt),
        location: input.location,
        city: input.city,
        category: input.category,
        maxParticipants: input.maxParticipants,
        imageUrl: input.imageUrl,
        organizerId: input.organizerId,
        status: input.status,
        participants: [],
    });
    return toEventView(mapEventDocument(created));
};
exports.createEvent = createEvent;
const getEventById = async (id) => {
    const event = await EventModel.findById(id).exec();
    return event ? mapEventDocument(event) : undefined;
};
exports.getEventById = getEventById;
const listEvents = async (filters) => {
    const query = {};
    if (filters.q?.trim()) {
        const qRegex = new RegExp(escapeRegex(filters.q.trim()), "i");
        query.$or = [
            { name: qRegex },
            { description: qRegex },
            { location: qRegex },
            { city: qRegex },
        ];
    }
    if (filters.city?.trim()) {
        query.city = new RegExp(`^${escapeRegex(filters.city.trim())}$`, "i");
    }
    if (filters.category?.trim()) {
        query.category = new RegExp(`^${escapeRegex(filters.category.trim())}$`, "i");
    }
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.from || filters.to) {
        query.startsAt = {
            ...(filters.from ? { $gte: new Date(filters.from) } : {}),
            ...(filters.to ? { $lte: new Date(filters.to) } : {}),
        };
    }
    const events = await EventModel.find(query).exec();
    return events
        .map(mapEventDocument)
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
const listEventsByOrganizer = async (organizerId) => {
    const events = await EventModel.find({ organizerId }).exec();
    return events.map(mapEventDocument).map(toEventView);
};
exports.listEventsByOrganizer = listEventsByOrganizer;
const listEventsByParticipant = async (userId) => {
    const events = await EventModel.find({ participants: userId }).exec();
    return events
        .map(mapEventDocument)
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
exports.listEventsByParticipant = listEventsByParticipant;
const updateEvent = async (id, patch) => {
    const updated = await EventModel.findByIdAndUpdate(id, {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined
            ? { description: patch.description }
            : {}),
        ...(patch.startsAt !== undefined
            ? { startsAt: new Date(patch.startsAt) }
            : {}),
        ...(patch.endsAt !== undefined ? { endsAt: new Date(patch.endsAt) } : {}),
        ...(patch.location !== undefined ? { location: patch.location } : {}),
        ...(patch.city !== undefined ? { city: patch.city } : {}),
        ...(patch.category !== undefined ? { category: patch.category } : {}),
        ...(patch.maxParticipants !== undefined
            ? { maxParticipants: patch.maxParticipants }
            : {}),
        ...(patch.imageUrl !== undefined ? { imageUrl: patch.imageUrl } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
    }, { new: true }).exec();
    return updated ? toEventView(mapEventDocument(updated)) : undefined;
};
exports.updateEvent = updateEvent;
const deleteEvent = async (id) => {
    const deleted = await EventModel.findByIdAndDelete(id).exec();
    return Boolean(deleted);
};
exports.deleteEvent = deleteEvent;
const addParticipant = async (eventId, userId) => {
    const event = await EventModel.findById(eventId).exec();
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
    await event.save();
    return toEventView(mapEventDocument(event));
};
exports.addParticipant = addParticipant;
const removeParticipant = async (eventId, userId) => {
    const event = await EventModel.findById(eventId).exec();
    if (!event) {
        return "not_found";
    }
    if (!event.participants.includes(userId)) {
        return "not_joined";
    }
    event.participants = event.participants.filter((participantId) => participantId !== userId);
    await event.save();
    return toEventView(mapEventDocument(event));
};
exports.removeParticipant = removeParticipant;
const listEventParticipants = async (eventId) => {
    const event = await EventModel.findById(eventId).exec();
    if (!event) {
        return undefined;
    }
    const users = await UserModel.find({
        _id: { $in: event.participants },
    }).exec();
    return users.map((user) => sanitizeUser(mapUserDocument(user)));
};
exports.listEventParticipants = listEventParticipants;
const logModerationAction = async (input) => {
    const created = await ModerationActionModel.create({
        adminId: input.adminId,
        eventId: input.eventId,
        action: "remove_event",
        reason: input.reason,
    });
    return {
        id: created._id.toString(),
        adminId: created.adminId,
        eventId: created.eventId,
        action: created.action,
        reason: created.reason,
        createdAt: created.createdAt.toISOString(),
    };
};
exports.logModerationAction = logModerationAction;
const toSafeEventView = (event) => toEventView(event);
exports.toSafeEventView = toSafeEventView;
// ---------------------------------------------------------------------------
// In-memory override
// When USE_MEMORY_DB=true all exported functions are replaced with in-memory
// implementations so the server works without a MongoDB connection.
// ---------------------------------------------------------------------------
if (process.env.USE_MEMORY_DB === "true") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mem = require("./store-memory");
    Object.assign(exports, mem);
    console.log("[MemDB] In-memory store activated (USE_MEMORY_DB=true).");
}
