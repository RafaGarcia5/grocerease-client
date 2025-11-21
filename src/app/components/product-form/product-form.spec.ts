import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductForm } from './product-form';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../core/services/category.service';
import { of, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ProductForm>>;

  const mockCategories = [
    { id: 1, name: 'Phones' },
    { id: 2, name: 'Computers' }
  ];

  beforeEach(async () => {
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategories']);
    mockCategoryService.getCategories.and.returnValue(of(mockCategories));
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [ProductForm, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { product: null } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('when loading categories', () => {
      it('should call CategoryService and set categories list', () => {
        expect(mockCategoryService.getCategories).toHaveBeenCalled();
        expect(component.categories).toEqual(mockCategories);
      });
    
      it('should handle errors gracefully if API fails', () => {
        const consoleSpy = spyOn(console, 'error');
        mockCategoryService.getCategories.and.returnValue(throwError(() => new Error('Network error')));
    
        fixture = TestBed.createComponent(ProductForm);
        component = fixture.componentInstance;
        fixture.detectChanges();
    
        expect(consoleSpy).toHaveBeenCalledWith('Error loading categories', jasmine.any(Error));
      });
    });
  });

  describe('form submission', () => {
    it('should close dialog with form data on save', () => {
      component.form.setValue({
        name: 'Test Product',
        description: 'A description',
        price: 200,
        stock: 5,
        // image_url: 'http://test.com/img.jpg',
        category_id: 1,
        status: 'active',
        image: null
      });
  
      component.onSave();
  
      expect(mockDialogRef.close).toHaveBeenCalledWith(component.form.value);
    });
  
    it('should not close dialog if form is invalid', () => {
      component.form.get('name')?.setValue('');
      component.onSave();
  
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  
    it('should close dialog without data on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });
});
