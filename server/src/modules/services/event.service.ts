import { db } from "../../store";
import { CreateEventDTO, EventFilters } from "../../interfaces/event.interfaces";
import { EventView } from "../../types";

export class EventService {
    static getAll(filters: EventFilters): EventView[] {
        return db.listEvents(filters);
    }

    static create(organizerId: string, data: CreateEventDTO) {
        if (new Date(data.endsAt) <= new Date(data.startsAt)) {
            throw new Error("Data zakończenia musi być późniejsza niż rozpoczęcia");
        }
        return db.createEvent({
            ...data,
            organizerId,
            status: "open",
            startsAt: new Date(data.startsAt).toISOString(),
            endsAt: new Date(data.endsAt).toISOString(),
        });
    }

    static joinEvent(eventId: string, userId: string) {
        const result = db.addParticipant(eventId, userId);
        if (typeof result === "string") {
            throw new Error(`Nie udało się dołączyć: ${result}`);
        }
        return result;
    }
}