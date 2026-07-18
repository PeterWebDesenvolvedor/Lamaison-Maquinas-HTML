// ============================================
// RENDER DASHBOARD
// ============================================

import { api } from '../api.js';

export function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard fade-in">
            <div class="page-header">
                <div>
                    <h2>Dashboard</h2>
                    <p>Visão geral do sistema</p>
                </div>
            </div>
            <div class="stats-grid" id="statsGrid">
                <div class="loading-state">Carregando estatísticas...</div>
            </div>
        </div>
    `;
    loadDashboardStats();
}

async function loadDashboardStats() {
    const grid = document.getElementById('statsGrid');
    
    try {
        const [usuarios, produtos, transacoes] = await Promise.all([
            api.getUsuarios(),
            api.getProdutos(),
            api.getTransacoes()
        ]);

        const usersData = usuarios.data || usuarios || [];
        const productsData = produtos.data || produtos || [];
        const transactionsData = transacoes.data || transacoes || [];

        const totalRevenue = transactionsData.reduce((sum, t) => sum + (t.valor || 0), 0);
        const activeNegotiations = transactionsData.filter(t => t.status === 'ativo' || t.status === 'active').length;

        grid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="color: #a97421;">👥</div>
                <div class="stat-info">
                    <h3>Total Usuários</h3>
                    <p class="stat-value">${usersData.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #C29C6B;">📦</div>
                <div class="stat-info">
                    <h3>Total Produtos</h3>
                    <p class="stat-value">${productsData.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #604A35;">💰</div>
                <div class="stat-info">
                    <h3>Faturamento</h3>
                    <p class="stat-value">R$ ${totalRevenue.toLocaleString()}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #302F32;">📈</div>
                <div class="stat-info">
                    <h3>Negociações Ativas</h3>
                    <p class="stat-value">${activeNegotiations}</p>
                </div>
            </div>
        `;
    } catch (error) {
        // Fallback localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

        const totalRevenue = transactions.reduce((sum, t) => sum + (t.valor || 0), 0);
        const activeNegotiations = transactions.filter(t => t.status === 'ativo' || t.status === 'active').length;

        grid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon" style="color: #a97421;">👥</div>
                <div class="stat-info">
                    <h3>Total Usuários</h3>
                    <p class="stat-value">${users.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #C29C6B;">📦</div>
                <div class="stat-info">
                    <h3>Total Produtos</h3>
                    <p class="stat-value">${products.length}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #604A35;">💰</div>
                <div class="stat-info">
                    <h3>Faturamento</h3>
                    <p class="stat-value">R$ ${totalRevenue.toLocaleString()}</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="color: #302F32;">📈</div>
                <div class="stat-info">
                    <h3>Negociações Ativas</h3>
                    <p class="stat-value">${activeNegotiations}</p>
                </div>
            </div>
        `;
    }
}