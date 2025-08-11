import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutCeoComponent } from './about-ceo.component';

describe('AboutCeoComponent', () => {
  let component: AboutCeoComponent;
  let fixture: ComponentFixture<AboutCeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutCeoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutCeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
