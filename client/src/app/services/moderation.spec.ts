import { TestBed } from '@angular/core/testing';

import { ModerationService } from './moderation';

describe('Moderation', () => {
  let service: ModerationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModerationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
