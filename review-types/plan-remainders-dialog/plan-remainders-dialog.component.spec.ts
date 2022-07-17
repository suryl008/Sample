import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanRemaindersDialogComponent } from './plan-remainders-dialog.component';

describe('PlanRemaindersDialogComponent', () => {
  let component: PlanRemaindersDialogComponent;
  let fixture: ComponentFixture<PlanRemaindersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanRemaindersDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanRemaindersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
