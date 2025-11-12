import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CartItem, CartItemPayload } from '../../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartApiService {
  constructor(private api:ApiService) {}
  
  getCart(): Observable<{ items: CartItem[]}> {
    return this.api.get<{ items: CartItem[]}>('cart');
  }

  addItem(item: CartItemPayload): Observable<CartItem> {
    return this.api.post<CartItem>('cart/add', item);
  }

  updateItem(id: number, quantity: number): Observable<CartItem>{
    return this.api.put<CartItem>(`cart/item/${id}`, {quantity});
  }

  removeItem(id: number): Observable<any> {
    return this.api.delete(`cart/item/${id}`);
  }

  clearCart(): Observable<any> {
    return this.api.delete('cart/clear');
  }

  checkout(): Observable<any> {
    return this.api.post('order/checkout', {});
  }

  confirmPayment(session_id: string): Observable<any>{
    return this.api.post('cart/confirmPayment', { session_id })
  }
}
