import { Component, OnInit } from '@angular/core';
import { OrderResponse } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NavigationService } from '../../core/services/navigation.service';
import { APP_ROUTES } from '../../core/constants/app-routes';

@Component({
  selector: 'app-orders',
  imports: [
    DatePipe, 
    MatCardModule, 
    MatIconModule, 
    MatButtonModule,
    CommonModule, 
    RouterModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  readonly routes = APP_ROUTES;
  orders: OrderResponse[] = [];

  pageSize = 30;
  pageIndex = 0;
  totalItems = 0;
  
  statuses: string[] = ['pending', 'send', 'delivered', 'cancel'];
  selectedStatus: string = '';
  sortDir: string = 'desc';

  constructor(
    private orderService: OrderService, 
    private navigation: NavigationService
  ) {}

  ngOnInit() {
    this.loadOrders();
  }
  
  loadOrders(page: number = 1) {
    this.orderService.getOrders(page, this.pageSize, this.selectedStatus, this.sortDir).subscribe({
      next: res => {
        this.orders = res.data;
        this.pageIndex = res.current_page - 1;
        this.totalItems = res.total; 
      }
    });
  }

  onFilterChange() {
    this.pageIndex = 0;
    this.loadOrders(1);
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc';
    this.onFilterChange();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrders(this.pageIndex + 1);
  }

  goToOrder(id: number) {
    this.navigation.goToOrderDetail(id);
  }

  get hasItems(): boolean{
    return this.orders.length !== 0;
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'hourglass_empty';
      case 'send': return 'local_shipping';
      case 'delivered': return 'check_circle';
      case 'cancel': return 'cancel';
      default: return 'help_outline';
    }
  }
}
