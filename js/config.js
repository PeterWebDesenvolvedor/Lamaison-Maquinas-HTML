// ============================================
// CONFIGURAÇÃO DO SISTEMA
// ============================================
const CONFIG = {
    // URL do Backend
    API_BASE_URL: 'http://localhost:8070/api',
    
    // Timeout para requisições (ms)
    TIMEOUT: 10000,
    
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

// ============================================
// FUNÇÕES DE UTILIDADE
// ============================================
const Utils = {
    // Log com timestamp
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌',
            'api': '📡'
        }[type] || '📌';
        console.log(`${prefix} [${timestamp}] ${message}`);
    },

    // Verificar se o backend está disponível
    async checkBackendHealth() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch {
            return false;
        }
    },

    // Salvar dados no localStorage
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            this.log(`Erro ao salvar ${key}: ${error.message}`, 'error');
            return false;
        }
    },

    // Carregar dados do localStorage
    loadData(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            this.log(`Erro ao carregar ${key}: ${error.message}`, 'error');
            return defaultValue;
        }
    }
};

// Expor config globalmente
window.CONFIG = CONFIG;
window.Utils = Utils;