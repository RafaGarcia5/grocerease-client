import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Cart } from './cart';
import { CartService } from '../../core/services/cart.service';
import { CartApiService } from '../../core/services/cart-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavigationService } from '../../core/services/navigation.service';
import { MatStepper } from '@angular/material/stepper';
import { Product } from '../../models/product.model';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';
import { Auth } from '../../core/services/auth';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;

  let cartServiceMock: any;
  let cartApiServiceMock: any;
  let notificationMock: any;
  let navigationMock: any;
  let mockAuth: Auth;

  const mockProduct: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Description',
    price: '100.00',
    stock: 10,
    image_url: null,
    category_id: 1,
    status: 'active',
    category: { id: 1, name: 'Category' },
    images: [{ url: null, alt: null}]
  };

  const mockItems = [
    { id: 1, product_id: 1, product: mockProduct, quantity: 2 }
  ];

  beforeEach(async () => {
    cartServiceMock = {
      cart$: new BehaviorSubject(mockItems),
      removeItemById: jasmine.createSpy('removeItemById'),
      updateQuantity: jasmine.createSpy('updateQuantity'),
      clearCart: jasmine.createSpy('clearCart')
    };

    cartApiServiceMock = {
      checkout: jasmine.createSpy('checkout').and.returnValue(of({ message: 'Order created' })),
      confirmPayment: jasmine.createSpy('confirmPayment').and.returnValue(of({ status: 'success' }))
    };

    notificationMock = {
      showSuccess: jasmine.createSpy('showSuccess'),
      showError: jasmine.createSpy('showError'),
      showWarning: jasmine.createSpy('showWarning')
    };

    navigationMock = jasmine.createSpyObj('NavigationService', ['goToOrders', 'goToProduct']);

    mockAuth = { isAuthenticated: true } as Auth;

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CartService, useValue: cartServiceMock },
        { provide: CartApiService, useValue: cartApiServiceMock },
        { provide: NotificationService, useValue: notificationMock },
        { provide: NavigationService, useValue: navigationMock },
        { provide: Auth, useValue: mockAuth },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    cartServiceMock.cart$.complete();
  });

  function setIsAuthenticated(isAuth: boolean | null) {
    Object.defineProperty(mockAuth, 'isAuthenticated', { get: () => isAuth });
  }

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should calculate total correctly', () => {
      expect(component.total).toBe(200);
    });

    it('should detect when cart has items', () => {
      expect(component.hasItems).toBeTrue();
    });
  });

  describe('when managing items in the cart', () => {
    it('should remove item from cart', () => {
      component.remove(1);
      expect(cartServiceMock.removeItemById).toHaveBeenCalledWith(1);
    });
  
    it('should increase item quantity', () => {
      component.increaseQuantity(1, 0);
      expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith(1, 3);
    });
  
    it('should decrease item quantity', () => {
      component.decreaseQuantity(1, 0);
      expect(cartServiceMock.updateQuantity).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('when navigating', () => {
    it('should go to product page', () => {
      component.goToProduct(5);
      expect(navigationMock.goToProduct).toHaveBeenCalledWith(5);
    });

    it('should reset cart and navigate to orders', () => {
      const stepper = { reset: jasmine.createSpy('reset') } as unknown as MatStepper;
      component.resetCart(stepper);
      expect(stepper.reset).toHaveBeenCalled();
      expect(navigationMock.goToOrders).toHaveBeenCalled();
    });
  });

  describe('when confirming an order', () => {
    it('should confirm order successfully', fakeAsync(() => {
      const stepper = { next: jasmine.createSpy('next') } as unknown as MatStepper;
      setIsAuthenticated(true);
  
      cartApiServiceMock.checkout.and.returnValue(of({
        checkout_url: 'https://test-checkout',
        session_id: 'abc123'
      }));
  
      cartApiServiceMock.confirmPayment.and.returnValue(of({ status: 'success' }));
  
      spyOn(window, 'open');
  
      component.confirmOrder(stepper);
  
      tick(3000);
  
      expect(cartApiServiceMock.checkout).toHaveBeenCalled();
      expect(cartApiServiceMock.confirmPayment).toHaveBeenCalledWith('abc123');
      expect(notificationMock.showSuccess).toHaveBeenCalledWith('Payment confirmed!', 'Your order has been created');
      expect(cartServiceMock.clearCart).toHaveBeenCalled();
      expect(stepper.next).toHaveBeenCalled();
    }));
  
    it('should warn if user is not logged in', () => {
      setIsAuthenticated(false);
      const stepper = { next: jasmine.createSpy('next') } as unknown as MatStepper;
      
      component.confirmOrder(stepper);
      expect(notificationMock.showWarning).toHaveBeenCalledWith('Login required', jasmine.any(String));
    });
  
    it('should show error on checkout failure', () => {
      const stepper = { next: jasmine.createSpy('next') } as unknown as MatStepper;
      setIsAuthenticated(true);
  
      cartApiServiceMock.checkout.and.returnValue(
        throwError(() => ({ error: { errors: { stock: ['Not enough stock'] } } }))
      );
  
      component.confirmOrder(stepper);
      expect(notificationMock.showError).toHaveBeenCalledWith('Something went wrong', 'Error creating order. Please try again');
    });
  });
});