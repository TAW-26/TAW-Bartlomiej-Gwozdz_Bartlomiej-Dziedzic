export type UserRole = "user" | "organizer" | "admin";

export type EventStatus = "open" | "closed";

export interface User {
  id: string;
  email: string;
  password: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
}

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

export interface ModerationAction {
  id: string;
  adminId: string;
  eventId: string;
  action: "remove_event";
  reason?: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  createdAt: string;
}

export interface EventView extends Omit<Event, "participants"> {
  participantsCount: number;
}
