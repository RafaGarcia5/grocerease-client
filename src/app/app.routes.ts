import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { RoleGuard } from './core/guards/role-guard';

export const routes: Routes = [

  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login)
  },

  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    
    children: [

      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // ADMIN AREA
      {
        path: 'admin',
        canActivate: [RoleGuard],
        data: { roles: ['vendor'] },
        children: [
          {
            path: 'products',
            loadComponent: () =>
              import('./pages/products/products').then(m => m.Products)
          },
          {
            path: 'categories',
            loadComponent: () =>
              import('./pages/category-list/category-list').then(m => m.CategoryList)
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./pages/orders-dashboard/orders-dashboard').then(m => m.OrdersDashboard)
          },
        ]
      },

      // PUBLIC / USER ROUTES
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home').then(m => m.Home)
      },
      {
        path: 'profile',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/profile/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search-results/search-results').then(m => m.SearchResults)
      },
      {
        path: 'category/:id',
        loadComponent: () =>
          import('./pages/products-by-category/products-by-category').then(m => m.ProductsByCategory)
      },
      {
        path: 'cart',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/cart/cart').then(m => m.Cart)
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-details/product-details').then(m => m.ProductDetails)
      },
      {
        path: 'orders',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/orders/orders').then(m => m.Orders)
      },
      {
        path: 'orders/:id',
        canActivate: [AuthGuard],
        loadComponent: () =>
          import('./pages/order-detail/order-detail').then(m => m.OrderDetail)
      },

    ]
  }

];
