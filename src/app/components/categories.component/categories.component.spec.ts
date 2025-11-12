import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../models/category.model';
import { NavigationService } from '../../core/services/navigation.service';
import { of, throwError } from 'rxjs';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let mockCategoryService: jasmine.SpyObj<CategoryService>;
  let mockNavigation: jasmine.SpyObj<NavigationService>;
  
  const mockCategories: Category[] = [
    { id: 1, name: 'Tech' },
    { id: 2, name: 'Health' }
  ];

  beforeEach(async () => {
    mockCategoryService = jasmine.createSpyObj('CategoryService', ['getCategories']);
    mockNavigation = jasmine.createSpyObj('NavigationService', ['goToCategory']);

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: NavigationService, useValue: mockNavigation },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  describe('when initializing', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load categories on init', () => {
      mockCategoryService.getCategories.and.returnValue(of(mockCategories));
  
      component.ngOnInit();
  
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(component.categories).toEqual(mockCategories);
    });
 
    it('should handle error when loading categories', () => {
      const consoleSpy = spyOn(console, 'error');
      mockCategoryService.getCategories.and.returnValue(throwError(() => new Error('API error')));
  
      component.ngOnInit();
  
      expect(mockCategoryService.getCategories).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error loading categories', jasmine.any(Error));
      expect(component.categories).toEqual([]);
    });
  });

  describe('when selectCategory is called', () => {
    it('should navigate to category details', () => {
      const category: Category = { id: 5, name: 'Science' };
  
      component.selectCategory(category);
  
      expect(mockNavigation.goToCategory).toHaveBeenCalledWith(5);
    });
  });
});
