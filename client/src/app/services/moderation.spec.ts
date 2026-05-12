import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ModerationService } from './moderation';

describe('ModerationService', () => {
  let service: ModerationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ModerationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call the moderation remove-event endpoint', () => {
    const payload = {
      eventId: 'event-1',
      reason: 'Duplicate event',
    };

    service.removeEvent(payload).subscribe((value) => {
      expect(value).toEqual({ message: 'removed' });
    });

    const request = httpMock.expectOne('/api/moderation/remove-event');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);

    request.flush({ message: 'removed' });
  });
});
