import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatsConnectComponent } from './lats-connect.component';

describe('LatsConnectComponent', () => {
  let component: LatsConnectComponent;
  let fixture: ComponentFixture<LatsConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatsConnectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LatsConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
