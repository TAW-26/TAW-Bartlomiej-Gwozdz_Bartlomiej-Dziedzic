import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserRole } from '../models/api';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = '/api/users';

  constructor(private readonly http: HttpClient) {}

  /**
   * GET /api/users
   * Tylko admin.
   */
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * PUT /api/users/:id/role
   * Tylko admin.
   */
  changeUserRole(userId: string, role: UserRole): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/role`, { role });
  }

  /**
   * DELETE /api/users/:id
   * Tylko admin.
   */
  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}