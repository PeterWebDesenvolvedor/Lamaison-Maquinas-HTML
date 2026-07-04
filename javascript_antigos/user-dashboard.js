// User Dashboard
let userSales = [];
let userCaptures = [];
let userProducts = [];

function renderUserDashboard(container) {
    container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <h2>Olá, ${Auth.getUser()?.name || 'Usuário'}!</h2>
                <p>Bem-vindo ao sistema Lamaison Máquinas</p>
            </div>
            <div class="action-cards">
                <div class="action-card sell-card" onclick="showSellerModal()">
                    <span data-icon="Package"></span>
                    <h3>Quero Vender</h3>
                    <p>Anuncie sua máquina</p>
                </div>
                <div class="action-card capture-card" onclick="showBuyerModal()">
                    <span data-icon="Users"></span>
                    <h3>Tenho um Comprador</h3>
                    <p>Indique um cliente</p>
                </div>
                <div class="action-card catalog-card" onclick="loadUserProdutos()">
                    <span data-icon="Eye"></span>
                    <h3>Ver Catálogo</h3>
                    <p>Consulte máquinas</p>
                </div>
            </div>
            <div class="my-activities">
                <div class="tabs">
                    <button class="tab-btn active" data-tab="sales" onclick="switchUserTab('sales')">
                        <span data-icon="Package"></span> Minhas Vendas
                    </button>
                    <button class="tab-btn" data-tab="captures" onclick="switchUserTab('captures')">
                        <span data-icon="Users"></span> Meus Clientes
                    </button>
                </div>
                <div class="activities-list" id="userActivities">
                    <div class="loading-state">Carregando...</div>
                </div>
            </div>
        </div>
    `;

    lucide.createIcons();
    loadUserData();
}

async function loadUserData() {
    const user = Auth.getUser();
    if (!user) return;

    try {
        const [salesRes, capturesRes, productsRes] = await Promise.all([
            api.getVendasPorUsuario(user.id),
            api.getCapturasPorUsuario(user.id),
            api.getProdutos()
        ]);

        userSales = salesRes.data || salesRes || [];
        userCaptures = capturesRes.data || capturesRes || [];
        userProducts = productsRes.data || productsRes || [];

        renderUserActivities('sales');
    } catch (error) {
        // Fallback localStorage
        const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
        userSales = allSales.filter(s => s.userId === user.id);
        
        const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
        userCaptures = allCaptures.filter(c => c.userId === user.id);
        
        userProducts = JSON.parse(localStorage.getItem('products') || '[]');

        renderUserActivities('sales');
    }
}

let userActiveTab = 'sales';

function renderUserActivities(tab) {
    userActiveTab = tab;
    const container = document.getElementById('userActivities');
    
    const items = tab === 'sales' ? userSales : userCaptures;
    const title = tab === 'sales' ? 'Máquinas Anunciadas' : 'Clientes Captados';
    const icon = tab === 'sales' ? 'Package' : 'Users';

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span data-icon="${icon}"></span>
                <p>Nenhum item encontrado</p>
                <button class="btn-empty" onclick="${tab === 'sales' ? 'showSellerModal()' : 'showBuyerModal()'}">
                    ${tab === 'sales' ? 'Anunciar Máquina' : 'Cadastrar Cliente'}
                </button>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="activity-card">
            <div class="activity-header">
                <h4>${tab === 'sales' ? item.nomeMaquina : item.nomeContato}</h4>
                <span class="status-badge status-${item.status || 'pendente'}">
                    ${item.status === 'pendente' ? 'Aguardando' : 
                      item.status === 'ativo' ? 'Aprovado' : 
                      item.status === 'recusado' ? 'Recusado' : 'Pendente'}
                </span>
            </div>
            <div class="activity-details">
                ${tab === 'sales' ? `
                    <div><span class="label">Modelo:</span> ${item.modelo || ''}</div>
                    <div><span class="label">Ano:</span> ${item.anoFabricacao || ''}</div>
                    <div><span class="label">Preço:</span> <span class="price">R$ ${(item.preco || 0).toLocaleString()}</span></div>
                ` : `
                    <div><span class="label">Empresa:</span> ${item.nomeEmpresa || ''}</div>
                    <div><span class="label">Localização:</span> ${item.cidade || ''}/${item.estado || ''}</div>
                    <div><span class="label">Telefone:</span> ${item.telefone || ''}</div>
                `}
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function switchUserTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(el => {
        el.classList.toggle('active', el.dataset.tab === tab);
    });
    renderUserActivities(tab);
}

// Seller Modal
function showSellerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'sellerModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Anunciar Máquina para Venda</h3>
                <button class="modal-close" onclick="closeSellerModal()">×</button>
            </div>
            <form class="modal-form" id="sellerForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome da Máquina *</label>
                        <input type="text" id="sellerNomeMaquina" required />
                    </div>
                    <div class="form-group">
                        <label>País de Origem *</label>
                        <input type="text" id="sellerPais" required />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Modelo *</label>
                        <input type="text" id="sellerModelo" required />
                    </div>
                    <div class="form-group">
                        <label>Ano de Fabricação *</label>
                        <input type="number" id="sellerAno" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Preço de Venda (R$) *</label>
                    <input type="number" step="0.01" id="sellerPreco" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome da Empresa *</label>
                        <input type="text" id="sellerEmpresa" required />
                    </div>
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="sellerTelefone" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="sellerObservacoes" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeSellerModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">Anunciar Máquina</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('sellerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        
        const data = {
            nomeMaquina: document.getElementById('sellerNomeMaquina').value,
            pais: document.getElementById('sellerPais').value,
            modelo: document.getElementById('sellerModelo').value,
            anoFabricacao: document.getElementById('sellerAno').value,
            preco: parseFloat(document.getElementById('sellerPreco').value),
            nomeEmpresa: document.getElementById('sellerEmpresa').value,
            telefone: document.getElementById('sellerTelefone').value,
            observacoes: document.getElementById('sellerObservacoes').value,
            userId: user.id,
            userName: user.name,
            status: 'pendente'
        };

        try {
            await api.createVenda(data);
            closeSellerModal();
            loadUserData();
            alert('Máquina anunciada! Aguardando aprovação.');
        } catch (error) {
            // Fallback localStorage
            const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
            data.id = Date.now();
            data.data = new Date().toISOString();
            allSales.push(data);
            localStorage.setItem('user_sales', JSON.stringify(allSales));
            closeSellerModal();
            loadUserData();
            alert('Máquina anunciada! Aguardando aprovação.');
        }
    });
}

function closeSellerModal() {
    document.getElementById('sellerModal')?.remove();
}

// Buyer Modal
function showBuyerModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'buyerModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cadastrar Cliente Interessado</h3>
                <button class="modal-close" onclick="closeBuyerModal()">×</button>
            </div>
            <form class="modal-form" id="buyerForm">
                <div class="form-group">
                    <label>Nome do Contato *</label>
                    <input type="text" id="buyerNome" required />
                </div>
                <div class="form-group">
                    <label>Nome da Empresa *</label>
                    <input type="text" id="buyerEmpresa" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Cidade *</label>
                        <input type="text" id="buyerCidade" required />
                    </div>
                    <div class="form-group">
                        <label>Estado *</label>
                        <select id="buyerEstado" required>
                            <option value="">Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                            <option value="PR">PR</option>
                            <option value="RS">RS</option>
                            <option value="SC">SC</option>
                            <option value="BA">BA</option>
                            <option value="DF">DF</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="buyerTelefone" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="buyerEmail" />
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeBuyerModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">Cadastrar Cliente</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('buyerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = Auth.getUser();
        
        const data = {
            nomeContato: document.getElementById('buyerNome').value,
            nomeEmpresa: document.getElementById('buyerEmpresa').value,
            cidade: document.getElementById('buyerCidade').value,
            estado: document.getElementById('buyerEstado').value,
            telefone: document.getElementById('buyerTelefone').value,
            email: document.getElementById('buyerEmail').value,
            tipoPessoa: 'empresa',
            divulgacao: 'site',
            userId: user.id,
            userName: user.name,
            status: 'pendente'
        };

        try {
            await api.createCaptura(data);
            closeBuyerModal();
            loadUserData();
            alert('Cliente cadastrado! Aguardando aprovação.');
        } catch (error) {
            // Fallback localStorage
            const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
            data.id = Date.now();
            data.data = new Date().toISOString();
            allCaptures.push(data);
            localStorage.setItem('user_captures', JSON.stringify(allCaptures));
            closeBuyerModal();
            loadUserData();
            alert('Cliente cadastrado! Aguardando aprovação.');
        }
    });
}

function closeBuyerModal() {
    document.getElementById('buyerModal')?.remove();
}

// User Produtos (Catálogo)
function loadUserProdutos() {
    const container = document.getElementById('userContentArea');
    
    container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <button class="back-btn" onclick="loadUserDashboard()">
                    <span data-icon="ArrowLeft"></span> Voltar
                </button>
                <h2>Catálogo de Máquinas</h2>
            </div>
            <div class="products-grid" id="userCatalogGrid">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;

    lucide.createIcons();
    renderUserCatalog();
}

function loadUserDashboard() {
    const container = document.getElementById('userContentArea');
    renderUserDashboard(container);
}

async function renderUserCatalog() {
    const grid = document.getElementById('userCatalogGrid');
    
    try {
        const response = await api.getProdutos();
        const products = response.data || response || [];
        
        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <p>Nenhuma máquina disponível no momento</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card-catalog">
                <h3>${product.nome || ''}</h3>
                <span class="category">${product.categoria || ''}</span>
                <p class="description">${product.descricao || ''}</p>
                <div class="product-footer">
                    <span class="price">R$ ${(product.preco || 0).toLocaleString()}</span>
                    <button class="btn-interest" onclick="alert('Entre em contato com o administrador para mais informações!')">
                        Tenho Interesse
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    } catch (error) {
        // Fallback localStorage
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        
        if (!products || products.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <p>Nenhuma máquina disponível no momento</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card-catalog">
                <h3>${product.nome || ''}</h3>
                <span class="category">${product.categoria || ''}</span>
                <p class="description">${product.descricao || ''}</p>
                <div class="product-footer">
                    <span class="price">R$ ${(product.preco || 0).toLocaleString()}</span>
                    <button class="btn-interest" onclick="alert('Entre em contato com o administrador para mais informações!')">
                        Tenho Interesse
                    </button>
                </div>
            </div>
        `).join('');

        lucide.createIcons();
    }
}

// Funções globais
window.showSellerModal = showSellerModal;
window.closeSellerModal = closeSellerModal;
window.showBuyerModal = showBuyerModal;
window.closeBuyerModal = closeBuyerModal;
window.loadUserProdutos = loadUserProdutos;
window.loadUserDashboard = loadUserDashboard;
window.switchUserTab = switchUserTab;