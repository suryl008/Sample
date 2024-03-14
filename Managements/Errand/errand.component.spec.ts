import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrandComponent } from './errand.component';

describe('ErrandComponent', () => {
  let component: ErrandComponent;
  let fixture: ComponentFixture<ErrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
