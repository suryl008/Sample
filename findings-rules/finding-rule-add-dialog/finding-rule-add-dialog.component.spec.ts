import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindingRuleAddDialogComponent } from './finding-rule-add-dialog.component';

describe('FindingRuleAddDialogComponent', () => {
  let component: FindingRuleAddDialogComponent;
  let fixture: ComponentFixture<FindingRuleAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindingRuleAddDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FindingRuleAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
