import mongoose, { FilterQuery } from "mongoose";
import {
  Event,
  EventView,
  ModerationAction,
  PublicUser,
  User,
  UserRole,
} from "./types";

interface UserDb {
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  createdAt: Date;
}

interface EventDb {
  name: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  location: string;
  city: string;
  category: string;
  maxParticipants?: number;
  imageUrl?: string;
  organizerId: string;
  status: "open" | "closed";
  participants: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ModerationActionDb {
  adminId: string;
  eventId: string;
  action: "remove_event";
  reason?: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<UserDb>(
  {
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
  },
  { versionKey: false },
);

const eventSchema = new mongoose.Schema<EventDb>(
  {
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
  },
  { timestamps: true, versionKey: false },
);

const moderationActionSchema = new mongoose.Schema<ModerationActionDb>(
  {
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
  },
  { versionKey: false },
);

const UserModel =
  (mongoose.models.User as mongoose.Model<UserDb>) ||
  mongoose.model<UserDb>("User", userSchema);

const EventModel =
  (mongoose.models.Event as mongoose.Model<EventDb>) ||
  mongoose.model<EventDb>("Event", eventSchema);

const ModerationActionModel =
  (mongoose.models.ModerationAction as mongoose.Model<ModerationActionDb>) ||
  mongoose.model<ModerationActionDb>(
    "ModerationAction",
    moderationActionSchema,
  );

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

const mapUserDocument = (doc: mongoose.HydratedDocument<UserDb>): User => ({
  id: doc._id.toString(),
  email: doc.email,
  password: doc.password,
  fullName: doc.fullName,
  role: doc.role,
  createdAt: doc.createdAt.toISOString(),
});

const mapEventDocument = (doc: mongoose.HydratedDocument<EventDb>): Event => ({
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

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const db = {
  UserModel,
  EventModel,
  ModerationActionModel,
};

export const ensureAdminSeed = async (): Promise<void> => {
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

export const createUser = async (input: {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
}): Promise<PublicUser> => {
  const created = await UserModel.create({
    email: input.email.toLowerCase().trim(),
    password: input.password,
    fullName: input.fullName,
    role: input.role ?? "user",
  });

  return sanitizeUser(mapUserDocument(created));
};

export const getUserByEmail = async (
  email: string,
): Promise<User | undefined> => {
  const user = await UserModel.findOne({
    email: email.toLowerCase().trim(),
  }).exec();
  return user ? mapUserDocument(user) : undefined;
};

export const getUserById = async (id: string): Promise<User | undefined> => {
  const user = await UserModel.findById(id).exec();
  return user ? mapUserDocument(user) : undefined;
};

export const getPublicUserById = async (
  id: string,
): Promise<PublicUser | undefined> => {
  const user = await getUserById(id);
  return user ? sanitizeUser(user) : undefined;
};

export const getPublicUsers = async (): Promise<PublicUser[]> => {
  const users = await UserModel.find({}).exec();
  return users.map((user) => sanitizeUser(mapUserDocument(user)));
};

export const updateUser = async (
  id: string,
  patch: Partial<Pick<User, "fullName" | "password" | "role">>,
): Promise<PublicUser | undefined> => {
  const updated = await UserModel.findByIdAndUpdate(
    id,
    {
      ...(patch.fullName !== undefined ? { fullName: patch.fullName } : {}),
      ...(patch.password !== undefined ? { password: patch.password } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
    },
    { new: true },
  ).exec();

  return updated ? sanitizeUser(mapUserDocument(updated)) : undefined;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  const deleted = await UserModel.findByIdAndDelete(id).exec();
  if (!deleted) {
    return false;
  }

  await EventModel.deleteMany({ organizerId: id }).exec();
  await EventModel.updateMany({}, { $pull: { participants: id } }).exec();
  return true;
};

export const createEvent = async (
  input: Omit<Event, "id" | "participants" | "createdAt" | "updatedAt">,
): Promise<EventView> => {
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

export const getEventById = async (id: string): Promise<Event | undefined> => {
  const event = await EventModel.findById(id).exec();
  return event ? mapEventDocument(event) : undefined;
};

export const listEvents = async (filters: {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: "open" | "closed";
}): Promise<EventView[]> => {
  const query: FilterQuery<EventDb> = {};

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
    query.category = new RegExp(
      `^${escapeRegex(filters.category.trim())}$`,
      "i",
    );
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

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    })
    .map(toEventView);
};

export const listEventsByOrganizer = async (
  organizerId: string,
): Promise<EventView[]> => {
  const events = await EventModel.find({ organizerId }).exec();
  return events.map(mapEventDocument).map(toEventView);
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
  const updated = await EventModel.findByIdAndUpdate(
    id,
    {
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
    },
    { new: true },
  ).exec();

  return updated ? toEventView(mapEventDocument(updated)) : undefined;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const deleted = await EventModel.findByIdAndDelete(id).exec();
  return Boolean(deleted);
};

export const addParticipant = async (
  eventId: string,
  userId: string,
): Promise<EventView | "not_found" | "closed" | "full" | "already_joined"> => {
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

  if (
    event.maxParticipants &&
    event.participants.length >= event.maxParticipants
  ) {
    return "full";
  }

  event.participants.push(userId);
  await event.save();
  return toEventView(mapEventDocument(event));
};

export const removeParticipant = async (
  eventId: string,
  userId: string,
): Promise<EventView | "not_found" | "not_joined"> => {
  const event = await EventModel.findById(eventId).exec();
  if (!event) {
    return "not_found";
  }

  if (!event.participants.includes(userId)) {
    return "not_joined";
  }

  event.participants = event.participants.filter(
    (participantId) => participantId !== userId,
  );
  await event.save();
  return toEventView(mapEventDocument(event));
};

export const listEventParticipants = async (
  eventId: string,
): Promise<PublicUser[] | undefined> => {
  const event = await EventModel.findById(eventId).exec();
  if (!event) {
    return undefined;
  }

  const users = await UserModel.find({
    _id: { $in: event.participants },
  }).exec();
  return users.map((user) => sanitizeUser(mapUserDocument(user)));
};

export const logModerationAction = async (
  input: Omit<ModerationAction, "id" | "createdAt">,
): Promise<ModerationAction> => {
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

export const toSafeEventView = (event: Event): EventView => toEventView(event);
