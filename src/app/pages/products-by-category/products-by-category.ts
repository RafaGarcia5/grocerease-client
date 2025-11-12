import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductCard } from "../../components/product-card/product-card";
import { MatDialog } from '@angular/material/dialog';
import { ProductForm } from '../../components/product-form/product-form';
import { NotificationService } from '../../core/services/notification.service';
import { PRODUCT_MESSAGES as productMessages } from '../../core/constants/messages';
import { NotFound } from '../not-found/not-found';
import { NavigationService } from '../../core/services/navigation.service';

@Component({
  selector: 'app-products-by-category',
  imports: [
    CommonModule,
    MatCardModule,
    MatPaginatorModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    ProductCard,
    MatPaginatorModule,
    NotFound
],
  templateUrl: './products-by-category.html',
  styleUrl: './products-by-category.css'
})
export class ProductsByCategory implements OnInit{
  categoryId!: number;
  categoryName!: string;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  quantities: { [productId: number]: number } = {};
  
  searchProduct = new FormControl('');

  // paginación
  pageSize = 30;
  pageIndex = 0;
  totalItems = 0;
  term = '';
  
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private navigation: NavigationService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.categoryId = +params['id'];
      this.loadProducts(this.term);
    });


    this.cartService.cart$.subscribe(cartItems => {
      this.quantities = {};
      cartItems.forEach(item => {
        this.quantities[item.product_id] = item.quantity;
      });
    });
  }

  loadProducts(term: string ,page: number = 1) {
    this.productService.getProductsByCategory(this.categoryId, page, this.pageSize, term).subscribe({
      next: res => {
        this.products = res.data;
        this.pageIndex = res.current_page - 1;
        this.totalItems = res.total;
        this.filteredProducts = res.data;
        if (res.data.length > 0) {
          this.categoryName = res.data[0].category.name;
        }
        this.syncQuantities();
      },
      error: err => console.error('Error loading products', err)
    });
  }

  syncQuantities() {
    this.products.forEach(p => {
      this.quantities[p.id] = this.cartService.getQuantity(p.id);
    });
  }

  searchProducts() {
    const term = (this.searchProduct.value || '').toLowerCase();
    this.loadProducts(term);
  }

  get paginatedProducts() {
    const start = this.pageIndex * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.term = (this.searchProduct.value || '').toLowerCase();
    this.loadProducts(this.term, this.pageIndex + 1);
  }

  addToCart(product: Product) {
    this.cartService.addItem(product);
  }

  increase(product: Product) {
    this.cartService.addItem(product);
  }

  decrease(product: Product) {
    this.cartService.decreaseQuantity(product.id);
  }

  goToProduct(id: number){
    this.navigation.goToProduct(id);
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
            this.loadProducts(this.term, this.pageIndex + 1);
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
