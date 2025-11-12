import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderResponse } from '../../models/order.model';
import { OrderService } from '../../core/services/order.service';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { ORDER_MESSAGES as orderMessages } from '../../core/constants/messages';

@Component({
  selector: 'app-order-detail',
  imports: [
    DatePipe, 
    CommonModule, 
    MatCardModule, 
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class OrderDetail implements OnInit{
  order!: OrderResponse;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private notification: NotificationService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.orderService.getOrderById(id).subscribe(data => this.order = data);
  }

  cancelOrder() {
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (res) => {
        this.notification.showInfo(orderMessages.info.cancelled.title, orderMessages.info.cancelled.message);
        this.order.status = 'cancel';
      },
      error: (err) => {
        this.notification.showError(orderMessages.error.cancelFailed.title, orderMessages.error.cancelFailed.message);
        console.error(err.error.message);
      }
    });
  }
  
  updateOrder() {
    this.orderService.updateOrder(this.order.id, { status: 'delivered' }).subscribe({
      next: (res) => {
        this.notification.showSuccess(orderMessages.success.delivered.title, orderMessages.success.delivered.message);
        this.order = res;
      },
      error: (err) => {
        this.notification.showError(orderMessages.error.updateFailed.title, orderMessages.error.updateFailed.message);
        console.error(err.error.message);
      }
    });
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
