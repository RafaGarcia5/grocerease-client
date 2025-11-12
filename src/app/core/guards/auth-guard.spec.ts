import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth-guard';
import { NavigationService } from '../services/navigation.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockNavigation: jasmine.SpyObj<NavigationService>;

  beforeEach(() => {
    mockNavigation = jasmine.createSpyObj('NavigationService', ['goToLogin']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: NavigationService, useValue: mockNavigation }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(guard).toBeTruthy();
    });
  });

  describe('auth token operations', () => {
    it('should return false and navigate to login if no token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
  
      const result = guard.canActivate();
      expect(result).toBeFalse();
      expect(mockNavigation.goToLogin).toHaveBeenCalled();
    });
  
    it('should return true if token exists', () => {
      spyOn(localStorage, 'getItem').and.returnValue('valid-token');
  
      const result = guard.canActivate();
      expect(result).toBeTrue();
      expect(mockNavigation.goToLogin).not.toHaveBeenCalled();
    });
  });
});
