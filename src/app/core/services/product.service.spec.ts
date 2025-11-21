import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../../models/product.model';
import { ApiService } from './api.service';
import { of } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(ProductService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getProductsByCategory', () => {
    it('should call ApiService.get with default params', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getProductsByCategory(1).subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('product/category/1', {
        page: 1,
        per_page: 30,
        q: ''
      });
    });

    it('should call ApiService.get with custom params', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getProductsByCategory(2, 3, 15, 'phone').subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('product/category/2', {
        page: 3,
        per_page: 15,
        q: 'phone'
      });
    });
  });

  describe('getProductById', () => {
    it('should get product by Id', () => {
      const mockProduct: Product = {
        id: 1,
        name: 'Laptop',
        description: 'High performance',
        price: '1500',
        stock: 10,
        image_url: null,
        category_id: 1,
        status: 'active',
        category: { id: 1, name: 'Electronics' },
        images: [{ url: null, alt: null}]
      };
  
      apiSpy.get.and.returnValue(of(mockProduct));
  
      service.getProductById(1).subscribe(product => {
        expect(product).toEqual(mockProduct);
      });
  
      expect(apiSpy.get).toHaveBeenCalledWith('product/1');
    });
  });

  describe('getProductsBySearch', () => {
    it('should call ApiService.get with correct query params', () => {
      apiSpy.get.and.returnValue(of({ data: [] }));
  
      service.getProductsBySearch('laptop', 2, 15).subscribe();
  
      expect(apiSpy.get).toHaveBeenCalledWith('product/search', {
        q: 'laptop',
        page: 2,
        per_page: 15
      });
    });
  });

  describe('addProduct', () => {
    it('should call ApiService.post with product data', () => {
      const newProduct = {
        name: 'Mouse',
        description: 'Wireless mouse',
        price: '25',
        stock: 50
      };
  
      const mockResponse: Product = {
        id: 2,
        name: 'Mouse',
        description: 'Wireless mouse',
        price: '25',
        stock: 50,
        image_url: null,
        category_id: 1,
        status: 'active',
        category: { id: 1, name: 'Accessories' },
        images: [{ url: null, alt: null}]
      };
  
      apiSpy.post.and.returnValue(of(mockResponse));
  
      service.addProduct(newProduct).subscribe(product => {
        expect(product).toEqual(mockResponse);
      });
  
      const call = apiSpy.post.calls.mostRecent();

      expect(call.args[0]).toBe('product');
      expect(call.args[2]).toBeTrue();

      const formData = call.args[1] as FormData;
      expect(formData.get('name')).toBe('Mouse');
      expect(formData.get('description')).toBe('Wireless mouse');
      expect(formData.get('price')).toBe('25');
      expect(formData.get('stock')).toBe('50');
    });
  });

  describe('updateProduct', () => {
    it('should call ApiService.put with updated data', () => {
      const updatedData = { name: 'Updated Laptop' };
      const mockResponse: Product = {
        id: 1,
        name: 'Updated Laptop',
        description: 'Updated description',
        price: '1600',
        stock: 8,
        image_url: null,
        category_id: 1,
        status: 'active',
        category: { id: 1, name: 'Electronics' },
        images: [{ url: null, alt: null}]
      };
  
      apiSpy.post.and.returnValue(of(mockResponse));
  
      service.updateProduct(1, updatedData).subscribe(product => {
        expect(product).toEqual(mockResponse);
      });
  
      const call = apiSpy.post.calls.mostRecent();

      expect(call.args[0]).toBe('product/1');
      expect(call.args[2]).toBeTrue();

      const formData = call.args[1] as FormData;
      expect(formData.get('name')).toBe('Updated Laptop');
      expect(formData.get('_method')).toBe('PUT');
    });
  });
});
