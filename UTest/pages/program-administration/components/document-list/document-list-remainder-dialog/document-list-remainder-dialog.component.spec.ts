import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListRemainderDialogComponent } from './document-list-remainder-dialog.component';

describe('DocumentListRemainderDialogComponent', () => {
  let component: DocumentListRemainderDialogComponent;
  let fixture: ComponentFixture<DocumentListRemainderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentListRemainderDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListRemainderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
