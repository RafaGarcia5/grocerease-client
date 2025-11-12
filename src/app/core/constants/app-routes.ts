export const APP_ROUTES = {
    auth: {
        register:   '/register',
        login:      '/login',
    },
    user: {
        home:       '/home',
        profile:    '/profile',
        search:     '/search',
        cart:       '/cart',
        orders:     '/orders',
        orderDetail:(id: number | string) => `/orders/${id}`,
        category:   (id: number | string) => `/category/${id}`,
        product:    (id: number | string) => `/product/${id}`,
        success:    (sessionId: string) => `/success/${sessionId}`,
        cancel:     '/cancel',
    },
    admin: {
        products:   '/admin/products',
        categories: '/admin/categories',
        orders:     '/admin/orders'
    }
};