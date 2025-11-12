import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../models/category.model';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-categories',
  imports: [MatCardModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  
  constructor(
    private categoryService: CategoryService, 
    private navigation: NavigationService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: data => this.categories = data,
      error: err => console.error('Error loading categories', err)
    });
  }

  selectCategory(category: Category){
    this.navigation.goToCategory(category.id);
  }
}