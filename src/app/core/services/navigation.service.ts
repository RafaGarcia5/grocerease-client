import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  constructor( private router: Router){}

  goToLogin(){
    return this.router.navigateByUrl(APP_ROUTES.auth.login);
  }

  goToRegister() {
    return this.router.navigateByUrl(APP_ROUTES.auth.register);
  }

  goToHome() {
    return this.router.navigateByUrl(APP_ROUTES.user.home);
  }

  goToProfile() {
    return this.router.navigateByUrl(APP_ROUTES.user.profile);
  }

  goToSearch(term: string){
    return this.router.navigate([APP_ROUTES.user.search], { queryParams: {term} });
  }

  goToCart(){
    return this.router.navigateByUrl(APP_ROUTES.user.cart);
  }

  goToOrders() {
    return this.router.navigateByUrl(APP_ROUTES.user.orders);
  }
  
  goToOrderDetail(id: number | string) {
    return this.router.navigateByUrl(APP_ROUTES.user.orderDetail(id));
  }

  goToCategory(id: number | string) {
    return this.router.navigateByUrl(APP_ROUTES.user.category(id));
  }

  goToProduct(id: number | string) {
    return this.router.navigateByUrl(APP_ROUTES.user.product(id));
  }

  goToSuccess(sessionId: string) {
    return this.router.navigateByUrl(APP_ROUTES.user.success(sessionId));
  }

  goToCancel() {
    return this.router.navigateByUrl(APP_ROUTES.user.cancel);
  }

  goToAdminProducts() {
    return this.router.navigateByUrl(APP_ROUTES.admin.products);
  }

  goToAdminOrders() {
    return this.router.navigateByUrl(APP_ROUTES.admin.orders);
  }

  goToAdminCategories() {
    return this.router.navigateByUrl(APP_ROUTES.admin.categories);
  }
}
