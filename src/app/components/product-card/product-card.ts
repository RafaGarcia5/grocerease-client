import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../models/product.model';
import { CartService } from '../../core/services/cart.service';
import { Auth } from '../../core/services/auth';
import { NavigationService } from '../../core/services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input() product!: Product;
  @Input() quantity: number = 0; 
  @Input() clickable: boolean = true;
  @Input() mode: 'catalog' | 'cart' = 'catalog';
  @Output() updateClick = new EventEmitter<void>();
  @Output() removeClick = new EventEmitter<void>();

  constructor(
    private cartService: CartService, 
    private authService: Auth,
    private navigation: NavigationService,
  ) {}

  get userRole(): boolean {
    return this.authService.isVendor();
  }

  get productImage(): string {
    return this.product.images && this.product.images.length > 0 && this.product.images[0].url
      ? this.product.images[0].url
      : 'assets/no-image.png';
  }


  onUpdateClick() {
    this.updateClick.emit();
  }

  addToCart() {
    this.cartService.addItem(this.product);
  }

  increase() {
    this.cartService.addItem(this.product);
  }

  decrease() {
    this.cartService.decreaseQuantity(this.product.id);
  }

  goToProduct() {
    this.navigation.goToProduct(this.product.id);
    console.log(this.product)
  }
}
