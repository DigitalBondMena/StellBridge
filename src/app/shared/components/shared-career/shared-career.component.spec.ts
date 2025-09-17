import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedCareerComponent } from './shared-career.component';

describe('SharedCareerComponent', () => {
  let component: SharedCareerComponent;
  let fixture: ComponentFixture<SharedCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedCareerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharedCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
