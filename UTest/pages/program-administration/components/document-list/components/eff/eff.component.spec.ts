import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EffComponent } from './eff.component';

describe('EffComponent', () => {
  let component: EffComponent;
  let fixture: ComponentFixture<EffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EffComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
