import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models/product.model';
import { CartApiService } from './cart-api.service';
import { NotificationService } from './notification.service';
import { CartItem } from '../../models/cart.model';
import { CART_MESSAGES as cartMessages } from '../constants/messages';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor(
    private cartApi: CartApiService,
    private notification: NotificationService,
  ) {
    this.loadCart();
  }

  loadCart() {
    this.cartApi.getCart().subscribe(cart => {
      this.cartItems = cart.items;
      this.cartSubject.next([...this.cartItems]);
    });
  }

  addItem(product: Product) {
    const existing = this.cartItems.find(item => item.product_id === product.id);
    if (existing) {
      this.cartApi.updateItem(existing.id, existing.quantity+1).subscribe({
        next: item => {
          existing.quantity = item.quantity;
          this.cartSubject.next([...this.cartItems]);
        },
        error: err => {
          this.notification.showOutOfStock(product.name);
        }
      });
    } else {
      this.cartApi.addItem({ product_id: product.id, quantity: 1}).subscribe(item => {
        this.cartItems.push(item);
        this.cartSubject.next([...this.cartItems]);
      });
    }
  }

  updateQuantity(itemId: number, quantity: number) {
    if(quantity <= 0){
      this.removeItemById(itemId);
      this.notification.showInfo(cartMessages.info.removed.title, cartMessages.info.removed.message);
      return;
    }

    this.cartApi.updateItem(itemId, quantity).subscribe(item => {
      const index = this.cartItems.findIndex(i => i.id === itemId);
      if(index > -1){
        this.cartItems[index].quantity = quantity;
        this.cartSubject.next([...this.cartItems]);
      }
    });
  }

  getQuantity(productId: number): number {
    const item = this.cartItems.find(p => p.product_id === productId);
    return item ? item.quantity : 0;
  }

  decreaseQuantity(productId: number) {
    const index = this.cartItems.findIndex(p => p.product_id === productId);
    if (index > -1) {
      const newQuantity = this.cartItems[index].quantity-1;
      this.updateQuantity(this.cartItems[index].id, newQuantity);
    }
  }

  removeItemById(itemId: number) {
    this.cartApi.removeItem(itemId).subscribe(() => {
      this.cartItems = this.cartItems.filter(item => item.id !== itemId);
      this.cartSubject.next([...this.cartItems]);
    })
  }

  removeItemByProduct(productId: number) {
    const index = this.cartItems.findIndex(p => p.product_id === productId);
    this.removeItemById(this.cartItems[index].id);
  }

  clearCart() {
    this.cartApi.clearCart().subscribe(() => {
      this.cartItems = [];
      this.cartSubject.next([]);
    });
  }
}
