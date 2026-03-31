import { EventStatus } from "../modules/models/event.model";

export interface CreateEventDTO {
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
    location: string;
    city: string;
    category: string;
    maxParticipants?: number;
    imageUrl?: string;
}

export interface EventFilters {
    q?: string;
    city?: string;
    category?: string;
    status?: EventStatus;
}