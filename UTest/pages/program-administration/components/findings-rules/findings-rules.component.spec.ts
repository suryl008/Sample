import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindingsRulesComponent } from './findings-rules.component';

describe('FindingsRulesComponent', () => {
  let component: FindingsRulesComponent;
  let fixture: ComponentFixture<FindingsRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindingsRulesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindingsRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
