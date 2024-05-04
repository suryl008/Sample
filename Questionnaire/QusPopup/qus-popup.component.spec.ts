import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QusPopupComponent } from './qus-popup.component';

describe('QusPopupComponent', () => {
  let component: QusPopupComponent;
  let fixture: ComponentFixture<QusPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QusPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QusPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
