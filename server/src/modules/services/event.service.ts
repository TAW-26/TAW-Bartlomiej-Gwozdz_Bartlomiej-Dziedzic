import {
  listEvents,
  listEventsByOrganizer,
  listEventsByParticipant,
  createEvent,
  addParticipant,
  getEventById,
  getUserById,
  updateEvent,
  removeParticipant,
  listEventParticipants,
  toSafeEventView,
} from "../../store";
import { CreateEventDTO, EventFilters } from "../../interfaces/event.interfaces";
import { EventView } from "../models/event.model";
import { PublicUser } from "../models/user.model";

export class EventService {
  static async getAll(filters: EventFilters): Promise<EventView[]> {
    return listEvents(filters);
  }

  static async create(organizerId: string, data: CreateEventDTO): Promise<EventView> {
    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new Error("End date must be later than start date");
    }

    return createEvent({
      ...data,
      organizerId,
      status: data.status ?? "open",
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
    });
  }

  static async listOrganizerEvents(actorId: string): Promise<EventView[]> {
    const actor = await getUserById(actorId);
    if (!actor) throw new Error("User not found");

    if (actor.role === "admin") return listEvents({});
    if (actor.role !== "organizer") {
      throw new Error("Only organizer or admin can list own events");
    }
    return listEventsByOrganizer(actorId);
  }

  static async listParticipantEvents(userId: string): Promise<EventView[]> {
    return listEventsByParticipant(userId);
  }

  static async joinEvent(eventId: string, userId: string): Promise<EventView> {
    const result = await addParticipant(eventId, userId);

    if (result === "not_found") throw new Error("Event not found");
    if (result === "closed") throw new Error("Event is closed");
    if (result === "full") throw new Error("No available slots");
    if (result === "already_joined") throw new Error("User is already registered for this event");

    return result as EventView;
  }

  static async getDetails(eventId: string): Promise<EventView> {
    const event = await getEventById(eventId);
    if (!event) throw new Error("Event not found");
    return toSafeEventView(event);
  }

  static async leaveEvent(eventId: string, userId: string): Promise<EventView> {
    const result = await removeParticipant(eventId, userId);
    if (result === "not_found") throw new Error("Event not found");
    if (result === "not_joined") throw new Error("User is not a participant of this event");
    return result as EventView;
  }

  static async removeParticipantFromEvent(
    eventId: string,
    participantId: string,
  ): Promise<EventView> {
    const result = await removeParticipant(eventId, participantId);
    if (result === "not_found") throw new Error("Event not found");
    if (result === "not_joined") throw new Error("Participant not found in this event");
    return result as EventView;
  }

  static async update(eventId: string, data: Partial<CreateEventDTO>): Promise<EventView> {
    const updated = await updateEvent(eventId, data);
    if (!updated) throw new Error("Failed to update event");
    return updated;
  }

  static async getParticipants(eventId: string): Promise<PublicUser[] | undefined> {
    return listEventParticipants(eventId);
  }
}
