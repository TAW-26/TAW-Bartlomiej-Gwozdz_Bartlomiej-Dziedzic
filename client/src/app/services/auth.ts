import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginPayload, LoginResponse, RegisterPayload, User } from '../models/api';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/users';
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _currentUser = signal<User | null>(this.loadUserFromToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'admin');
  readonly isOrganizer = computed(() =>
    ['organizer', 'admin'].includes(this._currentUser()?.role ?? ''),
  );

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, payload);
  }

  login(payload: LoginPayload): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((res) => {
        this.setToken(res.token);
        this._currentUser.set(res.user);
      }),
    );
  }

  logout(): void {
    this.removeToken();
    this._currentUser.set(null);
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, token);
  }

  private removeToken(): void {
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
  }

  private loadUserFromToken(): User | null {
    // Guard: localStorage niedostępny w SSR
    if (typeof localStorage === 'undefined') return null;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        localStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        fullName: payload.fullName ?? '',
      };
    } catch {
      return null;
    }
  }
}
