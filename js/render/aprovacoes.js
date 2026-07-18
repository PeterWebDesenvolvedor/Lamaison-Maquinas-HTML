// ============================================
// RENDER APROVAÇÕES
// ============================================

import { Data } from '../data.js';

export function renderAprovacoes(container) {
    const pendingSales = Data.getUserSales().filter(s => s.status === 'pendente');
    
    container.innerHTML = `
        <div class="aprovacoes-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Aprovações Pendentes</h2>
                    <p>Revise os itens cadastrados pelos usuários</p>
                </div>
            </div>
            ${pendingSales.length === 0 ? 
                '<div class="empty-state"><p>✅ Nenhum item aguardando aprovação</p></div>' :
                pendingSales.map(item => `
                    <div class="approval-card">
                        <div class="approval-header">
                            <h3>${item.nomeMaquina || ''}</h3>
                            <span class="user-name">Por: ${item.userName || 'Usuário'}</span>
                        </div>
                        <div class="approval-details">
                            <div class="detail-grid">
                                <div><strong>Modelo:</strong> ${item.modelo || ''}</div>
                                <div><strong>Ano:</strong> ${item.anoFabricacao || ''}</div>
                                <div><strong>Preço:</strong> R$ ${(item.preco || 0).toLocaleString()}</div>
                            </div>
                        </div>
                        <div class="approval-actions">
                            <button class="btn-approve" onclick="window.aprovarItem(${item.id})">✅ Aprovar</button>
                            <button class="btn-reject" onclick="window.recusarItem(${item.id})">❌ Recusar</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

// Funções globais para aprovar/recusar
window.aprovarItem = function(id) {
    const sales = Data.getUserSales();
    const updated = sales.map(s => s.id === id ? { ...s, status: 'ativo' } : s);
    Data.saveUserSales(updated);
    alert('✅ Item aprovado com sucesso!');
    location.reload();
};

window.recusarItem = function(id) {
    if (!confirm('Tem certeza que deseja recusar este item?')) return;
    const sales = Data.getUserSales();
    const updated = sales.map(s => s.id === id ? { ...s, status: 'recusado' } : s);
    Data.saveUserSales(updated);
    alert('❌ Item recusado!');
    location.reload();
};