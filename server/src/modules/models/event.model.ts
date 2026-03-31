export type EventStatus = "open" | "closed";

export interface Event {
    id: string;
    name: string;
    description: string;
    startsAt: string;
    endsAt: string;
    location: string;
    city: string;
    category: string;
    maxParticipants?: number;
    imageUrl?: string;
    organizerId: string;
    status: EventStatus;
    participants: string[];
    createdAt: string;
    updatedAt: string;
}

export interface EventView extends Omit<Event, "participants"> {
    participantsCount: number;
}