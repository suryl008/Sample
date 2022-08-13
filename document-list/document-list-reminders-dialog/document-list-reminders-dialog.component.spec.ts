import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListRemindersDialogComponent } from './document-list-reminders-dialog.component';

describe('DocumentListRemindersDialogComponent', () => {
  let component: DocumentListRemindersDialogComponent;
  let fixture: ComponentFixture<DocumentListRemindersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentListRemindersDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListRemindersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
