import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsByCategory } from './products-by-category';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NavigationService } from '../../core/services/navigation.service';

describe('ProductsByCategory', () => {
  let component: ProductsByCategory;
  let fixture: ComponentFixture<ProductsByCategory>;
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockCartService: jasmine.SpyObj<CartService>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let navigationMock: jasmine.SpyObj<NavigationService>;

  const mockCart$ = new Subject<any[]>();

  const mockProductResponse = {
    data: [
      {
        id: 1,
        name: 'Laptop',
        price: '1000',
        description: 'A good laptop',
        status: 'active',
        image_url: null,
        category: { id: 5, name: 'Electronics' }
      },
      {
        id: 2,
        name: 'Mouse',
        price: '50',
        description: 'Wireless mouse',
        status: 'active',
        image_url: null,
        category: { id: 5, name: 'Electronics' }
      }
    ],
    current_page: 1,
    total: 2
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', [
      'getProductsByCategory',
      'updateProduct'
    ]);

    mockCartService = jasmine.createSpyObj('CartService', [
      'addItem',
      'decreaseQuantity',
      'getQuantity'
    ], { cart$: mockCart$.asObservable() });

    mockNotification = jasmine.createSpyObj('NotificationService', [
      'showSuccess',
      'showError',
      'showInfo'
    ]);

    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    navigationMock = jasmine.createSpyObj('NavigationService', ['goToProduct']);

    await TestBed.configureTestingModule({
      imports: [ProductsByCategory],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductService, useValue: mockProductService },
        { provide: CartService, useValue: mockCartService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: MatDialog, useValue: mockDialog },
        { provide: NavigationService, useValue: navigationMock },
        { provide: ActivatedRoute, useValue: { params: of({ id: 5 }) } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsByCategory);
    component = fixture.componentInstance;
    mockProductService.getProductsByCategory.and.returnValue(of(mockProductResponse));
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load products on init', () => {
      expect(mockProductService.getProductsByCategory).toHaveBeenCalledWith(5, 1, 30, '');
      expect(component.products.length).toBe(2);
      expect(component.categoryName).toBe('Electronics');
    });
  });

  describe('when interacting with cart', () => {
    it('should update quantities when cart changes', () => {
      mockCartService.getQuantity.and.returnValue(2);
      mockCart$.next([{ product_id: 1, quantity: 2 }]);
      expect(component.quantities[1]).toBe(2);
    });

    it('should add product to cart', () => {
      const mockProduct = mockProductResponse.data[0] as Product;
      component.addToCart(mockProduct);
      expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
    });
    
    it('should increase quantity of a product', () => {
      const mockProduct = mockProductResponse.data[0] as Product;
      component.increase(mockProduct);
      expect(mockCartService.addItem).toHaveBeenCalledWith(mockProduct);
    });
    
    it('should increase quantity of a product', () => {
      const mockProduct = mockProductResponse.data[0] as Product;
      component.decrease(mockProduct);
      expect(mockCartService.decreaseQuantity).toHaveBeenCalledWith(mockProduct.id);
    });
  });

  describe('when searching and paginating', () => {
    it('should trigger search with current input', () => {
      const spy = spyOn(component, 'loadProducts');
      component.searchProduct.setValue('laptop');
      component.searchProducts();
      expect(spy).toHaveBeenCalledWith('laptop');
    });

    it('should load next page with same search term', () => {
      const spy = spyOn(component, 'loadProducts');
      component.searchProduct.setValue('mouse');
      component.onPageChange({ pageIndex: 1, pageSize: 30, length: 2 } as any);
      expect(spy).toHaveBeenCalledWith('mouse', 2);
    });
  });

  describe('when navigating', () => {
    it('should navigate to product details', () => {
      component.goToProduct(10);
      expect(navigationMock.goToProduct).toHaveBeenCalledWith(10);
    });
  });

  describe('when editing a product', () => {
    it('should handle error when product update fails', () => {
      const dialogRefMock = { afterClosed: () => of({ name: 'Fail Update' }) } as any;
      mockDialog.open.and.returnValue(dialogRefMock);
      mockProductService.updateProduct.and.returnValue(throwError(() => ({ error: { message: 'Error!' } })));
  
      const product = mockProductResponse.data[0] as Product;
      component.editProduct(product);
  
      expect(mockNotification.showError).toHaveBeenCalled();
    });
  });
});
