import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryForm } from './category-form';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('CategoryForm', () => {
  let component: CategoryForm;
  let fixture: ComponentFixture<CategoryForm>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockNotification: jasmine.SpyObj<NotificationService>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<CategoryForm>>;

  const mockCategory = { id: 1, name: 'Electronics' };

  beforeEach(async () => {
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['createCategory', 'updateCategory']);
    mockNotification = jasmine.createSpyObj('NotificationService', ['showSuccess', 'showError', 'showInfo']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CategoryForm, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: NotificationService, useValue: mockNotification },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should initialize with empty form when creating', () => {
      expect(component.isEdit).toBeFalse();
      expect(component.form.get('name')?.value).toBe('');
    });
  
    it('should disable save button if form is invalid', () => {
      component.form.setValue({ name: '' });
      expect(component.form.invalid).toBeTrue();
    });
  });

  describe('when adding a new category', () => {
    it('should call createCategory and close dialog on success', () => {
      component.form.setValue({ name: 'Books' });
      mockCategoryService.createCategory.and.returnValue(of({ id: 2, name: 'Books' }));
  
      component.save();
  
      expect(mockCategoryService.createCategory).toHaveBeenCalledWith({ name: 'Books' });
      expect(mockNotification.showSuccess).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });
  
    it('should handle createCategory error properly', () => {
      component.form.setValue({ name: 'Games' });
      mockCategoryService.createCategory.and.returnValue(throwError(() => ({ error: { message: 'Error!' } })));
  
      component.save();
  
      expect(mockNotification.showError).toHaveBeenCalled();
    });
  });

  describe('when editing an existing category', () => {
    beforeEach(() => {
      component.isEdit = true;
      component.data = mockCategory;
    });
    
    it('should call updateCategory and close dialog on success', () => {
      component.isEdit = true;
      component.data = mockCategory;
      component.form.setValue({ name: 'Updated Electronics' });
      mockCategoryService.updateCategory.and.returnValue(of({ id: 1, name: 'Updated Electronics' }));
  
      component.save();
  
      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith(1, { name: 'Updated Electronics' });
      expect(mockNotification.showInfo).toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle updateCategory error properly', () => {
      component.isEdit = true;
      component.data = mockCategory;
      component.form.setValue({ name: 'Error Category' });
      mockCategoryService.updateCategory.and.returnValue(throwError(() => ({ error: { message: 'Error!' } })));
  
      component.save();
  
      expect(mockNotification.showError).toHaveBeenCalled();
    });
  });

  describe('when closing the dialog', () => {
    it('should close dialog when close() is called', () => {
      component.close();
      expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});
