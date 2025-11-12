import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartItem } from '../../models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { CartApiService } from '../../core/services/cart-api.service';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { CART_MESSAGES as cartMessages } from '../../core/constants/messages';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../core/services/navigation.service';
import { CommonModule } from '@angular/common';
import { Auth } from '../../core/services/auth';
import { CartConfirmation } from "../../components/cart-confirmation/cart-confirmation";
import { User } from '../../models/auth.model';
import { ProductCard } from "../../components/product-card/product-card";

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    RouterModule,
    CommonModule,
    CartConfirmation,
    ProductCard
],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit, OnDestroy{
  items: CartItem[] = [];
  private subscription!: Subscription;
  user: User | null = null;

  constructor(
    private cartService: CartService, 
    private cartApiService: CartApiService, 
    private navigation: NavigationService,
    private notification: NotificationService,
    private authService: Auth
  ) {}
  
  ngOnInit(): void {
    this.subscription = this.cartService.cart$.subscribe(data => { 
      this.items = data; 
    });
    this.user = this.authService.currentUser;
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }

  remove(itemId: number) {
    this.cartService.removeItemById(itemId);
  }

  increaseQuantity(productId:number ,index: number) {
    this.cartService.updateQuantity(productId, this.items[index].quantity + 1);
  }

  decreaseQuantity(productId:number, index: number) {
    this.cartService.updateQuantity(productId, this.items[index].quantity - 1);
  }

  get total() {
    return this.items.reduce((sum, item) =>
      sum + parseFloat(item.product.price) * item.quantity, 0);
  }

  resetCart(stepper: MatStepper) {
    stepper.reset();
    this.navigation.goToOrders();
  }

  goToProduct(id: number){
    this.navigation.goToProduct(id);
  }

  goToHome(){
    this.navigation.goToHome();
  }

  confirmOrder(stepper: MatStepper ) {
    if (!this.authService.isAuthenticated) {
      this.notification.showWarning(cartMessages.warning.loginRequired.title, cartMessages.warning.loginRequired.message);
      return;
    }

    this.cartApiService.checkout().subscribe({
      next: res => {
        window.open(res.checkout_url, '_blank');
        const session_id = res.session_id;
        const interval = setInterval(() => {
          this.cartApiService.confirmPayment(session_id).subscribe({
            next: payment => {
              if(payment.status === 'success') {
                clearInterval(interval);
                this.notification.showSuccess(cartMessages.success.paymentConfirmed.title, cartMessages.success.paymentConfirmed.message);
                this.cartService.clearCart();
                stepper.next()
              } else if(payment.status === 'unpaid') {
                console.log('Waiting for payment...');
              }
            },
            error: err => console.error(err)
          });
        }, 3000);

      },
      error: err => {
        this.notification.showError(cartMessages.error.checkout.title, cartMessages.error.checkout.message);
      }
    });
  }
  
  get hasItems(): boolean {
    return this.items && this.items.length > 0;
  }
}