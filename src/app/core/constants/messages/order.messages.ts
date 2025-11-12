export const ORDER_MESSAGES = {
    success: {
        delivered: {
            title: 'Order delivered!',
            message: 'Thanks for shopping with us'
        }
    },
    info: {
        cancelled: {
            title: 'Order cancelled',
            message: 'The order has been cancelled'
        },
        statusChanged: {
            title: 'The status has been changed',
            message: (status: string) => `The order status has been changed to: ${status}`
        }
    },
    error: {
        cancelFailed: {
            title: 'Operation failed',
            message: 'The order couldn\'t be cancelled. Try again later'
        },
        updateFailed: {
            title: 'Something went wrong',
            message: 'Try again later'
        },
        loadFailed: {
            title: 'Something went wrong',
            message: 'Error loading orders'
        }
    }
};