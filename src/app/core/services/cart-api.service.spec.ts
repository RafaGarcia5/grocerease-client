import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CartApiService } from './cart-api.service';
import { ApiService } from './api.service';
import { CartItem, CartItemPayload } from '../../models/cart.model';

describe('CartApiService', () => {
  let service: CartApiService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  const mockCartItem: CartItem = {
    id: 1,
    cart_id: 1,
    product_id: 2,
    quantity: 3,
    product: {
      id: 2,
      name: 'Laptop',
      description: 'A nice laptop',
      price: '999.99',
      stock: 10,
      image_url: null,
      category_id: 1,
      status: 'available',
      category: { id: 1, name: 'Tech' },
      images: [{url: '', alt: null}]
    }
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CartApiService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(CartApiService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('cart operations', () => {
    describe('when obtaining cart item', () => {
      it('should call api.get("cart") and return cart data', () => {
        const mockResponse = { items: [mockCartItem] };
        apiSpy.get.and.returnValue(of(mockResponse));
    
        service.getCart().subscribe(response => {
          expect(response).toEqual(mockResponse);
        });
    
        expect(apiSpy.get).toHaveBeenCalledWith('cart');
      });
    });

    describe('when adding an item', () => {
      it('should call api.post("cart/add") and return added item', () => {
        const payload: CartItemPayload = { product_id: 2, quantity: 1 };
        apiSpy.post.and.returnValue(of(mockCartItem));
    
        service.addItem(payload).subscribe(item => {
          expect(item).toEqual(mockCartItem);
        });
    
        expect(apiSpy.post).toHaveBeenCalledWith('cart/add', payload);
      });
    });
  
    describe('when updating an item', () => {
      it('should call api.put("cart/item/:id") with new quantity', () => {
        const id = 1;
        const quantity = 5;
        apiSpy.put.and.returnValue(of({ ...mockCartItem, quantity }));
    
        service.updateItem(id, quantity).subscribe(item => {
          expect(item.quantity).toBe(quantity);
        });
    
        expect(apiSpy.put).toHaveBeenCalledWith(`cart/item/${id}`, { quantity });
      });
    });

    describe('when removing an item', () => {
      it('should call api.delete("cart/item/:id") and return success', () => {
        const id = 1;
        const mockResponse = { success: true };
        apiSpy.delete.and.returnValue(of(mockResponse));
    
        service.removeItem(id).subscribe(response => {
          expect(response).toEqual(mockResponse);
        });
    
        expect(apiSpy.delete).toHaveBeenCalledWith(`cart/item/${id}`);
      });
    });
  
    describe('when clearing cart', () => {
      it('should call api.delete("cart/clear") and return success', () => {
        const mockResponse = { success: true };
        apiSpy.delete.and.returnValue(of(mockResponse));
    
        service.clearCart().subscribe(response => {
          expect(response).toEqual(mockResponse);
        })
    
        expect(apiSpy.delete).toHaveBeenCalledWith('cart/clear');
      });
    });
  
    describe('when checking out', () => {
      it('should call api.post("order/checkout") and return order info', () => {
        const mockResponse = { orderId: 123 };
        apiSpy.post.and.returnValue(of(mockResponse));
    
        service.checkout().subscribe(response => {
          expect(response).toEqual(mockResponse);
        });
    
        expect(apiSpy.post).toHaveBeenCalledWith('order/checkout', {});
      });
    });
  });
});
