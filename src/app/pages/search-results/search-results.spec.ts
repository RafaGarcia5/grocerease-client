import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SearchResults } from './search-results';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

describe('SearchResults', () => {
  let component: SearchResults;
  let fixture: ComponentFixture<SearchResults>;

  const mockProducts = [
    { id: 1, name: 'Laptop', description: 'High-end gaming laptop', price: '100', stock: 10, image_url: 'http://example.com/laptop.jpg', category_id: 2, status: 'active', category: { id: 1, name: 'Electronics'}, images: [{ url: null, alt: null}]},
    { id: 2, name: 'Mouse', description: 'High-end gaming mouse', price: '50', stock: 15, image_url: null, category_id: 2, status: 'active', category: { id: 1, name:'Electronics'}, images: [{ url: null, alt: null}]},
  ];

  const mockRoute = {
    queryParams: of({ term: 'test' }),
    snapshot: { queryParams: { term: 'test' } }
  };

  const mockProductService = {
    getProductsBySearch: jasmine.createSpy('getProductsBySearch').and.returnValue(
      of({
        data: mockProducts,
        current_page: 1,
        total: 2
      })
    ),
    updateProduct: jasmine.createSpy('updateProduct').and.returnValue(of({}))
  };

  const mockCartService = {
    cart$: new BehaviorSubject<any[]>([
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 1 }
    ]),
    getQuantity: (id: number) => (id === 1 ? 2 : 1),
    addItem: jasmine.createSpy('addItem'),
    decreaseQuantity: jasmine.createSpy('decreaseQuantity')
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(null)
    })
  };

  const mockNotification = {
    showInfo: jasmine.createSpy('showInfo'),
    showError: jasmine.createSpy('showError')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResults],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: ProductService, useValue: mockProductService },
        { provide: CartService, useValue: mockCartService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load products on init', () => {
      expect(mockProductService.getProductsBySearch).toHaveBeenCalledWith('test', 1, component.pageSize);
      expect(component.products.length).toBe(2);
      expect(component.pageIndex).toBe(0);
      expect(component.totalItems).toBe(2);
    });
  
    it('should sync quantities from cart', () => {
      expect(component.quantities[1]).toBe(2);
      expect(component.quantities[2]).toBe(1);
    });
  });

  describe('pagination', () => {
    it('should change page and reload products', () => {
      component.onPageChange({ pageIndex: 1, pageSize: 60, length: 2 } as any);
      expect(mockProductService.getProductsBySearch).toHaveBeenCalledWith('test', 2, 60);
    });
  });

  describe('cart interactions', () => {
    it('should add item to cart', () => {
      const product = mockProducts[0];
      component.addToCart(product);
      expect(mockCartService.addItem).toHaveBeenCalledWith(product);
    });

    it('should increase quantity', () => {
      const product = mockProducts[1];
      component.increase(product);
      expect(mockCartService.addItem).toHaveBeenCalledWith(product);
    });
  
    it('should decrease quantity', () => {
      const product = mockProducts[0];
      component.decrease(product);
      expect(mockCartService.decreaseQuantity).toHaveBeenCalledWith(product.id);
    });
  });

  describe('product editing', () => {
    it('should open dialog to edit product', () => {
      const product = mockProducts[0];
      component.editProduct(product);
      expect(mockDialog.open).toHaveBeenCalled();
    });
  
    it('should handle error when updating product fails', () => {
      const product = mockProducts[0];
      mockDialog.open.and.returnValue({ afterClosed: () => of({ name: 'Bad update' }) });
      mockProductService.updateProduct.and.returnValue(throwError(() => ({ error: { message: 'Update failed' } })));
  
      spyOn(console, 'error');
      component.editProduct(product);
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Oops, something went wrong',
        'Your changes could not be saved. Try again later'
      );
      expect(console.error).toHaveBeenCalledWith('Update failed');
    });
  });

  describe('syncQuantities', () => {
    it('should correctly syncQuantities for loaded products', () => {
      component.products = mockProducts;
      component.syncQuantities();
      expect(component.quantities[1]).toBe(2);
      expect(component.quantities[2]).toBe(1);
    });
  })
});
