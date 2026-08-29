import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListInfoDialogComponent } from './document-list-info-dialog.component';

describe('DocumentListInfoDialogComponent', () => {
  let component: DocumentListInfoDialogComponent;
  let fixture: ComponentFixture<DocumentListInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentListInfoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
