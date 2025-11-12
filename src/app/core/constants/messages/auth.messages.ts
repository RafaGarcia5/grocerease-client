export const AUTH_MESSAGES = {
    success: {
        login: {
            title: 'Login success',
            message: (userName: string) => `Welcome again, ${userName}`
        },
        logout: {
            title: 'Session closed',
            message: 'You have successfully logout'
        },
        register: {
            title: 'Successful registration',
            message: (userName: string) => `Welcome, ${userName}`   
        }
    },
    error: {
        logout: {
            title: 'Logout error',
            message: (detail?: string) => detail || 'Try again later'
        },
        invalidCredentials: {
            title: 'Invalid credentials',
            message: 'The email or password is incorrect'
        },
        register: {
            title: 'Error registering',
            message: (detail?: string) => detail || 'Try again'
        }
    }
};