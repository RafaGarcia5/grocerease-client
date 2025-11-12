import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { CartApiService } from './cart-api.service';
import { of, throwError } from 'rxjs';
import { CartItem } from '../../models/cart.model';

describe('CartService', () => {
  let service: CartService;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockCartApi: jasmine.SpyObj<CartApiService>;

  const mockProduct = {
    id: 1,
    name: 'Laptop',
    description: 'High performance',
    price: '1500',
    stock: 10,
    image_url: null,
    category_id: 1,
    status: 'active',
    category: { id: 1, name: 'Electronics' }
  };

  const mockCartItem: CartItem = { 
    id: 100, cart_id: 1, product_id: 1, quantity: 2, product: mockProduct, 
    name: mockProduct.name, description: mockProduct.description, price: mockProduct.price,
    stock: mockProduct.stock, image_url: null, category_id: mockProduct.category_id,
    status: mockProduct.status, category: mockProduct.category
  };

  beforeEach(() => {
    mockNotification = jasmine.createSpyObj('NotificationService', [
      'showSuccess', 'showError', 'showInfo', 'showOutOfStock'
    ]);

    mockCartApi = jasmine.createSpyObj('CartApiService', [
      'getCart', 'addItem', 'updateItem', 'removeItem', 'clearCart'
    ]);

    mockCartApi.getCart.and.returnValue(of({ items: [mockCartItem] }));

    TestBed.configureTestingModule({
      providers: [
        CartService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: mockNotification },
        { provide: CartApiService, useValue: mockCartApi },
      ]
    });

    service = TestBed.inject(CartService);
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  
    it('should load initial cart', () => {
      service.cart$.subscribe(items => {
        expect(items.length).toBe(1);
        expect(items[0].id).toBe(100);
      });
    });
  });

  describe('cart operations', () => {
    describe('when adding items', () => {
      it('should add a new item', () => {
        const newItem = { ...mockCartItem, id: 101, product_id: 2 };
        mockCartApi.addItem.and.returnValue(of(newItem));
    
        service.addItem({ ...mockProduct, id:2, name: 'Smart TV 55\'\'' });
    
        service.cart$.subscribe(items => {
          expect(items.length).toBe(2);
          expect(items[1].id).toBe(101);
        });
      });
    
      it('should increase quantity if item exists', () => {
        const updatedItem = { ...mockCartItem, quantity: 3 };
        mockCartApi.updateItem.and.returnValue(of(updatedItem));
    
        service.addItem(mockProduct);
    
        service.cart$.subscribe(items => {
          expect(items[0].quantity).toBe(3);
        });
      });
    
      it('should handle add item out of stock', () => {
        mockCartApi.updateItem.and.returnValue(throwError(() => ({ error: 'Out of stock' })));
    
        service.addItem(mockProduct);
    
        expect(mockNotification.showOutOfStock).toHaveBeenCalledWith(mockProduct.name);
      });
    });

    describe('when updating quantities', () => {
      it('should update quantity', () => {
        const updatedItem = { ...mockCartItem, quantity: 5 };
        mockCartApi.updateItem.and.returnValue(of(updatedItem));
    
        service.updateQuantity(100, 5);
    
        service.cart$.subscribe(items => {
          expect(items[0].quantity).toBe(5);
        });
      });
    });
    
    describe('when getting quantities', () => {
      it('should return correct quantity for a product', () => {
        const cartItem = { id: 1, cart_id: 1, product_id: 101, quantity: 3, product: { id: 101, name: 'Test', price: 10 } } as any;
        (service as any).cartItems = [cartItem];
    
        expect(service.getQuantity(101)).toBe(3);
      });
  
      it('should return 0 if product is not in the cart', () => {
        (service as any).cartItems = [];
        expect(service.getQuantity(999)).toBe(0);
      });

      it('should remove item when quantity <= 0', () => {
        spyOn(service, 'removeItemById');
    
        service.updateQuantity(100, 0);
    
        expect(service.removeItemById).toHaveBeenCalledWith(100);
        expect(mockNotification.showInfo).toHaveBeenCalled();
      });
    });
  
    describe('when removing items', () => {
      it('should remove item by id', () => {
        mockCartApi.removeItem.and.returnValue(of({}));
  
        service.removeItemById(100);
  
        service.cart$.subscribe(items => {
          expect(items.length).toBe(0);
        });
      });
  
      it('should remove item by product id', () => {
        mockCartApi.removeItem.and.returnValue(of({}));
  
        service.removeItemByProduct(1);
  
        service.cart$.subscribe(items => {
          expect(items.length).toBe(0);
        });
      });
    });
  
    describe('when clearing the cart', () => {
      it('should clear all items', () => {
        mockCartApi.clearCart.and.returnValue(of({}));
    
        service.clearCart();
    
        service.cart$.subscribe(items => {
          expect(items.length).toBe(0);
        });
      });
    });
  });
});
