// ============================================
// DADOS E INICIALIZAÇÃO (LOCALSTORAGE)
// ============================================

import { CONFIG } from './config.js';

export const Data = {
    // --------------------------------------------
    // INICIALIZAR DADOS PADRÃO
    // --------------------------------------------
    init() {
        this.initUsers();
        this.initProducts();
        this.initTransactions();
        console.log('📦 Dados inicializados no localStorage');
    },

    // --------------------------------------------
    // USUÁRIOS PADRÃO
    // --------------------------------------------
    initUsers() {
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.USERS)) {
            const users = [
                { id: 1, name: 'Administrador', email: 'admin@maisonmaquinas.com', senha: 'admin123', role: 'ADMIN', tipo: 'V', ativo: true },
                { id: 2, name: 'João Silva', email: 'joao@maisonmaquinas.com', senha: 'vendedor123', role: 'USER', tipo: 'V', ativo: true },
                { id: 3, name: 'Maria Santos', email: 'maria@maisonmaquinas.com', senha: 'representante123', role: 'USER', tipo: 'R', ativo: true }
            ];
            localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    },

    // --------------------------------------------
    // PRODUTOS PADRÃO
    // --------------------------------------------
    initProducts() {
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS)) {
            const products = [
                { id: 1, nome: 'Escavadeira CAT 320D', categoria: 'Industrial', preco: 250000, descricao: 'Escavadeira em excelente estado, 2020', vendedorId: 2, vendedorNome: 'João Silva', ativo: true },
                { id: 2, nome: 'Compressor Atlas Copco', categoria: 'Pneumática', preco: 45000, descricao: 'Compressor industrial 50HP', vendedorId: 3, vendedorNome: 'Maria Santos', ativo: true },
                { id: 3, nome: 'Esteira Transportadora 20m', categoria: 'Logística', preco: 15000, descricao: 'Esteira com 20 metros, 500kg/h', vendedorId: 2, vendedorNome: 'João Silva', ativo: true }
            ];
            localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        }
    },

    // --------------------------------------------
    // TRANSAÇÕES PADRÃO
    // --------------------------------------------
    initTransactions() {
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS)) {
            const transactions = [
                { id: 1, produto: 'Escavadeira CAT 320D', valor: 250000, vendedor: 'João Silva', comprador: 'Construção Rápida', comissao: 12500, comissaoMachineBringer: 2500, comissaoBuyerBringer: 3750, comissaoSeller: 6250, status: 'ativo', data: new Date().toISOString() }
            ];
            localStorage.setItem(CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
        }
    },

    // --------------------------------------------
    // CRUD USUÁRIOS (LOCAL)
    // --------------------------------------------
    getUsers() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS) || '[]');
    },

    saveUsers(users) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    // --------------------------------------------
    // CRUD PRODUTOS (LOCAL)
    // --------------------------------------------
    getProducts() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS) || '[]');
    },

    saveProducts(products) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    // --------------------------------------------
    // CRUD TRANSAÇÕES (LOCAL)
    // --------------------------------------------
    getTransactions() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS) || '[]');
    },

    saveTransactions(transactions) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    // --------------------------------------------
    // CRUD VENDAS USUÁRIO (LOCAL)
    // --------------------------------------------
    getUserSales() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SALES) || '[]');
    },

    saveUserSales(sales) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_SALES, JSON.stringify(sales));
    },

    // --------------------------------------------
    // CRUD CAPTURAS USUÁRIO (LOCAL)
    // --------------------------------------------
    getUserCaptures() {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USER_CAPTURES) || '[]');
    },

    saveUserCaptures(captures) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_CAPTURES, JSON.stringify(captures));
    }
};