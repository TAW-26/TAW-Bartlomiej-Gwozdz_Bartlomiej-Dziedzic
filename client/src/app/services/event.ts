import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateEventPayload,
  EventFilters,
  EventItem,
  Participant,
  UpdateEventPayload,
} from '../models/api';

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly apiUrl = '/api/events';

  constructor(private readonly http: HttpClient) {}


  /**
   * GET /api/events
   */
  getEvents(filters?: EventFilters): Observable<EventItem[]> {
    let params = new HttpParams();

    if (filters) {
      (Object.keys(filters) as (keyof EventFilters)[]).forEach((key) => {
        const value = filters[key];
        if (value !== undefined && value !== '') {
          params = params.set(key, value);
        }
      });
    }

    return this.http.get<EventItem[]>(this.apiUrl, { params });
  }

  /**
   * GET /api/events/:id
   */
  getEventById(id: string): Observable<EventItem> {
    return this.http.get<EventItem>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /api/events
   * Wymaga tokenu JWT z rolą organizer lub admin.
   */
  createEvent(payload: CreateEventPayload): Observable<EventItem> {
    return this.http.post<EventItem>(this.apiUrl, payload);
  }
  /**
   * PUT /api/events/:id
   * Tylko właściciel lub admin.
   */
  updateEvent(id: string, patch: UpdateEventPayload): Observable<EventItem> {
    return this.http.put<EventItem>(`${this.apiUrl}/${id}`, patch);
  }

  /**
   * DELETE /api/events/:id
   * Tylko właściciel lub admin.
   */
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * POST /api/events/:id/join
   */
  joinEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/join`, {});
  }

  /**
   * POST /api/events/:id/leave
   */
  leaveEvent(id: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/leave`, {});
  }

  /**
   * GET /api/events/:id/participants
   */
  getParticipants(eventId: string): Observable<Participant[]> {
    return this.http.get<Participant[]>(`${this.apiUrl}/${eventId}/participants`);
  }

  /**
   * DELETE /api/events/:id/participants/:userId
   * Usuniecie uczestnika przez organizatora lub admina.
   */
  removeParticipant(eventId: string, userId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/${eventId}/participants/${userId}`,
    );
  }

  /**
   * GET /api/events/organizer/my-events
   */
  getMyEvents(): Observable<EventItem[]> {
    return this.http.get<EventItem[]>(`${this.apiUrl}/organizer/my-events`);
  }
}