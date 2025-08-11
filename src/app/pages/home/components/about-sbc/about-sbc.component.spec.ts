import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSbcComponent } from './about-sbc.component';

describe('AboutSbcComponent', () => {
  let component: AboutSbcComponent;
  let fixture: ComponentFixture<AboutSbcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutSbcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutSbcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
