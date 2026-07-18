// ============================================
// CONFIGURAÇÕES DO SISTEMA
// ============================================

export const CONFIG = {
    // URL do Backend
    API_BASE_URL: 'http://localhost:8070/api',
    
    // Timeout para requisições (ms)
    TIMEOUT: 15000,
    
    // Chaves do localStorage
    STORAGE_KEYS: {
        ACCESS_TOKEN: 'accessToken',
        REFRESH_TOKEN: 'refreshToken',
        USER: 'user',
        USERS: 'users',
        PRODUCTS: 'products',
        TRANSACTIONS: 'transactions',
        USER_SALES: 'user_sales',
        USER_CAPTURES: 'user_captures'
    }
};

export const API_BASE_URL = CONFIG.API_BASE_URL;