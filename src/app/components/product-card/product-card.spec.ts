import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCard } from './product-card';
import { CartService } from '../../core/services/cart.service';
import { Auth } from '../../core/services/auth';
import { Product } from '../../models/product.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NavigationService } from '../../core/services/navigation.service';

describe('ProductCard', () => {
  let component: ProductCard;
  let fixture: ComponentFixture<ProductCard>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockAuthService: jasmine.SpyObj<Auth>;
  let mockNavigation: jasmine.SpyObj<NavigationService>;

  const mockProduct: Product = {
    id: 1,
    name: 'Gaming Mouse',
    description: 'High precision gaming mouse',
    price: '49.99',
    stock: 10,
    image_url: null,
    category_id: 2,
    status: 'active',
    category: { id: 2, name: 'Electronics'},
    images: [{url: '', alt: null}]
  };

  beforeEach(async () => {
    mockCartService = jasmine.createSpyObj('CartService', ['addItem', 'decreaseQuantity']);
    mockAuthService = jasmine.createSpyObj('Auth', ['isVendor']);
    mockNavigation = jasmine.createSpyObj('NavigationService', ['goToProduct']);

    await TestBed.configureTestingModule({
      imports: [ProductCard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CartService, useValue: mockCartService },
        { provide: Auth, useValue: mockAuthService },
        { provide: NavigationService, useValue: mockNavigation },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCard);
    component = fixture.componentInstance;
    component.product = mockProduct;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('cart operations', () => {
    describe('when adding a product to the cart', () => {
      it('should call CartService.addItem with the product', () => {
        component.addToCart();
        expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
      });
    });

    describe('when increasing quantity', () => {
      it('should call CartService.addItem again', () => {
        component.increase();
        expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
      });
    });

    describe('when decreasing a quantity', () => {
      it('should call CartService.decreaseQuantity with product id', () => {
        component.decrease();
        expect(mockCartService.decreaseQuantity).toHaveBeenCalledWith(mockProduct.id);
      });
    });
  });

  describe('navigation', () => {
    describe('when user selects a product', () => {
      it('should navigate to the product page', () => {
        component.goToProduct();
        expect(mockNavigation.goToProduct).toHaveBeenCalledWith(mockProduct.id);
      });
    });
  });

  describe('events', () => {
    describe('when update button is clicked', () => {
      it('should emit updateClick event', () => {
        spyOn(component.updateClick, 'emit');
        component.onUpdateClick();
        expect(component.updateClick.emit).toHaveBeenCalled();
      });
    });
  });

  describe('user roles', () => {
    it('should return true for userRole if user is vendor', () => {
      mockAuthService.isVendor.and.returnValue(true);
      expect(component.userRole).toBeTrue();
    });
  
    it('should return false for userRole if user is not vendor', () => {
      mockAuthService.isVendor.and.returnValue(false);
      expect(component.userRole).toBeFalse();
    });
  });

  describe('templete rendering', () => {
    it('should render product details in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
  
      expect(compiled.querySelector('mat-card-title')?.textContent).toContain(mockProduct.name);
      expect(compiled.querySelector('mat-card-subtitle')?.textContent).toContain(String(mockProduct.price));
    });
  
    it('should disable Add to Cart button if product is inactive', () => {
      component.product = { ...mockProduct, status: 'inactive' };
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('button[disabled]');
      
      expect(button).toBeTruthy();
    });
  });
});
