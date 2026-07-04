// ============================================
// RENDER NEGOCIAÇÕES
// ============================================

import { Data } from '../data.js';

export function renderNegociacoes(container) {
    const users = Data.getUsers();
    const products = Data.getProducts();
    
    const sellers = users
        .filter(u => u.ativo !== false && ['V', 'R', 'E'].includes(u.tipo))
        .map(user => ({
            name: user.name,
            type: user.tipo,
            activeProducts: products.filter(p => p.vendedorId === user.id).length
        }));

    container.innerHTML = `
        <div class="negociacoes-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Negociações</h2>
                    <p>Acompanhe as negociações ativas</p>
                </div>
            </div>
            <div class="negotiation-stats">
                <div class="stat-card">
                    <span style="font-size:32px;">👤</span>
                    <div>
                        <h3>Vendedores Ativos</h3>
                        <p class="stat-number">${sellers.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <span style="font-size:32px;">📦</span>
                    <div>
                        <h3>Produtos Anunciados</h3>
                        <p class="stat-number">${products.filter(p => p.ativo !== false).length}</p>
                    </div>
                </div>
            </div>
            <div class="sellers-section">
                <h3>Vendedores Ativos</h3>
                <div class="sellers-grid">
                    ${sellers.map(seller => `
                        <div class="seller-card">
                            <h4>${seller.name}</h4>
                            <span class="seller-type">${seller.type}</span>
                            <div class="seller-stats">
                                <div><span class="label">Produtos:</span> ${seller.activeProducts}</div>
                            </div>
                            <div class="seller-status active">🟢 Ativo</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}