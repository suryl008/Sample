import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubRecipientComponent } from './sub-recipient.component';

describe('SubRecipientComponent', () => {
  let component: SubRecipientComponent;
  let fixture: ComponentFixture<SubRecipientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubRecipientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubRecipientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
