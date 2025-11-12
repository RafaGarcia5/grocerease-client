import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartConfirmation } from './cart-confirmation';

describe('CartConfirmation', () => {
  let component: CartConfirmation;
  let fixture: ComponentFixture<CartConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartConfirmation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartConfirmation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
