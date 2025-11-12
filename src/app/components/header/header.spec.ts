import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { NavigationService } from '../../core/services/navigation.service';
import { Header } from './header';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../core/services/cart.service';
import { User } from '../../models/auth.model';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockAuth: jasmine.SpyObj<Auth>;
  let mockCart: jasmine.SpyObj<CartService>;
  let cartSubject: BehaviorSubject<any[]>;
  let userSubject: BehaviorSubject<User | null>;
  let navigationMock: jasmine.SpyObj<NavigationService>;

  beforeEach(async () => {
    userSubject = new BehaviorSubject<User | null>(null);
    cartSubject = new BehaviorSubject<any[]>([]);
    mockAuth = jasmine.createSpyObj('Auth', ['logout'], { user$: userSubject.asObservable() });
    mockCart = jasmine.createSpyObj('CartService', [], { cart$: cartSubject.asObservable() });
    mockNotification = jasmine.createSpyObj('NotificationService', ['showInfo', 'showError']);
    navigationMock = jasmine.createSpyObj('NavigationService', ['goToSearch', 'goToLogin', 'goToCart']);

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: NotificationService, useValue: mockNotification },
        { provide: Auth, useValue: mockAuth },
        { provide: CartService, useValue: mockCart },
        { provide: NavigationService, useValue: navigationMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
    
    it('should update user and authentication state when authService emits user', () => {
      const user: User = { 
        id: 1, 
        name: 'Test User', 
        email: 'test@test.com', 
        address:{}, 
        role: 'customer', 
        payment:'cash',
      };
  
      userSubject.next(user);
      fixture.detectChanges();
  
      expect(component.user).toEqual(user);
      expect(component.isAuthenticated).toBeTrue();
    });
    
    it('should update totalItems when cartService emits cart items', () => {
      const cartItems = [
        { id: 1, name: 'Product 1', quantity: 2 },
        { id: 2, name: 'Product 2', quantity: 3 },
      ];
      
      cartSubject.next(cartItems);
      fixture.detectChanges();
  
      expect(component.totalItems).toBe(5);
    });
  });

  describe('when interacting with menu', () => {
    it('should emit menuClick event when onMenuClick is called', () => {
      spyOn(component.menuClick, 'emit');
      component.onMenuClick();
      expect(component.menuClick.emit).toHaveBeenCalled();
    });
  });

  describe('when searching', () => {
    it('should navigate to search when term is valid', () => {
      component.searchControl.setValue('apple');
      component.onSearch();
  
      expect(navigationMock.goToSearch).toHaveBeenCalledWith('apple');
    });
  
    it('should not navigate when term is empty or whitespace', () => {
      component.searchControl.setValue('   ');
      component.onSearch();
  
      expect(navigationMock.goToSearch).not.toHaveBeenCalled();
    });
  });

  describe('when logging out', () => {
    it('should handle logout errors and show notification', () => {
      const error = { message: 'Logout failed' };
      mockAuth.logout.and.returnValue(throwError(() => error));
  
      component.logout();
  
      expect(mockNotification.showError).toHaveBeenCalledWith('Logout error', 'Logout failed');
    });
  });

  describe('when navigating to cart', () => {
    it('should navigate to cart if authenticated', () => {
      component.isAuthenticated = true;
      component.goToCart();
  
      expect(navigationMock.goToCart).toHaveBeenCalled();
      expect(navigationMock.goToLogin).not.toHaveBeenCalled();
    });
  
    it('should navigate to login if not authenticated', () => {
      component.isAuthenticated = false;
      component.goToCart();
  
      expect(navigationMock.goToLogin).toHaveBeenCalled();
      expect(navigationMock.goToCart).not.toHaveBeenCalled();
    });
  });
});
