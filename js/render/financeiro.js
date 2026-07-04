// ============================================
// RENDER FINANCEIRO
// ============================================

import { api } from '../api.js';
import { Data } from '../data.js';

export function renderFinanceiro(container) {
    container.innerHTML = `
        <div class="financeiro-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Financeiro</h2>
                    <p>Visão geral de transações e comissões</p>
                </div>
            </div>
            <div id="financeiroContent">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;
    loadFinanceiro();
}

export async function loadFinanceiro() {
    const content = document.getElementById('financeiroContent');
    
    try {
        const response = await api.getTransacoes();
        const transactions = response.data || response || [];
        renderFinanceiroContent(content, transactions);
    } catch (error) {
        const transactions = Data.getTransactions();
        renderFinanceiroContent(content, transactions);
    }
}

function renderFinanceiroContent(content, transactions) {
    const totalComissoes = transactions.reduce((sum, t) => sum + (t.comissao || 0), 0);
    const machineBringer = transactions.reduce((sum, t) => sum + (t.comissaoMachineBringer || 0), 0);
    const buyerBringer = transactions.reduce((sum, t) => sum + (t.comissaoBuyerBringer || 0), 0);
    const seller = transactions.reduce((sum, t) => sum + (t.comissaoSeller || 0), 0);

    content.innerHTML = `
        <div class="commission-stats">
            <div class="stat-card-total">
                <div class="stat-icon-total">💰</div>
                <div>
                    <h3>Total em Comissões</h3>
                    <p class="stat-value-total">R$ ${totalComissoes.toLocaleString()}</p>
                </div>
            </div>
            <div class="commission-breakdown">
                <h3>Distribuição de Comissões (5% do valor total)</h3>
                <div class="breakdown-grid">
                    <div class="breakdown-card" style="background: #a97421;">
                        <h4>Quem trouxe a máquina</h4>
                        <p class="percentage">20%</p>
                        <p class="amount">R$ ${machineBringer.toLocaleString()}</p>
                    </div>
                    <div class="breakdown-card" style="background: #C29C6B;">
                        <h4>Quem trouxe o comprador</h4>
                        <p class="percentage">30%</p>
                        <p class="amount">R$ ${buyerBringer.toLocaleString()}</p>
                    </div>
                    <div class="breakdown-card" style="background: #604A35;">
                        <h4>Quem vendeu</h4>
                        <p class="percentage">50%</p>
                        <p class="amount">R$ ${seller.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="transactions-section">
            <h3>Histórico de Transações</h3>
            ${transactions.length === 0 ? '<div class="empty-state"><p>Nenhuma transação registrada</p></div>' : 
            transactions.map(t => `
                <div class="transaction-card">
                    <div class="transaction-header">
                        <h5>${t.produto || ''}</h5>
                        <span class="transaction-value">R$ ${(t.valor || 0).toLocaleString()}</span>
                    </div>
                    <div class="transaction-details">
                        <div><strong>Vendedor:</strong> ${t.vendedor || ''}</div>
                        <div><strong>Comprador:</strong> ${t.comprador || ''}</div>
                        <div><strong>Data:</strong> ${t.data ? new Date(t.data).toLocaleDateString('pt-BR') : ''}</div>
                    </div>
                    <div class="transaction-commission">
                        <span>Comissão: R$ ${(t.comissao || 0).toLocaleString()}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}