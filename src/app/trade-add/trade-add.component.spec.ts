import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeAddComponent } from './trade-add.component';

describe('TradeAddComponent', () => {
  let component: TradeAddComponent;
  let fixture: ComponentFixture<TradeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
