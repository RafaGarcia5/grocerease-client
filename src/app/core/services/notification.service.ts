import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CART_MESSAGES as cartMessages } from '../constants/messages';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private messageService: MessageService) {}

  showSuccess(summary: string, detail: string) {
    this.messageService.add({ 
      severity: 'success', 
      summary, 
      detail 
    });
  }

  showError(summary: string, detail: string) {
    this.messageService.add({ 
      severity: 'error', 
      summary, 
      detail 
    });
  }

  showInfo(summary: string, detail: string){
    this.messageService.add({ 
      severity: 'info', 
      summary, 
      detail 
    });
  }

  showWarning(summary: string, detail: string){
    this.messageService.add({ 
      severity:'warn', 
      summary, 
      detail 
    });
  }

  showOutOfStock(productName: string){
    this.messageService.add({
      severity: 'warn',
      summary: cartMessages.error.outOfStock.title,
      detail: cartMessages.error.outOfStock.message(productName)
    });
  }
}
