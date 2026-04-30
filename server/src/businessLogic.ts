import {
  addParticipant,
  createEvent,
  createUser,
  deleteEvent,
  deleteUser,
  getEventById,
  getPublicUserById,
  getPublicUsers,
  getUserByEmail,
  getUserById,
  listEventParticipants,
  listEvents,
  listEventsByOrganizer,
  listEventsByParticipant,
  logModerationAction,
  removeParticipant,
  toSafeEventView,
  updateEvent,
  updateUser,
} from "./store";
import { EventStatus, EventView, PublicUser, UserRole } from "./types";

const normalizeIso = (value: string): string => new Date(value).toISOString();

const assert = (condition: boolean, message: string): void => {
  if (!condition) {
    throw new Error(message);
  }
};

export interface EventFilters {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: EventStatus;
}

export interface CreateEventInput {
  name: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  city: string;
  category: string;
  maxParticipants?: number;
  imageUrl?: string;
  status?: EventStatus;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  location?: string;
  city?: string;
  category?: string;
  maxParticipants?: number;
  imageUrl?: string;
  status?: EventStatus;
}

export const registerUser = async (input: {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}): Promise<PublicUser> => {
  assert(Boolean(input.email?.trim()), "E-mail is required");
  assert(input.password.length >= 8, "Password must be at least 8 characters");
  assert(input.password === input.confirmPassword, "Passwords must match");
  assert(
    !(await getUserByEmail(input.email)),
    "User with this e-mail already exists",
  );

  return createUser({
    email: input.email,
    password: input.password,
    fullName: input.fullName,
    role: "user",
  });
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<PublicUser> => {
  const user = await getUserByEmail(input.email);
  assert(Boolean(user), "Invalid e-mail or password");
  assert(user?.password === input.password, "Invalid e-mail or password");

  return {
    id: user!.id,
    email: user!.email,
    fullName: user!.fullName,
    role: user!.role,
    createdAt: user!.createdAt,
  };
};

export const browseEvents = async (
  filters: EventFilters = {},
): Promise<EventView[]> => listEvents(filters);

export const getEventDetails = async (
  eventId: string,
): Promise<{
  event: EventView;
  organizer?: PublicUser;
}> => {
  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  const organizer = await getPublicUserById(event!.organizerId);
  return {
    event: toSafeEventView(event!),
    organizer,
  };
};

export const confirmParticipation = async (
  eventId: string,
  userId: string,
): Promise<EventView> => {
  assert(Boolean(await getUserById(userId)), "User not found");

  const result = await addParticipant(eventId, userId);
  assert(result !== "not_found", "Event not found");
  assert(result !== "closed", "Event is closed");
  assert(result !== "full", "Event reached maximum number of participants");
  assert(result !== "already_joined", "User already joined this event");

  if (typeof result === "string") {
    throw new Error("Unexpected participation state");
  }

  return result;
};

export const cancelParticipation = async (
  eventId: string,
  userId: string,
): Promise<EventView> => {
  const result = await removeParticipant(eventId, userId);
  assert(result !== "not_found", "Event not found");
  assert(result !== "not_joined", "User is not a participant of this event");

  if (typeof result === "string") {
    throw new Error("Unexpected participation state");
  }

  return result;
};

export const createOrganizerEvent = async (
  organizerId: string,
  input: CreateEventInput,
): Promise<EventView> => {
  const organizer = await getUserById(organizerId);
  assert(Boolean(organizer), "Organizer not found");
  assert(
    organizer!.role === "organizer" || organizer!.role === "admin",
    "Only organizer or admin can create event",
  );
  assert(
    new Date(input.endsAt) > new Date(input.startsAt),
    "endsAt must be greater than startsAt",
  );

  return createEvent({
    ...input,
    startsAt: normalizeIso(input.startsAt),
    endsAt: normalizeIso(input.endsAt),
    organizerId,
    status: input.status ?? "open",
  });
};

export const editOrganizerEvent = async (
  actorId: string,
  eventId: string,
  patch: UpdateEventInput,
): Promise<EventView> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  const isOwner = event!.organizerId === actorId;
  const isAdmin = actor!.role === "admin";
  assert(isOwner || isAdmin, "Only owner or admin can edit this event");

  const startsAt = patch.startsAt
    ? normalizeIso(patch.startsAt)
    : event!.startsAt;
  const endsAt = patch.endsAt ? normalizeIso(patch.endsAt) : event!.endsAt;

  assert(
    new Date(endsAt) > new Date(startsAt),
    "endsAt must be greater than startsAt",
  );

  const updated = await updateEvent(eventId, {
    ...patch,
    startsAt: patch.startsAt ? startsAt : undefined,
    endsAt: patch.endsAt ? endsAt : undefined,
  });

  assert(Boolean(updated), "Event not found");
  return updated!;
};

