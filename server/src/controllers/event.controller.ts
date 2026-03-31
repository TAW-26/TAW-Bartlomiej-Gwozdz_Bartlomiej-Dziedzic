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
}