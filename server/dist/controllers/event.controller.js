"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_service_1 = require("../modules/services/event.service");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const store_1 = require("../store");
class EventController {
    // GET /events
    static async listEvents(req) {
        return event_service_1.EventService.getAll(req.query);
    }
    // POST /events
    static async create(req) {
        await (0, auth_middleware_1.authorize)(req.userId, ["organizer", "admin"]);
        return event_service_1.EventService.create(req.userId, req.body);
    }
    // DELETE /events/:id
    static async delete(req) {
        const event = await (0, store_1.getEventById)(req.eventId);
        if (!event)
            throw new Error("Wydarzenie nie istnieje");
        await (0, auth_middleware_1.isOwnerOrAdmin)(req.userId, event.organizerId);
        await (0, store_1.deleteEvent)(req.eventId);
        return { success: true };
    }
    // UC03: Podgląd szczegółów
    static async getDetails(req) {
        return event_service_1.EventService.getDetails(req.eventId);
    }
    // UC06: Dołączanie
    static async join(req) {
        return event_service_1.EventService.joinEvent(req.eventId, req.userId);
    }
    // UC07: Rezygnacja
    static async leave(req) {
        return event_service_1.EventService.leaveEvent(req.eventId, req.userId);
    }
    // UC09: Edycja
    static async update(req) {
        const event = await (0, store_1.getEventById)(req.eventId);
        if (!event)
            throw new Error("Wydarzenie nie istnieje");
        await (0, auth_middleware_1.isOwnerOrAdmin)(req.userId, event.organizerId);
        return event_service_1.EventService.update(req.eventId, req.body);
    }
    // UC11: Zarządzanie uczestnikami
    static async listParticipants(req) {
        const event = await (0, store_1.getEventById)(req.eventId);
        if (!event)
            throw new Error("Wydarzenie nie istnieje");
        await (0, auth_middleware_1.isOwnerOrAdmin)(req.userId, event.organizerId);
        return event_service_1.EventService.getParticipants(req.eventId);
    }
}
exports.EventController = EventController;
