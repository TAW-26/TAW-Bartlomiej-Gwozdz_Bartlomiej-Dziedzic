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
  title: string;
  description: string;
  city: string;
  location: string;
  categories: string[];
  startAt: string;   
  endAt: string;    
  status: EventStatus;
  organizerId: string;
  participantCount?: number;
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
  title: string;
  description: string;
  city: string;
  location: string;
  categories: string[];
  startAt: string;
  endAt: string;
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