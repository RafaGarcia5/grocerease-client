import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { OrderResponse } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';
import { ORDER_MESSAGES as orderMessages } from '../../core/constants/messages';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-orders-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatSortModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './orders-dashboard.html',
  styleUrl: './orders-dashboard.css'
})
export class OrdersDashboard implements OnInit{
  displayedColumns = ['#', 'customer', 'order', 'order_date', 'amount', 'status', 'actions'];
  columnsToDisplayWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: OrderResponse | null = null;
  loading = signal(false);

  orders: OrderResponse[] = [];
  totalItems = 0;
  pageIndex = 0;
  pageSize = 20;
  searchTerm = '';
  sortBy = 'order_date';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(
    private orderService: OrderService,
    private notification: NotificationService,
  ) {}

  isExpanded(element: OrderResponse) {
    return this.expandedElement === element;
  }

  toggle(element: OrderResponse) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders(page: number = 1) {
    this.loading.set(true);
    this.orderService.getOrdersBySearch(this.searchTerm, page, this.pageSize, this.sortBy, this.sortDir).subscribe({
      next: res => {
        this.orders = res.data;
        this.totalItems = res.total;
        this.pageIndex = res.current_page - 1;
        this.loading.set(false);
      },
      error: err => {
        this.notification.showError(orderMessages.error.loadFailed.title, orderMessages.error.loadFailed.message);
        this.loading.set(false);
      }
    });
  }

  onSearch() {
    this.loadOrders(1);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadOrders(this.pageIndex + 1);
  }

  changeStatus(order: OrderResponse, status: string) {
    this.orderService.updateOrder(order.id, { status }).subscribe({
      next: updated => {
        order.status = updated.status;
        this.notification.showInfo(orderMessages.info.statusChanged.title, orderMessages.info.statusChanged.message(status));
      },
      error: err => {
        this.notification.showError(orderMessages.error.updateFailed.title, orderMessages.error.updateFailed.message);
        console.error('Error updating status', err.error.message);
      }
    });
  }
}