export const removeEvent = async (
  actorId: string,
  eventId: string,
): Promise<void> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  const isOwner = event!.organizerId === actorId;
  const isAdmin = actor!.role === "admin";
  assert(isOwner || isAdmin, "Only owner or admin can delete this event");

  await deleteEvent(eventId);
};

export const listOrganizerEvents = async (
  actorId: string,
): Promise<EventView[]> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  if (actor!.role === "admin") {
    return listEvents({});
  }

  assert(
    actor!.role === "organizer",
    "Only organizer or admin can list own events",
  );

  return listEventsByOrganizer(actorId);
};

export const listParticipantEvents = async (
  actorId: string,
): Promise<EventView[]> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  return listEventsByParticipant(actorId);
};

export const listParticipantsForEvent = async (
  actorId: string,
  eventId: string,
): Promise<PublicUser[]> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  const isOwner = event!.organizerId === actorId;
  const isAdmin = actor!.role === "admin";
  assert(isOwner || isAdmin, "Only owner or admin can view participants");

  return (await listEventParticipants(eventId)) ?? [];
};

export const removeParticipantFromEvent = async (
  actorId: string,
  eventId: string,
  participantId: string,
): Promise<EventView> => {
  const actor = await getUserById(actorId);
  assert(Boolean(actor), "Actor not found");

  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  const isOwner = event!.organizerId === actorId;
  const isAdmin = actor!.role === "admin";
  assert(isOwner || isAdmin, "Only owner or admin can remove participants");

  const result = await removeParticipant(eventId, participantId);
  assert(result !== "not_found", "Event not found");
  assert(result !== "not_joined", "Participant not found in this event");

  if (typeof result === "string") {
    throw new Error("Unexpected participation state");
  }

  return result;
};

export const listUsersForAdmin = async (
  adminId: string,
): Promise<PublicUser[]> => {
  const admin = await getUserById(adminId);
  assert(Boolean(admin), "Admin not found");
  assert(admin!.role === "admin", "Only admin can list users");

  return getPublicUsers();
};

export const changeUserRole = async (
  adminId: string,
  userId: string,
  role: UserRole,
): Promise<PublicUser> => {
  const admin = await getUserById(adminId);
  assert(Boolean(admin), "Admin not found");
  assert(admin!.role === "admin", "Only admin can change roles");

  const updated = await updateUser(userId, { role });
  assert(Boolean(updated), "User not found");

  return updated!;
};

export const removeUserByAdmin = async (
  adminId: string,
  userId: string,
): Promise<void> => {
  const admin = await getUserById(adminId);
  assert(Boolean(admin), "Admin not found");
  assert(admin!.role === "admin", "Only admin can delete users");
  assert(adminId !== userId, "Administrator cannot delete own account");

  const deleted = await deleteUser(userId);
  assert(deleted, "User not found");
};

export const moderateEventRemoval = async (
  adminId: string,
  eventId: string,
  reason?: string,
): Promise<{ moderationId: string }> => {
  const admin = await getUserById(adminId);
  assert(Boolean(admin), "Admin not found");
  assert(admin!.role === "admin", "Only admin can moderate content");

  const event = await getEventById(eventId);
  assert(Boolean(event), "Event not found");

  await deleteEvent(eventId);
  const log = await logModerationAction({
    adminId,
    eventId,
    action: "remove_event",
    reason,
  });

  return { moderationId: log.id };
};
