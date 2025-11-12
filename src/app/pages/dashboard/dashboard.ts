import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../components/header/header';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-dashboard',
  imports: [Header, RouterOutlet, MatSidenavModule, MatListModule, CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
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

  selectCartegory(category: Category){
    this.navigation.goToCategory(category.id);
  }
}
