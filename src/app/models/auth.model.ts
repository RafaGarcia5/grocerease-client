export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    address: {
        addressLine1?: string;
        addressLine2?: string;
        zipCode?: string;
        colony?: string;
        city?: string;
        state?: string;
    };
    payment: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface LogoutResponse {
    message: string;
}
