import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QusContainerComponent } from './qus-container.component';

describe('QusContainerComponent', () => {
  let component: QusContainerComponent;
  let fixture: ComponentFixture<QusContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QusContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QusContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
