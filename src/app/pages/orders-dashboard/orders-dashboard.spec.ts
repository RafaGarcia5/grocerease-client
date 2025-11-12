import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { OrdersDashboard } from './orders-dashboard';
import { OrderResponse } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('OrdersDashboard', () => {
  let component: OrdersDashboard;
  let fixture: ComponentFixture<OrdersDashboard>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let mockNotification: jasmine.SpyObj<NotificationService>;

  const mockResponse: {
    data: OrderResponse[];
    current_page: number;
    total: number;
  } = {
    data: [
      {
        id: 1,
        user_id: 99,
        order_date: '2024-10-15',
        status: 'pending',
        total: 200,
        details: [
          {
            id: 1,
            product_id: 10,
            pieces: 2,
            unit_price: 100,
            product: {
              id: 10,
              name: 'Keyboard',
              price: '100.00',
              image_url: null
            }
          }
        ]
      }
    ],
    current_page: 1,
    total: 1
  };


  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', [
      'getOrdersBySearch',
      'updateOrder'
    ]);

    mockNotification = jasmine.createSpyObj('NotificationService', [
      'showInfo',
      'showError'
    ]);

    await TestBed.configureTestingModule({
      imports: [OrdersDashboard],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: NotificationService, useValue: mockNotification },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersDashboard);
    component = fixture.componentInstance;
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load orders on init', () => {
      mockOrderService.getOrdersBySearch.and.returnValue(of(mockResponse));
      component.ngOnInit();
      expect(mockOrderService.getOrdersBySearch).toHaveBeenCalledWith('', 1, 20, 'order_date', 'desc');
      expect(component.orders.length).toBe(1);
      expect(component.orders[0].status).toBe('pending');
      expect(component.totalItems).toBe(1);
    });
  });

  describe('when searching orders', () => {
    it('should call service with search term and reload orders', () => {
      mockOrderService.getOrdersBySearch.and.returnValue(of(mockResponse));
      component.searchTerm = 'john';
      component.onSearch();
      expect(mockOrderService.getOrdersBySearch).toHaveBeenCalledWith('john', 1, 20, 'order_date', 'desc');
    });
  });

  describe('when toggling expanded order', () => {
    it('should expand and collapse selected order', () => {
      const order = mockResponse.data[0];
      component.toggle(order);
      expect(component.expandedElement).toBe(order);
      component.toggle(order);
      expect(component.expandedElement).toBeNull();
    });
  });

  describe('when changing order status', () => {
    it('should update order successfully', () => {
      const order = { ...mockResponse.data[0] };
      mockOrderService.updateOrder.and.returnValue(of({ ...order, status: 'delivered' }));
  
      component.changeStatus(order, 'delivered');
  
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(order.id, { status: 'delivered' });
      expect(order.status).toBe('delivered');
      expect(mockNotification.showInfo).toHaveBeenCalledWith(
        'The status has been changed',
        'The order status has been changed to: delivered'
      );
    });

    it('should handle error when update fails', () => {
      const order = { ...mockResponse.data[0] };
      mockOrderService.updateOrder.and.returnValue(throwError(() => ({ error: { message: 'Fail' } })));
  
      spyOn(console, 'error');
  
      component.changeStatus(order, 'cancel');
  
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(order.id, { status: 'cancel' });
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Something went wrong',
        'Try again later'
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('when loadOrders fails', () => {
    it('should call showError when loadOrders fails', () => {
      mockOrderService.getOrdersBySearch.and.returnValue(throwError(() => ({ error: 'server down' })));
      component.loadOrders();
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Something went wrong',
        'Error loading orders'
      );
    });
  });
});
