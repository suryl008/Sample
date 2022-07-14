import { TestBed } from '@angular/core/testing';

import { ProgramAdministrationService } from './program-administration.service';

describe('ProgramAdministrationService', () => {
  let service: ProgramAdministrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgramAdministrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
