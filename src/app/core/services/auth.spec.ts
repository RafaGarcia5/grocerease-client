import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from './auth';
import { ApiService } from './api.service';
import { User, LoginResponse, LogoutResponse } from '../../models/auth.model';

describe('Auth', () => {
  let service: Auth;
  let apiServiceSpy: jasmine.SpyObj<ApiService>;

  const mockUser: User = {
    id: 1,
    name: 'Rafa',
    email: 'rafa@test.com',
    role: 'customer',
    address: { addressLine1: 'Guerrero 106', colony: 'El Cerrito' },
    payment: 'cash'
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['post', 'get']);

    TestBed.configureTestingModule({
      providers:[
        provideHttpClient(),
        provideHttpClientTesting(),
        Auth,
        { provide: ApiService, useValue: spy }
      ]
    });

    apiServiceSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    localStorage.clear();
    service = TestBed.inject(Auth);
  });
  
  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
    
    it('should load a user from localStorage if token and user exists', () => {
      localStorage.setItem('token', 'abc123');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      const newService = new Auth(apiServiceSpy);
      expect(newService.currentUser).toEqual(mockUser);
    });

    it('should call fetchCurrentUser if token exists but no stored user', () => {
      const apiResponse = of(mockUser);
      localStorage.setItem('token', 'abc123');
      apiServiceSpy.get.and.returnValue(apiResponse);

      const newService = new Auth(apiServiceSpy);

      expect(apiServiceSpy.get).toHaveBeenCalledWith('user');
      newService.user$.subscribe(user => {
        expect(user).toEqual(mockUser);
      });
    });
  
    it('should return null as currentUser if there is not user', () => {
      expect(service.currentUser).toBeNull();
    });
  });

  describe('Getters', () => {
    it('should return true if it is authenticated', () => {
      (service as any).userSubject.next(mockUser);
      expect(service.isAuthenticated).toBeTrue();
    });
    
    it('should return false if it is not authenticated', () => {
      (service as any).userSubject.next(null);
      expect(service.isAuthenticated).toBeFalse();
    });

    it('should return true if user is a vendor', () => {
      (service as any).userSubject.next({ ...mockUser, role: 'vendor' });
      expect(service.isVendor()).toBeTrue();
    });

    it('should return false if user is not a vendor', () => {
      (service as any).userSubject.next(mockUser);
      expect(service.isVendor()).toBeFalse();
    });
  });

  describe('API methods', () => {
    it('should call to post method with register', () => {
      const mockResponse: LoginResponse = { user: mockUser, token: '2|123a' };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.register(mockUser).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('register', mockUser);
    });

    it('should call to post method with login', () => {
      const credentials = { email: 'rafa@test.com', password: '1234' };
      const mockResponse: LoginResponse = { user: mockUser, token: '2|123a' };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.login(credentials).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('login', credentials);
    });

    it('should call to post method with logout', () => {
      const mockResponse: LogoutResponse = { message: 'Logged out' };
      apiServiceSpy.post.and.returnValue(of(mockResponse));

      service.logout().subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('logout', {});
    });
  });

  describe('Session handling', () => {
    it('should handle auth success and store token and user', () => {
      const mockResponse: LoginResponse = { user: mockUser, token: 'abc' };

      service.handleAuthSuccess(mockResponse);

      expect(localStorage.getItem('token')).toBe('abc');
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(mockUser);
      expect(service.currentUser).toEqual(mockUser);
    });

    it('should clear session', () => {
      localStorage.setItem('token', 'abc');
      localStorage.setItem('user', JSON.stringify(mockUser));
      (service as any).userSubject.next(mockUser);

      service.clearSession();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(service.currentUser).toBeNull();
    });

    it('should update user and persist changes', () => {
      const updatedUser = { ...mockUser, name: 'Rafa Updated' };
      service.updateUser(updatedUser);

      expect(JSON.parse(localStorage.getItem('user')!)).toEqual(updatedUser);
      expect(service.currentUser).toEqual(updatedUser);
    });
  });
});
