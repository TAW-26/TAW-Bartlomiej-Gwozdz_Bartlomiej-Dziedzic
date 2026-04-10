"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const store_1 = require("../../store");
class EventService {
    static async getAll(filters) {
        return (0, store_1.listEvents)(filters);
    }
    static async create(organizerId, data) {
        if (new Date(data.endsAt) <= new Date(data.startsAt)) {
            throw new Error("Data zakończenia musi być późniejsza niż rozpoczęcia");
        }
        return (0, store_1.createEvent)({
            ...data,
            organizerId,
            status: "open",
            startsAt: new Date(data.startsAt).toISOString(),
            endsAt: new Date(data.endsAt).toISOString(),
        });
    }
    static async joinEvent(eventId, userId) {
        const result = await (0, store_1.addParticipant)(eventId, userId);
        if (result === "not_found")
            throw new Error("Wydarzenie nie istnieje");
        if (result === "closed")
            throw new Error("Wydarzenie jest zamknięte");
        if (result === "full")
            throw new Error("Brak wolnych miejsc");
        if (result === "already_joined")
            throw new Error("Już jesteś zapisany");
        return result;
    }
    static async getDetails(eventId) {
        const event = await (0, store_1.getEventById)(eventId);
        if (!event)
            throw new Error("Wydarzenie nie istnieje");
        return event; // store.ts ma toEventView
    }
    static async leaveEvent(eventId, userId) {
        const result = await (0, store_1.removeParticipant)(eventId, userId);
        if (result === "not_found")
            throw new Error("Wydarzenie nie istnieje");
        if (result === "not_joined")
            throw new Error("Nie jesteś uczestnikiem");
        return result;
    }
    static async update(eventId, data) {
        const updated = await (0, store_1.updateEvent)(eventId, data);
        if (!updated)
            throw new Error("Nie udało się zaktualizować wydarzenia");
        return updated;
    }
    static async getParticipants(eventId) {
        return (0, store_1.listEventParticipants)(eventId);
    }
}
exports.EventService = EventService;
