import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastItemsComponent } from './last-items.component';

describe('LastItemsComponent', () => {
  let component: LastItemsComponent;
  let fixture: ComponentFixture<LastItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastItemsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
