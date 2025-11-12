import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '../../models/category.model';
import { CategoryService } from '../../core/services/category.service';
import { CategoryForm } from '../../components/category-form/category-form';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList implements OnInit {
  categories: Category[] = [];

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error(err)
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(CategoryForm, {
      width: '90%',
      height: '30%',
      data: null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }

  openEditDialog(category: Category): void {
    const dialogRef = this.dialog.open(CategoryForm, {
      width: '90%',
      height: '30%',
      data: category
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadCategories();
    });
  }
}
