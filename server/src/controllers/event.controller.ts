import { EventService } from "../modules/services/event.service";
import { authorize, isOwnerOrAdmin } from "../middlewares/auth.middleware";
import {getEventById,deleteEvent } from "../store"

export class EventController {
    // GET /events
    static async listEvents(req: { query: any }) {
        return EventService.getAll(req.query);
    }

    // POST /events
    static async create(req: { userId: string; body: any }) {
        authorize(req.userId, ["organizer", "admin"]);
        return EventService.create(req.userId, req.body);
    }

    // DELETE /events/:id
    static async delete(req: { userId: string; eventId: string }) {
        const event = getEventById(req.eventId);
        if (!event) throw new Error("Wydarzenie nie istnieje");

        isOwnerOrAdmin(req.userId, event.organizerId);

        deleteEvent(req.eventId);
        return { success: true };
    }
    // UC03: Podgląd szczegółów
    static async getDetails(req: { eventId: string }) {
        return EventService.getDetails(req.eventId);
    }

    // UC06: Dołączanie
    static async join(req: { userId: string; eventId: string }) {
        return EventService.joinEvent(req.eventId, req.userId);
    }

    // UC07: Rezygnacja
    static async leave(req: { userId: string; eventId: string }) {
        return EventService.leaveEvent(req.eventId, req.userId);
    }

    // UC09: Edycja
    static async update(req: { userId: string; eventId: string; body: any }) {
        const event = getEventById(req.eventId);
        if (!event) throw new Error("Wydarzenie nie istnieje");

        isOwnerOrAdmin(req.userId, event.organizerId);
        return EventService.update(req.eventId, req.body);
    }

    // UC11: Zarządzanie uczestnikami
    static async listParticipants(req: { userId: string; eventId: string }) {
        const event = getEventById(req.eventId);
        if (!event) throw new Error("Wydarzenie nie istnieje");

        isOwnerOrAdmin(req.userId, event.organizerId);
        return EventService.getParticipants(req.eventId);
    }
}