// Admin - Aprovações
let pendingSales = [];
let pendingCaptures = [];
let activeTab = 'sales';

function renderAdminAprovacoes(container) {
    container.innerHTML = `
        <div class="aprovacoes-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Aprovações Pendentes</h2>
                    <p>Revise os itens cadastrados pelos usuários</p>
                </div>
            </div>
            <div class="approval-tabs">
                <button class="approval-tab active" data-tab="sales" onclick="switchAprovacaoTab('sales')">
                    <span data-icon="Package"></span> Máquinas (<span id="salesCount">0</span>)
                </button>
                <button class="approval-tab" data-tab="captures" onclick="switchAprovacaoTab('captures')">
                    <span data-icon="Users"></span> Clientes (<span id="capturesCount">0</span>)
                </button>
            </div>
            <div id="aprovacoesContent">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;

    lucide.createIcons();
    loadAprovacoes();
}

async function loadAprovacoes() {
    try {
        const [salesRes, capturesRes] = await Promise.all([
            api.getVendasPendentes(),
            api.getCapturasPendentes()
        ]);

        pendingSales = salesRes.data || salesRes || [];
        pendingCaptures = capturesRes.data || capturesRes || [];

        document.getElementById('salesCount').textContent = pendingSales.length;
        document.getElementById('capturesCount').textContent = pendingCaptures.length;

        renderAprovacoesList();
    } catch (error) {
        // Fallback localStorage
        pendingSales = JSON.parse(localStorage.getItem('user_sales') || '[]').filter(s => s.status === 'pendente');
        pendingCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]').filter(c => c.status === 'pendente');

        document.getElementById('salesCount').textContent = pendingSales.length;
        document.getElementById('capturesCount').textContent = pendingCaptures.length;

        renderAprovacoesList();
    }
}

function renderAprovacoesList() {
    const content = document.getElementById('aprovacoesContent');
    
    const items = activeTab === 'sales' ? pendingSales : pendingCaptures;
    
    if (items.length === 0) {
        content.innerHTML = `
            <div class="empty-state">
                <span data-icon="CheckCircle"></span>
                <p>Nenhum item aguardando aprovação</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    content.innerHTML = items.map(item => `
        <div class="approval-card">
            <div class="approval-header">
                <h3>${activeTab === 'sales' ? item.nomeMaquina : item.nomeContato}</h3>
                <span class="user-name">Por: ${item.userName || 'Usuário'}</span>
            </div>
            <div class="approval-details">
                <div class="detail-grid">
                    ${activeTab === 'sales' ? `
                        <div><strong>Modelo:</strong> ${item.modelo || ''}</div>
                        <div><strong>Ano:</strong> ${item.anoFabricacao || ''}</div>
                        <div><strong>Preço:</strong> R$ ${(item.preco || 0).toLocaleString()}</div>
                        <div><strong>Empresa:</strong> ${item.nomeEmpresa || ''}</div>
                        <div><strong>Telefone:</strong> ${item.telefone || ''}</div>
                    ` : `
                        <div><strong>Empresa:</strong> ${item.nomeEmpresa || ''}</div>
                        <div><strong>Cidade/UF:</strong> ${item.cidade || ''}/${item.estado || ''}</div>
                        <div><strong>Telefone:</strong> ${item.telefone || ''}</div>
                        <div><strong>Email:</strong> ${item.email || 'Não informado'}</div>
                    `}
                </div>
                ${item.observacoes ? `
                    <div class="observations">
                        <strong>Observações:</strong>
                        <p>${item.observacoes}</p>
                    </div>
                ` : ''}
            </div>
            <div class="approval-actions">
                <button class="btn-approve" onclick="aprovarItem(${item.id}, '${activeTab}')">
                    <span data-icon="CheckCircle"></span> Aprovar
                </button>
                <button class="btn-reject" onclick="recusarItem(${item.id}, '${activeTab}')">
                    <span data-icon="XCircle"></span> Recusar
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function switchAprovacaoTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.approval-tab').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
    renderAprovacoesList();
}

async function aprovarItem(id, type) {
    try {
        if (type === 'sales') {
            await api.aprovarVenda(id);
            pendingSales = pendingSales.filter(s => s.id !== id);
        } else {
            await api.aprovarCaptura(id);
            pendingCaptures = pendingCaptures.filter(c => c.id !== id);
        }
        updateCounts();
        renderAprovacoesList();
        alert('Item aprovado com sucesso!');
    } catch (error) {
        // Fallback localStorage
        if (type === 'sales') {
            const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
            const updated = allSales.map(s => s.id === id ? { ...s, status: 'ativo' } : s);
            localStorage.setItem('user_sales', JSON.stringify(updated));
            pendingSales = pendingSales.filter(s => s.id !== id);
        } else {
            const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
            const updated = allCaptures.map(c => c.id === id ? { ...c, status: 'ativo' } : c);
            localStorage.setItem('user_captures', JSON.stringify(updated));
            pendingCaptures = pendingCaptures.filter(c => c.id !== id);
        }
        updateCounts();
        renderAprovacoesList();
        alert('Item aprovado com sucesso!');
    }
}

async function recusarItem(id, type) {
    if (!confirm('Tem certeza que deseja recusar este item?')) return;
    
    try {
        if (type === 'sales') {
            await api.recusarVenda(id);
            pendingSales = pendingSales.filter(s => s.id !== id);
        } else {
            await api.recusarCaptura(id);
            pendingCaptures = pendingCaptures.filter(c => c.id !== id);
        }
        updateCounts();
        renderAprovacoesList();
        alert('Item recusado!');
    } catch (error) {
        // Fallback localStorage
        if (type === 'sales') {
            const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
            const updated = allSales.map(s => s.id === id ? { ...s, status: 'recusado' } : s);
            localStorage.setItem('user_sales', JSON.stringify(updated));
            pendingSales = pendingSales.filter(s => s.id !== id);
        } else {
            const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
            const updated = allCaptures.map(c => c.id === id ? { ...c, status: 'recusado' } : c);
            localStorage.setItem('user_captures', JSON.stringify(updated));
            pendingCaptures = pendingCaptures.filter(c => c.id !== id);
        }
        updateCounts();
        renderAprovacoesList();
        alert('Item recusado!');
    }
}

function updateCounts() {
    document.getElementById('salesCount').textContent = pendingSales.length;
    document.getElementById('capturesCount').textContent = pendingCaptures.length;
}

window.switchAprovacaoTab = switchAprovacaoTab;
window.aprovarItem = aprovarItem;
window.recusarItem = recusarItem;