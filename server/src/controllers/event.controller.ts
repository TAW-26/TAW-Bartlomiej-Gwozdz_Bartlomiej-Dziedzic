import { EventService } from "../modules/services/event.service";
import { authorize, isOwnerOrAdmin } from "../middlewares/auth.middleware";
import { getEventById, deleteEvent } from "../store";
import { CreateEventDTO, EventFilters } from "../interfaces/event.interfaces";

export class EventController {
  static async listEvents(req: { query: EventFilters }) {
    return EventService.getAll(req.query);
  }

  static async create(req: { userId: string; body: CreateEventDTO }) {
    await authorize(req.userId, ["organizer", "admin"]);
    return EventService.create(req.userId, req.body);
  }

  static async listOrganizerEvents(req: { userId: string }) {
    return EventService.listOrganizerEvents(req.userId);
  }

  static async listParticipantEvents(req: { userId: string }) {
    return EventService.listParticipantEvents(req.userId);
  }

  static async getDetails(req: { eventId: string }) {
    return EventService.getDetails(req.eventId);
  }

  static async join(req: { userId: string; eventId: string }) {
    return EventService.joinEvent(req.eventId, req.userId);
  }

  static async leave(req: { userId: string; eventId: string }) {
    return EventService.leaveEvent(req.eventId, req.userId);
  }

  static async update(req: {
    userId: string;
    eventId: string;
    body: Partial<CreateEventDTO>;
  }) {
    const event = await getEventById(req.eventId);
    if (!event) throw new Error("Event not found");

    await isOwnerOrAdmin(req.userId, event.organizerId);
    return EventService.update(req.eventId, req.body);
  }

  static async delete(req: { userId: string; eventId: string }) {
    const event = await getEventById(req.eventId);
    if (!event) throw new Error("Event not found");

    await isOwnerOrAdmin(req.userId, event.organizerId);
    await deleteEvent(req.eventId);
    return { success: true };
  }

  static async listParticipants(req: { userId: string; eventId: string }) {
    const event = await getEventById(req.eventId);
    if (!event) throw new Error("Event not found");

    await isOwnerOrAdmin(req.userId, event.organizerId);
    return EventService.getParticipants(req.eventId);
  }

  static async removeParticipant(req: {
    userId: string;
    eventId: string;
    participantId: string;
  }) {
    const event = await getEventById(req.eventId);
    if (!event) throw new Error("Event not found");

    await isOwnerOrAdmin(req.userId, event.organizerId);
    return EventService.removeParticipantFromEvent(req.eventId, req.participantId);
  }
}
