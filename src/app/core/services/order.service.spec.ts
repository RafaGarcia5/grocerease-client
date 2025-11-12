import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { OrderService } from './order.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { OrderPayload, OrderResponse } from '../../models/order.model';

describe('OrderService', () => {
  let service: OrderService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OrderService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(OrderService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('when creating orders', () => {
    it('should cretae a new order', () => {
      const payload: OrderPayload = {
        user_id: 1,
        order_date: '2025-10-27',
        status: 'pending',
        total: 200,
        details: [
          { product_id: 1, pieces: 2, unit_price: 100 }
        ]
      };
  
      const mockResponse: OrderResponse = {
        id: 1,
        user_id: 1,
        order_date: '2025-10-27',
        status: 'pending',
        total: 200,
        details: []
      };
  
      apiSpy.post.and.returnValue(of(mockResponse));
  
      service.createOrder(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
  
      expect(apiSpy.post).toHaveBeenCalledWith('order', payload);
    });
  });

  describe('when getting orders', () => {
    it('should get orders from user with default params', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getOrders().subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('order', {
        page: 1,
        per_page: 30,
        sort_dir: 'desc',
        status: undefined
      });
    });
    
    it('should get orders from user with custom params', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getOrders(2, 20, 'completed', 'asc').subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('order', {
        page: 2,
        per_page: 20,
        sort_dir: 'asc',
        status: 'completed'
      });
    });
  
    it('should get order by an id', () => {
      const mockOrder: OrderResponse = {
        id: 1,
        user_id: 1,
        order_date: '2025-10-27',
        status: 'completed',
        total: 300,
        details: []
      };
  
      apiSpy.get.and.returnValue(of(mockOrder));
  
      service.getOrderById(1).subscribe(order => {
        expect(order).toEqual(mockOrder);
      });
  
      expect(apiSpy.get).toHaveBeenCalledWith('order/1');
    });
  });

  describe('when searching orders', () => {
    it('should get orders by search with correct query', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getOrdersBySearch('electronics', 2, 15, 'total', 'asc').subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('order/search', {
        q: 'electronics',
        page: 2,
        per_page: 15,
        sort_by: 'total',
        sort_dir: 'asc'
      });
    });
  });

  describe('when updating orders', () => {
    it('should update order', () => {
      const payload = { status: 'completed' };
      const mockResponse: OrderResponse = {
        id: 1,
        user_id: 1,
        order_date: '2025-10-27',
        status: 'completed',
        total: 200,
        details: []
      };
  
      apiSpy.put.and.returnValue(of(mockResponse));
  
      service.updateOrder(1, payload).subscribe(order => {
        expect(order).toEqual(mockResponse);
      });
  
      expect(apiSpy.put).toHaveBeenCalledWith('order/1', payload);
    });
  });

  describe('when cancelling orders', () => {
    it('should cancel order', () => {
      apiSpy.put.and.returnValue(of( {} ));
  
      service.cancelOrder(5).subscribe();
  
      expect(apiSpy.put).toHaveBeenCalledWith('order/5', { status: 'cancel' });
    });
  });
});
