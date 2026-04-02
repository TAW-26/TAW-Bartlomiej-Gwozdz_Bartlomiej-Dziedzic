import { randomUUID } from "crypto";
import {
  Event,
  EventView,
  ModerationAction,
  PublicUser,
  User,
  UserRole,
} from "./types";

const users: User[] = [];
const events: Event[] = [];
const moderationLog: ModerationAction[] = [];

const nowIso = () => new Date().toISOString();

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

const seedAdmin = () => {
  if (users.some((item) => item.role === "admin")) {
    return;
  }

  users.push({
    id: randomUUID(),
    email: "admin@local-events.app",
    password: "admin1234",
    fullName: "System Administrator",
    role: "admin",
    createdAt: nowIso(),
  });
};

seedAdmin();

export const db = {
  users,
  events,
  moderationLog,
};

export const createUser = (input: {
  email: string;
  password: string;
  fullName?: string;
  role?: UserRole;
}): PublicUser => {
  const user: User = {
    id: randomUUID(),
    email: input.email.toLowerCase().trim(),
    password: input.password,
    fullName: input.fullName,
    role: input.role ?? "user",
    createdAt: nowIso(),
  };

  users.push(user);
  return sanitizeUser(user);
};

export const getUserByEmail = (email: string): User | undefined =>
  users.find((user) => user.email === email.toLowerCase().trim());

export const getUserById = (id: string): User | undefined =>
  users.find((user) => user.id === id);

export const getPublicUserById = (id: string): PublicUser | undefined => {
  const user = getUserById(id);
  return user ? sanitizeUser(user) : undefined;
};

export const getPublicUsers = (): PublicUser[] => users.map(sanitizeUser);

export const updateUser = (
  id: string,
  patch: Partial<Pick<User, "fullName" | "password" | "role">>,
): PublicUser | undefined => {
  const user = getUserById(id);
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

export const deleteUser = (id: string): boolean => {
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

    events[idx].participants = events[idx].participants.filter(
      (participantId) => participantId !== id,
    );
  }

  return true;
};

export const createEvent = (
  input: Omit<Event, "id" | "participants" | "createdAt" | "updatedAt">,
): EventView => {
  const createdAt = nowIso();
  const event: Event = {
    id: randomUUID(),
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

export const getEventById = (id: string): Event | undefined =>
  events.find((event) => event.id === id);

export const listEvents = (filters: {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: "open" | "closed";
}): EventView[] => {
  const fromDate = filters.from ? new Date(filters.from) : undefined;
  const toDate = filters.to ? new Date(filters.to) : undefined;

  return events
    .filter((event) => {
      if (filters.q) {
        const q = filters.q.toLowerCase().trim();
        const match =
          event.name.toLowerCase().includes(q) ||
          event.description.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q) ||
          event.city.toLowerCase().includes(q);

        if (!match) {
          return false;
        }
      }

      if (
        filters.city &&
        event.city.toLowerCase() !== filters.city.toLowerCase()
      ) {
        return false;
      }

      if (
        filters.category &&
        event.category.toLowerCase() !== filters.category.toLowerCase()
      ) {
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

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    })
    .map(toEventView);
};

export const listEventsByOrganizer = (organizerId: string): EventView[] =>
  events.filter((event) => event.organizerId === organizerId).map(toEventView);

export const updateEvent = (
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
): EventView | undefined => {
  const event = getEventById(id);
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

export const deleteEvent = (id: string): boolean => {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) {
    return false;
  }

  events.splice(index, 1);
  return true;
};

export const addParticipant = (
  eventId: string,
  userId: string,
): EventView | "not_found" | "closed" | "full" | "already_joined" => {
  const event = getEventById(eventId);
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
  event.updatedAt = nowIso();
  return toEventView(event);
};

export const removeParticipant = (
  eventId: string,
  userId: string,
): EventView | "not_found" | "not_joined" => {
  const event = getEventById(eventId);
  if (!event) {
    return "not_found";
  }

  const hadUser = event.participants.includes(userId);
  if (!hadUser) {
    return "not_joined";
  }

  event.participants = event.participants.filter(
    (participantId) => participantId !== userId,
  );
  event.updatedAt = nowIso();
  return toEventView(event);
};

export const listEventParticipants = (
  eventId: string,
): PublicUser[] | undefined => {
  const event = getEventById(eventId);
  if (!event) {
    return undefined;
  }

  return event.participants
    .map((participantId) => getUserById(participantId))
    .filter((user): user is User => Boolean(user))
    .map(sanitizeUser);
};

export const logModerationAction = (
  input: Omit<ModerationAction, "id" | "createdAt">,
): ModerationAction => {
  const action: ModerationAction = {
    id: randomUUID(),
    adminId: input.adminId,
    eventId: input.eventId,
    action: "remove_event",
    reason: input.reason,
    createdAt: nowIso(),
  };

  moderationLog.push(action);
  return action;
};

export const toSafeEventView = (event: Event): EventView => toEventView(event);
