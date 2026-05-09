import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user';
import { EventItem, User, UserRole } from '../models/api';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const user: User = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    role: 'user',
  };

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should request all users from the backend', () => {
    service.getAllUsers().subscribe((value) => {
      expect(value).toEqual([user]);
    });

    const request = httpMock.expectOne('/api/users');
    expect(request.request.method).toBe('GET');

    request.flush([user]);
  });

  it('should change a user role', () => {
    const role: UserRole = 'organizer';

    service.changeUserRole('user-1', role).subscribe((value) => {
      expect(value).toEqual({ ...user, role });
    });

    const request = httpMock.expectOne('/api/users/user-1/role');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ role });

    request.flush({ ...user, role });
  });

  it('should delete a user', () => {
    service.deleteUser('user-1').subscribe((value) => {
      expect(value).toBeNull();
    });

    const request = httpMock.expectOne('/api/users/user-1');
    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

  it('should request the logged-in users events', () => {
    service.getMyEvents().subscribe((value) => {
      expect(value).toEqual([event]);
    });

    const request = httpMock.expectOne('/api/users/me/events');
    expect(request.request.method).toBe('GET');

    request.flush([event]);
  });
});
