import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatStepper } from '@angular/material/stepper';
import { CartItem } from '../../models/cart.model';
import { User } from '../../models/auth.model';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-cart-confirmation',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIcon
],
  templateUrl: './cart-confirmation.html',
  styleUrl: './cart-confirmation.css'
})
export class CartConfirmation {
  @Input() user: User | null = null;
  @Input() items: CartItem[] = [];
  @Input() total = 0;
  @Input() stepper!: MatStepper;
  @Input() confirmOrder!: (stepper: MatStepper) => void;

  subtotal(price: string, quantity: number){

    return parseFloat(price) * quantity;
  }
}
