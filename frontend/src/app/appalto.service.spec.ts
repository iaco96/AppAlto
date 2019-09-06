import { TestBed } from '@angular/core/testing';

import { AppaltoService } from './appalto.service';

describe('AppaltoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppaltoService = TestBed.get(AppaltoService);
    expect(service).toBeTruthy();
  });
});
