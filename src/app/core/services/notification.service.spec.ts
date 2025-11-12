import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';
import { MessageService } from 'primeng/api';

describe('NotificationService', () => {
  let service: NotificationService;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NotificationService,
        { provide: MessageService, useValue: spy }
      ]
    });

    service = TestBed.inject(NotificationService);
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('when showing notifications', () => {
    describe('success notification', () => {
      it('should create a success toast', () => {
        service.showSuccess('Success', 'Operation completed');
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: 'success',
          summary: 'Success',
          detail: 'Operation completed'
        });
      });
    });

    describe('error notifications', () => {
      it('should create an error toast', () => {
        service.showError('Error', 'Something went wrong');
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong'
        });
      });
    });

    describe('info notifications', () => {
      it('should crete an info toast', () => {
        service.showInfo('Info', 'Some information');
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: 'info',
          summary: 'Info',
          detail: 'Some information'
        });
      });
    });

    describe('warning notifications', () => {
      it('should create a warn toast', () => {
        service.showWarning('Warning', 'Be careful');
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Be careful'
        });
      });
    
      it('should show warning message with product name', () => {
        service.showOutOfStock('Laptop');
        expect(messageServiceSpy.add).toHaveBeenCalledWith({
          severity: 'warn',
          summary: 'Out of stock',
          detail: "The requested quantity of Laptop exceeds the product's stock"
        });
      });
    });
  });
});
