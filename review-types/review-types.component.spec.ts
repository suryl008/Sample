import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewTypesComponent } from './review-types.component';

describe('ReviewTypesComponent', () => {
  let component: ReviewTypesComponent;
  let fixture: ComponentFixture<ReviewTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewTypesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
