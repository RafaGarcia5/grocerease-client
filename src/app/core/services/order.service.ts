import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { OrderPayload, OrderResponse } from '../../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  createOrder(payload: OrderPayload): Observable<OrderResponse> {
    return this.api.post<OrderResponse>('order', payload);
  }

  getOrders(page: number = 1, perPage: number = 30, status?: string, sortDir: string = 'desc') {
    return this.api.get<any>('order', { page, per_page: perPage, sort_dir: sortDir, status } );
  }

  getOrderById(id: number): Observable<OrderResponse> {
    return this.api.get<OrderResponse>(`order/${id}`);
  }

  getOrdersBySearch(term: string, page: number = 1, perPage: number = 10, sortBy: string = 'order_date', sortDir: string = 'desc') {
    return this.api.get<any>('order/search', { 
      q: term, 
      page, 
      per_page: perPage, 
      sort_by: sortBy, 
      sort_dir: sortDir 
    });
  }

  updateOrder(id: number, payload: Partial<OrderPayload>): Observable<OrderResponse> {
    return this.api.put<OrderResponse>(`order/${id}`, payload);
  }

  cancelOrder(id: number): Observable<any> {
    return this.api.put(`order/${id}`, { status: 'cancel' });
  }
}
