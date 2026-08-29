import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentListAddDialogComponent } from './document-list-add-dialog.component';

describe('DocumentListAddDialogComponent', () => {
  let component: DocumentListAddDialogComponent;
  let fixture: ComponentFixture<DocumentListAddDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentListAddDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentListAddDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
