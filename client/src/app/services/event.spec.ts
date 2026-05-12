import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { EventService } from './event';
import { EventItem, Participant } from '../models/api';

describe('EventService', () => {
  let service: EventService;
  let httpMock: HttpTestingController;

  const event: EventItem = {
    id: 'event-1',
    name: 'Sample event',
    description: 'Demo description',
    city: 'Warszawa',
    location: 'Centrum',
    category: 'tech',
    startsAt: '2026-05-09T10:00:00.000Z',
    endsAt: '2026-05-09T12:00:00.000Z',
    status: 'open',
    organizerId: 'organizer-1',
    participantsCount: 2,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };

  const participant: Participant = {
    userId: 'user-1',
    fullName: 'Test User',
    email: 'user@example.com',
    joinedAt: '2026-05-02T10:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(EventService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request events with query params', () => {
    service.getEvents({ q: 'demo', city: 'Warszawa', status: 'open' }).subscribe((events) => {
      expect(events).toEqual([event]);
    });

    const request = httpMock.expectOne(
      (testRequest) =>
        testRequest.method === 'GET' &&
        testRequest.url === '/api/events' &&
        testRequest.params.get('q') === 'demo' &&
        testRequest.params.get('city') === 'Warszawa' &&
        testRequest.params.get('status') === 'open',
    );

    request.flush([event]);
  });

  it('should map getEventById response to the event payload', () => {
    service.getEventById('event-1').subscribe((value) => {
      expect(value).toEqual(event);
    });

    const request = httpMock.expectOne('/api/events/event-1');
    expect(request.request.method).toBe('GET');

    request.flush({ event });
  });

  it('should create an event', () => {
    const payload = {
      name: 'Sample event',
      description: 'Demo description',
      city: 'Warszawa',
      location: 'Centrum',
      category: 'tech',
      startsAt: '2026-05-09T10:00:00.000Z',
      endsAt: '2026-05-09T12:00:00.000Z',
    };

    service.createEvent(payload).subscribe((value) => {
      expect(value).toEqual(event);
    });

    const request = httpMock.expectOne('/api/events');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(event);
  });

  it('should update an event', () => {
    const patch = { name: 'Updated event' };

    service.updateEvent('event-1', patch).subscribe((value) => {
      expect(value).toEqual(event);
    });

    const request = httpMock.expectOne('/api/events/event-1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(patch);

    request.flush(event);
  });

  it('should delete an event', () => {
    service.deleteEvent('event-1').subscribe((value) => {
      expect(value).toBeNull();
    });

    const request = httpMock.expectOne('/api/events/event-1');
    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

  it('should join and leave an event', () => {
    service.joinEvent('event-1').subscribe((value) => {
      expect(value).toEqual({ message: 'joined' });
    });

    const joinRequest = httpMock.expectOne('/api/events/event-1/join');
    expect(joinRequest.request.method).toBe('POST');
    expect(joinRequest.request.body).toEqual({});
    joinRequest.flush({ message: 'joined' });

    service.leaveEvent('event-1').subscribe((value) => {
      expect(value).toEqual({ message: 'left' });
    });

    const leaveRequest = httpMock.expectOne('/api/events/event-1/leave');
    expect(leaveRequest.request.method).toBe('POST');
    expect(leaveRequest.request.body).toEqual({});
    leaveRequest.flush({ message: 'left' });
  });

  it('should load participants and remove a participant', () => {
    service.getParticipants('event-1').subscribe((value) => {
      expect(value).toEqual([participant]);
    });

    const participantsRequest = httpMock.expectOne('/api/events/event-1/participants');
    expect(participantsRequest.request.method).toBe('GET');
    participantsRequest.flush([participant]);

    service.removeParticipant('event-1', 'user-1').subscribe((value) => {
      expect(value).toEqual({ message: 'removed' });
    });

    const removeRequest = httpMock.expectOne('/api/events/event-1/participants/user-1');
    expect(removeRequest.request.method).toBe('DELETE');
    removeRequest.flush({ message: 'removed' });
  });

  it('should load organizer events', () => {
    service.getMyEvents().subscribe((value) => {
      expect(value).toEqual([event]);
    });

    const request = httpMock.expectOne('/api/events/organizer/my-events');
    expect(request.request.method).toBe('GET');

    request.flush([event]);
  });
});
