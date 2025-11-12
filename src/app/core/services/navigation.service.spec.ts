import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NavigationService } from './navigation.service';
import { APP_ROUTES } from '../constants/app-routes';

describe('NavigationService', () => {
  let service: NavigationService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);

    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(NavigationService);
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('navigation operations', () => {
    describe('auth routes', () => {
      it('should navigate to login', () => {
        service.goToLogin();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.auth.login);
      });
    
      it('should navigate to register', () => {
        service.goToRegister();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.auth.register);
      });
    });

    describe('user routes', () => {
      it('should navigate to home', () => {
        service.goToHome();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.home);
      });
    
      it('should navigate to profile', () => {
        service.goToProfile();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.profile);
      });
    
      it('should navigate to search with query param', () => {
        service.goToSearch('laptop');
        expect(routerSpy.navigate).toHaveBeenCalledWith(
          [APP_ROUTES.user.search],
          { queryParams: { term: 'laptop' } }
        );
      });
    
      it('should navigate to cart', () => {
        service.goToCart();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.cart);
      });
    
      it('should navigate to orders', () => {
        service.goToOrders();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.orders);
      });
    
      it('should navigate to order detail', () => {
        service.goToOrderDetail(10);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.orderDetail(10));
      });
    
      it('should navigate to category', () => {
        service.goToCategory(7);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.category(7));
      });
    
      it('should navigate to product', () => {
        service.goToProduct(5);
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.product(5));
      });
    
      it('should navigate to success page', () => {
        service.goToSuccess('abc123');
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.success('abc123'));
      });
    
      it('should navigate to cancel page', () => {
        service.goToCancel();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.user.cancel);
      });
    });

    describe('vendor routes', () => {
      it('should navigate to admin products', () => {
        service.goToAdminProducts();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.admin.products);
      });
    
      it('should navigate to admin orders', () => {
        service.goToAdminOrders();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.admin.orders);
      });
    
      it('should navigate to admin categories', () => {
        service.goToAdminCategories();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(APP_ROUTES.admin.categories);
      });
    });
  });
});
