import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProductCard } from "../../components/product-card/product-card";
import { MatDialog } from '@angular/material/dialog';
import { ProductForm } from '../../components/product-form/product-form';
import { NotificationService } from '../../core/services/notification.service';
import { PRODUCT_MESSAGES as productMessages } from '../../core/constants/messages';
import { NotFound } from '../not-found/not-found';

@Component({
  selector: 'app-search-results',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    ProductCard,
    NotFound
],
  templateUrl: './search-results.html',
  styleUrl: './search-results.css'
})
export class SearchResults implements OnInit {
  products: Product[] = [];
  quantities: { [productId: number]: number } = {};

  pageSize = 30;
  pageIndex = 0;
  totalItems = 0;
  term = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const term = (params['term'] || '').toLowerCase();
      this.loadProducts(term);
    });

    this.cartService.cart$.subscribe(cartItems => {
      this.quantities = {};
      cartItems.forEach(item => {
        this.quantities[item.product_id] = item.quantity;
      });
    });
  }

  loadProducts(term: string, page: number = 1) {
    this.productService.getProductsBySearch(term, page, this.pageSize).subscribe({
      next: res => {
        this.products = res.data;
        this.pageIndex = res.current_page - 1;
        this.totalItems = res.total;
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

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.term = this.route.snapshot.queryParams['term'];
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