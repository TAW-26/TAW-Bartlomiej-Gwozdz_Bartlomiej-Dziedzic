export interface Api {
}

export type UserRole = 'user' | 'organizer' | 'admin';

export type EventStatus = 'open' | 'closed';


export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}


export interface EventItem {
  id: string;
  name: string;
  description: string;
  city: string;
  location: string;
  category: string;
  startsAt: string;
  endsAt: string;
  status: EventStatus;
  organizerId: string;
  participantsCount: number;
  maxParticipants?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: EventStatus;
}

export interface CreateEventPayload {
  name: string;
  description: string;
  city: string;
  location: string;
  category: string;
  startsAt: string;
  endsAt: string;
  maxParticipants?: number;
  imageUrl?: string;
  status?: EventStatus;
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface Participant {
  userId: string;
  fullName: string;
  email: string;
  joinedAt: string;
}

export interface ModerationRemoveEventPayload {
  eventId: string;
  reason: string;
}