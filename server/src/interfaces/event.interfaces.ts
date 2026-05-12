import { EventStatus } from "../types";

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
  status?: EventStatus;
}

export interface EventFilters {
  q?: string;
  city?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: EventStatus;
}
