import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CTEPortalComponent } from './cteportal.component';

describe('CTEPortalComponent', () => {
  let component: CTEPortalComponent;
  let fixture: ComponentFixture<CTEPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CTEPortalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CTEPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
