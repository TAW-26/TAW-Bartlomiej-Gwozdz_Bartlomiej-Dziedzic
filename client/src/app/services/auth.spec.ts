import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AuthService } from './auth';
import { LoginResponse, User } from '../models/api';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const user: User = {
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    role: 'user',
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should send register payload to the backend', () => {
    const payload = {
      email: 'new@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      fullName: 'New User',
    };

    service.register(payload).subscribe((response) => {
      expect(response).toEqual(user);
    });

    const request = httpMock.expectOne('/api/users/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(user);
  });

  it('should send login payload and store the returned token', () => {
    const payload = {
      email: 'user@example.com',
      password: 'secret123',
    };

    const response: LoginResponse = {
      token: 'jwt-token',
      user,
    };

    service.login(payload).subscribe((value) => {
      expect(value).toEqual(response);
    });

    const request = httpMock.expectOne('/api/users/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush(response);

    expect(localStorage.getItem('auth_token')).toBe('jwt-token');
    expect(service.currentUser()).toEqual(user);
    expect(service.isLoggedIn()).toBe(true);
  });
});
