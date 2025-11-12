import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Orders } from './orders';
import { of } from 'rxjs';
import { OrderService } from '../../core/services/order.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NavigationService } from '../../core/services/navigation.service';

describe('Orders Component', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;
  let mockOrderService: jasmine.SpyObj<OrderService>;
  let navigationMock: jasmine.SpyObj<NavigationService>;

  const mockResponse = {
    data: [
      { id: 1, total: 120, order_date: '2024-05-12', status: 'pending' },
      { id: 2, total: 90, order_date: '2024-06-01', status: 'delivered' },
    ],
    current_page: 1,
    total: 2
  };

  beforeEach(async () => {
    mockOrderService = jasmine.createSpyObj('OrderService', ['getOrders']);
    navigationMock = jasmine.createSpyObj('NavigationService', ['goToOrderDetail']);

    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: OrderService, useValue: mockOrderService },
        { provide: NavigationService, useValue: navigationMock },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load orders on init', () => {
      mockOrderService.getOrders.and.returnValue(of(mockResponse));
      component.ngOnInit();
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(1, 30, '', 'desc');
      expect(component.orders.length).toBe(2);
      expect(component.hasItems).toBeTrue();
    });
  });

  describe('when filtering orders', () => {
    it('should filter orders by selected status', () => {
      mockOrderService.getOrders.and.returnValue(of(mockResponse));
      component.selectedStatus = 'pending';
      component.onFilterChange();
      expect(mockOrderService.getOrders).toHaveBeenCalledWith(1, 30, 'pending', 'desc');
    });
  });

  describe('when sorting orders', () => {
    it('should toggle sort direction and reload orders', () => {
      mockOrderService.getOrders.and.returnValue(of(mockResponse));
      component.sortDir = 'desc';
      component.toggleSortDir();
      expect(component.sortDir).toBe('asc');
      expect(mockOrderService.getOrders).toHaveBeenCalled();
    });
  })

  describe('when navigating to order detail', () => {
    it('should call navigation service with order id', () => {
      const id = 99;
      component.goToOrder(id);
      expect(navigationMock.goToOrderDetail).toHaveBeenCalledWith(id);
    });
  });

  describe('when getting status icon', () => {
    it('should return correct icons for known statuses', () => {
      expect(component.getStatusIcon('pending')).toBe('hourglass_empty');
      expect(component.getStatusIcon('send')).toBe('local_shipping');
      expect(component.getStatusIcon('delivered')).toBe('check_circle');
      expect(component.getStatusIcon('cancel')).toBe('cancel');
      expect(component.getStatusIcon('unknown')).toBe('help_outline');
    });

    it('should return default icon for unknown status', () => {
      expect(component.getStatusIcon('unknown')).toBe('help_outline');
    });
  });
});
