import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { OrderDetail } from './order-detail';
import { OrderService } from '../../core/services/order.service';
import { NotificationService } from '../../core/services/notification.service';

describe('OrderDetail', () => {
  let component: OrderDetail;
  let fixture: ComponentFixture<OrderDetail>;

  const mockActivatedRoute = {
    snapshot: { paramMap: new Map([['id', '1']]) }
  };

  const mockOrderService = {
    getOrderById: jasmine.createSpy('getOrderById').and.returnValue(
      of({
        id: 1,
        status: 'pending',
        order_date: new Date(),
        total: 200,
        details: [
          { id: 1, product: { name: 'Product 1' }, pieces: 2, unit_price: 100 }
        ]
      })
    ),
    cancelOrder: jasmine.createSpy('cancelOrder').and.returnValue(of({})),
    updateOrder: jasmine.createSpy('updateOrder').and.returnValue(
      of({
        id: 1,
        status: 'delivered',
        order_date: new Date(),
        total: 200,
        details: []
      })
    )
  };

  const mockNotification = {
    showInfo: jasmine.createSpy('showInfo'),
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: OrderService, useValue: mockOrderService },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load order on init', () => {
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(1);
      expect(component.order).toBeTruthy();
      expect(component.order.id).toBe(1);
    });
  });

  describe('when cancelling an order', () => {
    it('should call cancelOrder service and update status', () => {
      component.cancelOrder();
      expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(1);
      expect(mockNotification.showInfo).toHaveBeenCalled();
      expect(component.order.status).toBe('cancel');
    });
  });

  describe('when updating an order', () => {
    it('should updateOrder service and set status to delivered', () => {
      component.updateOrder();
      expect(mockOrderService.updateOrder).toHaveBeenCalledWith(1, { status: 'delivered' });
      expect(mockNotification.showSuccess).toHaveBeenCalled();
      expect(component.order.status).toBe('delivered');
    });
  });

  describe('when getting status icon', () => {
    it('should return correct icon for known status', () => {
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
