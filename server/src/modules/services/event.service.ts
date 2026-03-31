import {
    listEvents,
    createEvent,
    addParticipant
} from "../../store";
import { CreateEventDTO, EventFilters } from "../../interfaces/event.interfaces";
import { EventView } from "../models/event.model";

export class EventService {
    static getAll(filters: EventFilters): EventView[] {
        // Używamy funkcji bezpośrednio
        return listEvents(filters);
    }

    static create(organizerId: string, data: CreateEventDTO): EventView {
        if (new Date(data.endsAt) <= new Date(data.startsAt)) {
            throw new Error("Data zakończenia musi być późniejsza niż rozpoczęcia");
        }

        return createEvent({
            ...data,
            organizerId,
            status:"open",
            startsAt: new Date(data.startsAt).toISOString(),
            endsAt: new Date(data.endsAt).toISOString(),
        });
    }

    static joinEvent(eventId: string, userId: string): EventView {
        const result = addParticipant(eventId, userId);

        if (result === "not_found") throw new Error("Wydarzenie nie istnieje");
        if (result === "closed") throw new Error("Wydarzenie jest zamknięte");
        if (result === "full") throw new Error("Brak wolnych miejsc");
        if (result === "already_joined") throw new Error("Już jesteś zapisany");

        return result as EventView;
    }
}