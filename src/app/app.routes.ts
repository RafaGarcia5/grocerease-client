import { Routes } from '@angular/router';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { ProfileComponent } from './pages/profile/profile';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { ProductsByCategory } from './pages/products-by-category/products-by-category';
import { Cart } from './pages/cart/cart';
import { ProductDetails } from './pages/product-details/product-details';
import { OrderDetail } from './pages/order-detail/order-detail';
import { Orders } from './pages/orders/orders';
import { SearchResults } from './pages/search-results/search-results';
import { Products } from './pages/products/products';
import { CategoryList } from './pages/category-list/category-list';
import { OrdersDashboard } from './pages/orders-dashboard/orders-dashboard';
import { AuthGuard } from './core/guards/auth-guard';
import { RoleGuard } from './core/guards/role-guard';

export const routes: Routes = [

    { path: 'register',     component: Register },
    { path: 'login',        component: Login },
    
    { 
        path : '',   
        component: Dashboard,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { 
                path: 'admin',  
                canActivate: [RoleGuard],
                data: { roles: ['vendor'] },       
                children: [
                    { path: 'products', component: Products },
                    { path: 'categories',component: CategoryList },
                    { path: 'orders',   component: OrdersDashboard },
                ] 
            },
            { path: 'home',         component: Home },
            { path: 'profile',      component: ProfileComponent, canActivate: [AuthGuard] },
            { path: 'search',       component: SearchResults },
            { path: 'category/:id', component: ProductsByCategory },
            { path: 'cart',         component: Cart, canActivate: [AuthGuard] },
            { path: 'product/:id',  component: ProductDetails },
            { path: 'orders',       component: Orders, canActivate: [AuthGuard] },
            { path: 'orders/:id',   component: OrderDetail, canActivate: [AuthGuard] },
        ]
    },
];
