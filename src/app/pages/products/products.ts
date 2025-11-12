import { Component, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductCard } from '../../components/product-card/product-card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProductForm } from '../../components/product-form/product-form';
import { NotificationService } from '../../core/services/notification.service';
import { PRODUCT_MESSAGES as productMessages } from '../../core/constants/messages';

@Component({
  selector: 'app-products',
  imports: [
    ProductCard, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIcon,
    MatPaginatorModule
  ],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategory: number | null = null;

  selectedProduct: Product | null = null;

  pageSize = 30;
  pageIndex = 0;
  totalItems = 0;

  constructor( 
    private productService: ProductService, 
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  loadProducts(page: number = 1) {
    if (this.selectedCategory) {
      this.productService.getProductsByCategory(this.selectedCategory, page, this.pageSize).subscribe({
        next: p => {
          this.products = p.data;
          this.pageIndex = p.current_page - 1;
          this.totalItems = p.total;
        }
      });
    } else {
      this.productService.getProductsBySearch('', page, this.pageSize).subscribe({
        next: p => {
          this.products = p.data;
          this.pageIndex = p.current_page - 1;
          this.totalItems = p.total;
        }
      });
    }
  }

  filterByCategory() {
    this.loadProducts();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts(this.pageIndex + 1);
  }

  addNewProduct() {
    const dialogRef = this.dialog.open(ProductForm, {
      width: '90%',
      height: '80%',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.addProduct(result).subscribe({
          next: () => {
            this.notification.showSuccess(productMessages.success.added.title, productMessages.success.added.message);
            this.loadProducts();
          },
          error: (err) => {
            this.notification.showError(productMessages.error.addFailed.title, productMessages.error.addFailed.message);
            console.error(err.error.message);
          }
        });
      }
    });
  }

  editProduct(product: Product) {
    const dialogRef = this.dialog.open(ProductForm, {
      width: '90%',
      height: '80%',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.updateProduct(product.id, result).subscribe({
          next: () => {
            this.notification.showInfo(productMessages.success.updated.title, productMessages.success.updated.message);
            this.loadProducts();
          },
          error: (err) => {
            this.notification.showError(productMessages.error.updatedFailed.title, productMessages.error.updatedFailed.message);
            console.error(err.error.message);
          }
        });
      }
    });
  }
}
