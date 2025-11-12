import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Dashboard } from './dashboard';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { of, throwError } from 'rxjs';
import { NavigationService } from '../../core/services/navigation.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let categoryServiceMock: any;
  let navigationMock: any;

  const mockCategories: Category[] = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Home' },
  ];

  beforeEach(async () => {
    categoryServiceMock = {
      getCategories: jasmine.createSpy('getCategories').and.returnValue(of(mockCategories))
    };

    navigationMock = jasmine.createSpyObj('NavigationService', ['goToCategory']);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        MessageService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: NavigationService, useValue: navigationMock },
        { provide: ActivatedRoute, useValue: { snapshot: { params: {}, queryParams: {}, data: {} } } },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
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

  describe('when selecting a category', () => {
    it('should navigate to category page when is selected', () => {
      const category = mockCategories[0];
      component.selectCartegory(category);
      expect(navigationMock.goToCategory).toHaveBeenCalledWith(category.id);
    });
  });

  describe('when loading categories fails', () => {
    it('should handle error while loading categories', () => {
      spyOn(console, 'error');
      categoryServiceMock.getCategories.and.returnValue(
        throwError(() => 'Failed to load')
      );
  
      component.ngOnInit();
  
      expect(console.error).toHaveBeenCalledWith('Error loading categories', 'Failed to load');
    });
  });
});
