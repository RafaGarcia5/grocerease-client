import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoryList } from './category-list';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

describe('CategoryList', () => {
  let component: CategoryList;
  let fixture: ComponentFixture<CategoryList>;

  let categoryServiceMock: any;
  let matDialogMock: any;

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' }
  ];

  beforeEach(async () => {
    categoryServiceMock = {
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of(mockCategories))
    };

    matDialogMock = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(true)
      })
    };
    
    await TestBed.configureTestingModule({
      imports: [CategoryList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  
    it('should load categories on init', () => {
      expect(categoryServiceMock.getCategories).toHaveBeenCalled();
      expect(component.categories.length).toBe(2);
    });
  });

  describe('when loading categories', () => {
    it('should handle loadCategories error', () => {
      categoryServiceMock.getCategories.and.returnValue({
        subscribe: ({ next, error }: any) => error('Error loading categories')
      });
      spyOn(console, 'error');
      component.loadCategories();
      expect(console.error).toHaveBeenCalledWith('Error loading categories');
    });
  });

  describe('when opening add category dialog', () => {
    it('should open add category dialog and reload categories if result', () => {
      component.openAddDialog();
      expect(matDialogMock.open).toHaveBeenCalled();
      expect(categoryServiceMock.getCategories).toHaveBeenCalledTimes(2);
    });
  });

  describe('when opening edit category dialog', () => {
    it('should open edit category dialog and reload categories if result', () => {
      const category = mockCategories[0];
      component.openEditDialog(category);
      expect(matDialogMock.open).toHaveBeenCalledWith(jasmine.any(Function), {
        width: '90%',
        height: '30%',
        data: category
      });
      expect(categoryServiceMock.getCategories).toHaveBeenCalledTimes(2);
    });
  });
});
