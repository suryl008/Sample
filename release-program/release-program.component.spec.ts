import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseProgramComponent } from './release-program.component';

describe('ReleaseProgramComponent', () => {
  let component: ReleaseProgramComponent;
  let fixture: ComponentFixture<ReleaseProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseProgramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
