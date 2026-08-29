import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindingFieldsComponent } from './finding-fields.component';

describe('FindingFieldsComponent', () => {
  let component: FindingFieldsComponent;
  let fixture: ComponentFixture<FindingFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindingFieldsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindingFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
