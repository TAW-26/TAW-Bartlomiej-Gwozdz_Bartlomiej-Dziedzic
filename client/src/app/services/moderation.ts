import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModerationRemoveEventPayload } from '../models/api';

@Injectable({ providedIn: 'root' })
export class ModerationService {
  private readonly apiUrl = '/api/moderation';

  constructor(private readonly http: HttpClient) {}
  
  /**
   * POST /api/moderation/remove-event
   */
  removeEvent(payload: ModerationRemoveEventPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/remove-event`, payload);
  }
}