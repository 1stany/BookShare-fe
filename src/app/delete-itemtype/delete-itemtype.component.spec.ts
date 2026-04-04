import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteItemtypeComponent } from './delete-itemtype.component';

describe('DeleteItemtypeComponent', () => {
  let component: DeleteItemtypeComponent;
  let fixture: ComponentFixture<DeleteItemtypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteItemtypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteItemtypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
