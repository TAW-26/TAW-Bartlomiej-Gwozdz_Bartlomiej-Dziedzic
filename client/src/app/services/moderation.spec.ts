import { TestBed } from '@angular/core/testing';

import { Moderation } from './moderation';

describe('Moderation', () => {
  let service: Moderation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Moderation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
