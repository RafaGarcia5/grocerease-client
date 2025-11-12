import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { ApiService } from './api.service';
import { of } from 'rxjs';
import { Category } from '../../models/category.model';

describe('CategoryService', () => {
  let service: CategoryService;
  let apiSpy: jasmine.SpyObj<ApiService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put']);

    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(CategoryService);
    apiSpy = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  describe('when initializing', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Category operations', () => {
    describe('when getting categories', () => {
      it('should call api.get(category) and return all categories', () => {
        const mockCategories: Category[] = [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Books' }
        ];
    
        apiSpy.get.and.returnValue(of(mockCategories));
    
        service.getCategories().subscribe(categories => {
          expect(categories).toEqual(mockCategories);
        });
    
        expect(apiSpy.get).toHaveBeenCalledWith('category');
      });
    });

    describe('when creating category', () => {
      it('should call api.post(category) and return created category', () => {
        const newCategory = { name: 'Clothing' };
        const createdCategory: Category = { id: 3, name: 'Clothing' };
    
        apiSpy.post.and.returnValue(of(createdCategory));
    
        service.createCategory(newCategory).subscribe(response => {
          expect(response).toEqual(createdCategory);
        })
    
        expect(apiSpy.post).toHaveBeenCalledWith('category', newCategory);
      });
    });

    describe('when updating a category', () => {
      it('should call api.put(category/:id) and return updated category', () => {
        const updatedData = { name: 'Updated Electronics'};
        const updatedCategory: Category = { id: 1, name: 'Updated Electronics'};
    
        apiSpy.put.and.returnValue(of(updatedCategory));
    
        service.updateCategory(1, updatedData).subscribe(response => {
          expect(response).toEqual(updatedCategory);
        });
    
        expect(apiSpy.put).toHaveBeenCalledWith('category/1', updatedData);
      });
    });
  });
});
