import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoundingDayFloadingCircleComponent } from './founding-day-floading-circle.component';

describe('FoundingDayFloadingCircleComponent', () => {
  let component: FoundingDayFloadingCircleComponent;
  let fixture: ComponentFixture<FoundingDayFloadingCircleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FoundingDayFloadingCircleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FoundingDayFloadingCircleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
