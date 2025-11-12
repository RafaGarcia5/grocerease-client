export const CART_MESSAGES = {
    info: {
        removed: {
            title: 'Product removed',
            message: 'The product is no longer in the cart'
        }
    },
    warning: {
        loginRequired: {
            title: 'Login required',
            message: 'Please sign in to confirm your order'
        }
    },
    success: {
        paymentConfirmed: {
            title: 'Payment confirmed!',
            message: 'Your order has been created'
        }
    },
    error: {
        checkout: {
            title: 'Something went wrong',
            message: 'Error creating order. Please try again'
        },
        outOfStock: {
            title: 'Out of stock',
            message: (productName: string) => `The requested quantity of ${productName} exceeds the product's stock`
        }
    }
};