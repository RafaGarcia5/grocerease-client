import { TestBed } from '@angular/core/testing';
import { NavigationService } from '../services/navigation.service';
import { RoleGuard } from './role-guard';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let mockNavigation: jasmine.SpyObj<NavigationService>;
  let mockAuth: Auth;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    mockNavigation = jasmine.createSpyObj('NavigationService', ['goToLogin', 'goToHome']);
    mockAuth = {} as Auth;

    TestBed.configureTestingModule({
      providers: [
        RoleGuard,
        { provide: NavigationService, useValue: mockNavigation },
        { provide: Auth, useValue: mockAuth },
      ]
    });

    guard = TestBed.inject(RoleGuard);
    route = new ActivatedRouteSnapshot();
  });

  function setCurrentUser(user: any | null) {
    Object.defineProperty(mockAuth, 'currentUser', { get: () => user });
  }

  describe('when initializing', () => {
    it('should be created', () => {
      expect(guard).toBeTruthy();
    });
  });

  describe('when navigation', () => {
    it('should navigate to login if user is not logged in', () => {
      setCurrentUser(null);
  
      const result = guard.canActivate(route);
      expect(result).toBeFalse();
      expect(mockNavigation.goToLogin).toHaveBeenCalled();
      expect(mockNavigation.goToHome).not.toHaveBeenCalled();
    });
  
    it('should navigate to /home if role is not authorized', () => {
      setCurrentUser({ role: 'user' });
      route.data = { roles: ['admin'] };
  
      const result = guard.canActivate(route);
      expect(result).toBeFalse();
      expect(mockNavigation.goToHome).toHaveBeenCalled();
    });
  });

  describe('when role is authorized', () => {
    it('should allow access using guard', () => {
      setCurrentUser({ role: 'admin' });
      route.data = { roles: ['admin', 'superadmin'] };
  
      const result = guard.canActivate(route);
      expect(result).toBeTrue();
      expect(mockNavigation.goToLogin).not.toHaveBeenCalled();
      expect(mockNavigation.goToHome).not.toHaveBeenCalled();
    });
  });
});
