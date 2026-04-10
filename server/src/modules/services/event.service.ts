import {
  listEvents,
  createEvent,
  addParticipant,
  getEventById,
  updateEvent,
  removeParticipant,
  listEventParticipants,
} from "../../store";
import {
  CreateEventDTO,
  EventFilters,
} from "../../interfaces/event.interfaces";
import { EventView } from "../models/event.model";

export class EventService {
  static async getAll(filters: EventFilters): Promise<EventView[]> {
    return listEvents(filters);
  }

  static async create(
    organizerId: string,
    data: CreateEventDTO,
  ): Promise<EventView> {
    if (new Date(data.endsAt) <= new Date(data.startsAt)) {
      throw new Error("Data zakończenia musi być późniejsza niż rozpoczęcia");
    }

    return createEvent({
      ...data,
      organizerId,
      status: "open",
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
    });
  }

  static async joinEvent(eventId: string, userId: string): Promise<EventView> {
    const result = await addParticipant(eventId, userId);

    if (result === "not_found") throw new Error("Wydarzenie nie istnieje");
    if (result === "closed") throw new Error("Wydarzenie jest zamknięte");
    if (result === "full") throw new Error("Brak wolnych miejsc");
    if (result === "already_joined") throw new Error("Już jesteś zapisany");

    return result as EventView;
  }
  static async getDetails(eventId: string): Promise<EventView> {
    const event = await getEventById(eventId);
    if (!event) throw new Error("Wydarzenie nie istnieje");
    return event as unknown as EventView; // store.ts ma toEventView
  }

  static async leaveEvent(eventId: string, userId: string): Promise<EventView> {
    const result = await removeParticipant(eventId, userId);
    if (result === "not_found") throw new Error("Wydarzenie nie istnieje");
    if (result === "not_joined") throw new Error("Nie jesteś uczestnikiem");
    return result as EventView;
  }

  static async update(eventId: string, data: any): Promise<EventView> {
    const updated = await updateEvent(eventId, data);
    if (!updated) throw new Error("Nie udało się zaktualizować wydarzenia");
    return updated;
  }

  static async getParticipants(eventId: string) {
    return listEventParticipants(eventId);
  }
}
