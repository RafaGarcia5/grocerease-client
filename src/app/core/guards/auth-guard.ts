import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private navigation: NavigationService) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.navigation.goToLogin();
      return false;
    }
    return true;
  }
}
