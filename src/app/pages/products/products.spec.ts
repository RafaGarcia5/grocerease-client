import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatDialog } from '@angular/material/dialog';
import { Products } from './products';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;

  const mockProductsResponse = {
    data: [
      { id: 1, name: 'Product 1' },
      { id: 2, name: 'Product 2' }
    ],
    current_page: 1,
    total: 2
  };

  const mockCategories = [
    { id: 1, name: 'Category A' },
    { id: 2, name: 'Category B' }
  ];

  const mockProductService = {
    getProductsBySearch: jasmine.createSpy('getProductsBySearch').and.returnValue(of(mockProductsResponse)),
    getProductsByCategory: jasmine.createSpy('getProductsByCategory').and.returnValue(of(mockProductsResponse)),
    addProduct: jasmine.createSpy('addProduct').and.returnValue(of({})),
    updateProduct: jasmine.createSpy('updateProduct').and.returnValue(of({}))
  };

  const mockCategoryService = {
    getCategories: jasmine.createSpy('getCategories').and.returnValue(of(mockCategories))
  };

  const mockDialog = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(null)
    })
  };

  const mockNotification = {
    showSuccess: jasmine.createSpy('showSuccess'),
    showInfo: jasmine.createSpy('showInfo'),
    showError: jasmine.createSpy('showError')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ProductService, useValue: mockProductService },
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: NotificationService, useValue: mockNotification }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load categories on init', () => {
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(component.categories.length).toBe(2);
    });
  
    it('should load products on init', () => {
      expect(mockProductService.getProductsBySearch).toHaveBeenCalledWith('', 1, component.pageSize);
      expect(component.products.length).toBe(2);
    });
  });

  describe('when filtering and changing pages', () => {
    it('should filter products by category', () => {
      component.selectedCategory = 1;
      component.filterByCategory();
      expect(mockProductService.getProductsByCategory).toHaveBeenCalledWith(1, 1, component.pageSize);
    });

    it('should change page and reload products', () => {
      component.onPageChange({ pageIndex: 1, pageSize: 60, length: 2 } as any);
      expect(mockProductService.getProductsBySearch).toHaveBeenCalledWith('', 2, 60);
    });
  });

  describe('when adding new products', () => {
    it('should open dialog to add product', () => {
      component.addNewProduct();
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should add product successfully and reload list', () => {
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'New Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.addProduct.and.returnValue(of({}));
  
      const loadProductsSpy = spyOn(component, 'loadProducts');
  
      component.addNewProduct();
  
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockProductService.addProduct).toHaveBeenCalledWith({ name: 'New Product' });
      expect(mockNotification.showSuccess).toHaveBeenCalledWith('Added product', 'The product has been added');
      expect(loadProductsSpy).toHaveBeenCalled();
    });

    it('should handle error when adding product fails', () => {
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'New Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.addProduct.and.returnValue(throwError(() => ({ error: { message: 'Server error' } })));
  
      const consoleSpy = spyOn(console, 'error');
  
      component.addNewProduct();
  
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Oops, something went wrong',
        'The product could not be added. Try again later'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Server error');
    });
  });

  describe('when editing products', () => {
    it('should open edit dialog', () => {
      const product = { id: 1, name: 'Product 1' } as any;
      component.editProduct(product);
      expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should update product successfully', () => {
      const product = { id: 1, name: 'Old Product' } as any;
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'Updated Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.updateProduct.and.returnValue(of({}));
  
      const loadProductsSpy = spyOn(component, 'loadProducts');
  
      component.editProduct(product);
  
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(1, { name: 'Updated Product' });
      expect(mockNotification.showInfo).toHaveBeenCalledWith('Updated product', 'Your changes has been saved');
      expect(loadProductsSpy).toHaveBeenCalled();
    });

    it('should handle error when updating product fails', () => {
      const product = { id: 1, name: 'Old Product' } as any;
      const mockDialogWithResult = {
        afterClosed: () => of({ name: 'Updated Product' })
      };
      mockDialog.open.and.returnValue(mockDialogWithResult);
      mockProductService.updateProduct.and.returnValue(throwError(() => ({ error: { message: 'Update failed' } })));
  
      const consoleSpy = spyOn(console, 'error');
  
      component.editProduct(product);
  
      expect(mockNotification.showError).toHaveBeenCalledWith(
        'Oops, something went wrong',
        'Your changes could not be saved. Try again later'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Update failed');
    });
  });
});