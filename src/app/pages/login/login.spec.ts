import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Login } from './login';
import { NotificationService } from '../../core/services/notification.service';
import { provideRouter } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { of, throwError, Subject } from 'rxjs';
import { NavigationService } from '../../core/services/navigation.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockAuthService: jasmine.SpyObj<Auth>;
  let mockNavigation: jasmine.SpyObj<NavigationService>;

  const mockUser = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'customer', address: {}, payment: 'cash' };
  const mockResponse = { token: 'abc123', user: mockUser };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('Auth', ['login', 'handleAuthSuccess']);
    (mockAuthService as any).userSubject = new Subject();

    mockNotification = jasmine.createSpyObj('NotificationService', [ 'showSuccess', 'showError', 'showInfo']);
    mockNavigation = jasmine.createSpyObj('NavigationService', ['goToHome']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NotificationService, useValue: mockNotification },
        { provide: Auth, useValue: mockAuthService},
        { provide: NavigationService, useValue: mockNavigation },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should have invalid form initially', () => {
      expect(component.loginForm.valid).toBeFalse();
    });
  
    it('should become valid when form is filled correctly', () => {
      component.loginForm.setValue({ email: 'test@example.com', password: '1234' });
      expect(component.loginForm.valid).toBeTrue();
    });
  });

  describe('when submitting login form', () => {

    it('should handle successful login', () => {
      mockAuthService.login.and.returnValue(of(mockResponse));
  
      component.loginForm.setValue({ email: 'alice@example.com', password: '1234' });
      component.onSubmit();
  
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'alice@example.com',
        password: '1234'
      });
      expect(mockAuthService.handleAuthSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Login success', 'Welcome again, Alice');
      expect(mockNavigation.goToHome).toHaveBeenCalled();
      expect(component.loading()).toBeFalse();
    });
  
    it('should handle login error', () => {
      mockAuthService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));
      component.loginForm.setValue({ email: 'bad@example.com', password: 'wrong' });
  
      component.onSubmit();
  
      expect(component.invalidCredentials).toBeTrue();
      expect(component.loginForm.get('email')?.hasError('invalidCredentials')).toBeTrue();
      expect(component.loginForm.get('password')?.hasError('invalidCredentials')).toBeTrue();
      expect(component.loading()).toBeFalse();
    });

    it('should not attempt login if form is invalid', () => {
      component.loginForm.setValue({ email: '', password: '' });
      component.onSubmit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });
  });

  describe('when interacting with UI', () => {
    it('should toggle password visibility when clickEvent is called', () => {
      const mockEvent = new MouseEvent('click');
      spyOn(mockEvent, 'stopPropagation');
  
      const initialState = component.hide();
      component.clickEvent(mockEvent);
  
      expect(component.hide()).toBe(!initialState);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should reset invalidCredentials on form value change', () => {
      component.invalidCredentials = true;
      component.loginForm.get('email')?.setValue('new@example.com');
      expect(component.invalidCredentials).toBeFalse();
    });
  
    it('should show spinner when loading is true', () => {
      component.loading.set(true);
      fixture.detectChanges();
  
      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });
  });
});
