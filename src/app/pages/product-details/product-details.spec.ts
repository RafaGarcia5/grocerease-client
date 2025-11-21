import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductDetails } from './product-details';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Auth } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification.service';
import { Product } from '../../models/product.model';

describe('ProductDetails', () => {
  let component: ProductDetails;
  let fixture: ComponentFixture<ProductDetails>;

  const mockProduct: Product = {
    id: 1,
    name: 'Sample Product',
    description: 'A test product',
    price: '100',
    stock: 10,
    status: 'active',
    image_url: null,
    category_id: 1,
    category: { id: 1, name: 'Category A' },
    images: [{ url: null, alt: null}]
  };

  const mockActivatedRoute = {
    snapshot: { paramMap: new Map([['id', '1']]) }
  };

  const mockProductService = {
    getProductById: jasmine.createSpy('getProductById').and.returnValue(of(mockProduct)),
    updateProduct: jasmine.createSpy('updateProduct').and.returnValue(of(mockProduct))
  };

  const mockCartService = {
    cart$: new BehaviorSubject([{ product_id: 1, quantity: 2 }]),
    addItem: jasmine.createSpy('addItem'),
    decreaseQuantity: jasmine.createSpy('decreaseQuantity'),
    removeItemByProduct: jasmine.createSpy('removeItemByProduct')
  };

  const mockAuthService = {
    isVendor: jasmine.createSpy('isVendor').and.returnValue(false)
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(null)
    })
  };

  const mockNotification = {
    showInfo: jasmine.createSpy('showInfo'),
    showSuccess: jasmine.createSpy('showSuccess'),
    showError: jasmine.createSpy('showError')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetails],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ProductService, useValue: mockProductService },
        { provide: CartService, useValue: mockCartService },
        { provide: Auth, useValue: mockAuthService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load product and detect if it is in cart', () => {
      expect(mockProductService.getProductById).toHaveBeenCalledWith(1);
      expect(component.product).toEqual(mockProduct);
      expect(component.quantity).toBe(2);
      expect(component.inCart).toBeTrue();
    });
  })

  describe('when interacting with cart', () => {
    it('should add item to cart', () => {
      component.addToCart();
      expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
    });
  
    it('should increase quantity', () => {
      component.increase();
      expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
    });
  
    it('should decrease quantity', () => {
      component.decrease();
      expect(mockCartService.decreaseQuantity).toHaveBeenCalledWith(mockProduct.id);
    });
  
    it('should remove product from cart', () => {
      component.remove();
      expect(mockCartService.removeItemByProduct).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('when editing a product', () => {
    it('should open edit dialog', () => {
      component.editProduct(mockProduct);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should update product successfully and reload data', () => {
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'Updated Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.updateProduct.and.returnValue(of(mockProduct));
      const initSpy = spyOn(component, 'ngOnInit');
  
      component.editProduct(mockProduct);
  
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, { name: 'Updated Product' });
      expect(mockNotification.showInfo).toHaveBeenCalledWith('Updated product', 'Your changes has been saved');
      expect(initSpy).toHaveBeenCalled();
    });

    it('should show error when product update fails', () => {
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'Updated Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.updateProduct.and.returnValue(throwError(() => ({ error: { message: 'Update failed' } })));
      const consoleSpy = spyOn(console, 'error');
  
      component.editProduct(mockProduct);
  
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Oops, something went wrong',
        'Your changes could not be saved. Try again later'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('when checking user role', () => {
    it('should detect vendor or customer role correctly', () => {
      expect(component.userRole).toBeFalse();
      mockAuthService.isVendor.and.returnValue(true);
      expect(component.userRole).toBeTrue();
    });
  });
});
