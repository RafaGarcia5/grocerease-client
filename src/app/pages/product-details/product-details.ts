import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Auth } from '../../core/services/auth';
import { ProductForm } from '../../components/product-form/product-form';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../core/services/notification.service';
import { PRODUCT_MESSAGES as productMessages } from '../../core/constants/messages';

@Component({
  selector: 'app-product-details',
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule
  ],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css'
})
export class ProductDetails implements OnInit{
  product: Product | null = null;
  inCart = false;
  quantity: number = 0;

  constructor(
    private route : ActivatedRoute,
    private productService : ProductService,
    private cartService : CartService,
    private authService : Auth,
    private dialog : MatDialog,
    private notification: NotificationService
  ){}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if(id){
      this.productService.getProductById(id).subscribe( product => {
        this.product = product;
        this.cartService.cart$.subscribe(items => {
          const found = items.find(item => item.product_id === product.id);
          this.inCart = !!found;
          this.quantity = found ? found.quantity : 0;
        });
      });
    }
  }

  increase() {
    if (!this.product) return;
    this.cartService.addItem(this.product);
  }

  decrease() {
    if (!this.product) return;
    this.cartService.decreaseQuantity(this.product.id);
  }

  addToCart() {
    if (!this.product) return;
    this.cartService.addItem(this.product);
  }

  remove() {
    if (!this.product) return;
    this.cartService.removeItemByProduct(this.product.id);
  }

  get userRole(): boolean {
    return this.authService.isVendor();
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
            this.ngOnInit();
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