import { Component, EventEmitter, Output, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../core/services/navigation.service';
import { User } from '../../models/auth.model';
import { Auth } from '../../core/services/auth';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';
import { AUTH_MESSAGES as authMessages } from '../../core/constants/messages';
import { APP_ROUTES } from '../../core/constants/app-routes';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    ReactiveFormsModule,
    RouterModule,
    MatBadgeModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  @Output() menuClick = new EventEmitter<void>();

  readonly routes = APP_ROUTES;

  onMenuClick() {
    this.menuClick.emit();
  }

  user: User | null = null; 
  isAuthenticated = false;
  searchControl = new FormControl('');
  totalItems = 0;

  constructor( 
    private authService: Auth, 
    private navigation: NavigationService, 
    private cartService: CartService ,
    private notification: NotificationService
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.isAuthenticated = !!user;
    });

    this.cartService.cart$.subscribe(items => {
      this.totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }

  onSearch() {
    const term = this.searchControl.value?.trim();
    if (term) {
      this.navigation.goToSearch(term);
    }
  }

  logout(){
    this.authService.logout().subscribe({
      next: (res) => {
        this.authService.clearSession();
        this.notification.showInfo(authMessages.success.logout.title, authMessages.success.logout.message);
        this.navigation.goToLogin();
      },
      error: (err) => {
        this.notification.showError(authMessages.error.logout.title, authMessages.error.logout.message(err?.message));
      }
    });
  }

  goToCart(){
    if(this.isAuthenticated){
      this.navigation.goToCart();
    }else{
      this.navigation.goToLogin();
    }
  }
}
