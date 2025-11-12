import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot } from "@angular/router";
import { NavigationService } from "../services/navigation.service";
import { Auth } from "../services/auth";

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private navigation: NavigationService, 
    private authService: Auth
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const user = this.authService.currentUser;
    if (!user) {
      this.navigation.goToLogin();
      return false;
    }

    const expectedRoles = route.data['roles'] as string[];

    if (expectedRoles && !expectedRoles.includes(user.role)) {
      this.navigation.goToHome();
      return false;
    }

    return true;
  }
}