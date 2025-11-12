import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Register } from './register';
import { NotificationService } from '../../core/services/notification.service';
import { Auth } from '../../core/services/auth';
import { provideRouter } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockAuthService: jasmine.SpyObj<Auth>;

  const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'customer', address: {}, payment: 'cash' };
  const mockResponse = { token: 'abc123', user: mockUser };

  const mockInfo = {
    name: 'Alice',
    email: 'alice@example.com',
    password: '12345678',
    password_confirmation: '12345678',
    role: 'customer',
    address: {
      addressLine1: 'Street 1',
      addressLine2: '',
      zipCode: '12345',
      colony: 'Colony',
      city: 'City',
      state: 'State'
    },
    payment: 'cash'
  }

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('Auth', ['register', 'handleAuthSuccess']);
    (mockAuthService as any).userSubject = new Subject();

    mockNotification = jasmine.createSpyObj('NotificationService', [ 'showSuccess', 'showError' ]);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NotificationService, useValue: mockNotification },
        { provide: Auth, useValue: mockAuthService},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should have invalid form initially', () => {
      expect(component.registerForm.valid).toBeFalse();
    });
  });

  describe('form validation', () => {
    it('should be valid when filled correctly', () => {
      component.registerForm.setValue(mockInfo);
      expect(component.registerForm.valid).toBeTrue();
    });

    it('should invalidate form if passwords do not match', () => {
      component.registerForm.setValue({...mockInfo, password_confirmation: 'aaaaa'});

      expect(component.registerForm.valid).toBeFalse();
      expect(component.registerForm.get('password_confirmation')?.hasError('passwordMismatch')).toBeTrue();
    });

    it('should not submit if form is invalid', () => {
      component.registerForm.setValue({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
        address: {
          addressLine1: '',
          addressLine2: '',
          zipCode: '',
          colony: '',
          city: '',
          state: ''
        },
        payment: ''
      });

      component.onSubmit();

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('successful registration', () => {
    it('should call register and handle success', () => {
      mockAuthService.register.and.returnValue(of(mockResponse));
  
      component.registerForm.setValue(mockInfo);
  
      component.onSubmit();
  
      expect(mockAuthService.register).toHaveBeenCalledWith(mockInfo);
  
      expect(mockAuthService.handleAuthSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Successful registration', 'Welcome, Alice');
      expect(component.loading()).toBeFalse();
    });    
  });

  describe('registration errors', () => {
    it('should handle backend errors correctly', () => {
      const backendError = { error: { message: 'Invalid data', errors: { email: ['Email already exists'] } } };
      mockAuthService.register.and.returnValue(throwError(() => backendError));
  
      component.registerForm.setValue(mockInfo);
  
      component.onSubmit();
  
      expect(component.registerForm.get('email')?.hasError('backend')).toBeTrue();
      expect(component.registerForm.get('email')?.getError('backend')).toBe('Email already exists');
      expect(mockNotification.showError).toHaveBeenCalledWith('Error registering', 'Invalid data');
      expect(component.loading()).toBeFalse();
    });
  })

});
