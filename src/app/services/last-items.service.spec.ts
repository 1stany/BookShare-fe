import { TestBed } from '@angular/core/testing';

import { LastItemsService } from './last-items.service';

describe('LastItemsService', () => {
  let service: LastItemsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastItemsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
