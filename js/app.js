// ============================================
// CONFIGURAÇÃO DA API
// ============================================
const API_BASE_URL = 'http://localhost:8070/api';

// ============================================
// SERVIÇO DE API
// ============================================
const api = {
    async request(endpoint, options = {}) {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const token = localStorage.getItem('accessToken');
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const url = `${API_BASE_URL}${cleanEndpoint}`;
            
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Se for 401, tenta refresh token
            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    const newToken = localStorage.getItem('accessToken');
                    headers['Authorization'] = `Bearer ${newToken}`;
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers,
                        signal: controller.signal
                    });
                    const retryData = await retryResponse.json();
                    if (!retryResponse.ok) {
                        throw new Error(retryData.message || 'Erro na requisição');
                    }
                    return retryData;
                } else {
                    Auth.logout();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro ${response.status}`);
            }

            const data = await response.json();
            return data;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                return this.getFallbackData(endpoint);
            }
            
            throw error;
        }
    },

    getFallbackData(endpoint) {
        const fallbackMap = {
            '/auth/login': () => null,
            '/usuarios': () => JSON.parse(localStorage.getItem('users') || '[]'),
            '/produtos': () => JSON.parse(localStorage.getItem('products') || '[]'),
            '/vendas': () => JSON.parse(localStorage.getItem('transactions') || '[]'),
            '/vendas/pendentes': () => JSON.parse(localStorage.getItem('user_sales') || '[]').filter(s => s.status === 'pendente'),
            '/capturas': () => JSON.parse(localStorage.getItem('user_captures') || '[]'),
            '/capturas/pendentes': () => JSON.parse(localStorage.getItem('user_captures') || '[]').filter(c => c.status === 'pendente'),
            '/transacoes': () => JSON.parse(localStorage.getItem('transactions') || '[]'),
        };
        
        for (const [key, getData] of Object.entries(fallbackMap)) {
            if (endpoint === key || endpoint.startsWith(key + '/')) {
                const data = getData();
                return { data: data };
            }
        }
        return { data: [] };
    },

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    },

    // ============================================
    // AUTH
    // ============================================
    async login(email, senha) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        return response;
    },

    // ============================================
    // USUÁRIOS
    // ============================================
    getUsuarios() {
        return this.request('/usuarios');
    },
    createUsuario(data) {
        return this.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    updateUsuario(id, data) {
        return this.request(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteUsuario(id) {
        return this.request(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    },
    deleteUsuarios(ids) {
        return this.request('/usuarios', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },

    // ============================================
    // PRODUTOS
    // ============================================
    getProdutos() {
        return this.request('/produtos');
    },
    createProduto(data) {
        return this.request('/produtos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    updateProduto(id, data) {
        return this.request(`/produtos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    deleteProduto(id) {
        return this.request(`/produtos/${id}`, {
            method: 'DELETE'
        });
    },
    deleteProdutos(ids) {
        return this.request('/produtos', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    },

    // ============================================
    // VENDAS
    // ============================================
    getVendas() {
        return this.request('/vendas');
    },
    getVendasPendentes() {
        return this.request('/vendas/pendentes');
    },
    getVendasPorUsuario(usuarioId) {
        return this.request(`/vendas/usuario/${usuarioId}`);
    },
    createVenda(data) {
        return this.request('/vendas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    aprovarVenda(id) {
        return this.request(`/vendas/${id}/aprovar`, {
            method: 'PATCH'
        });
    },
    recusarVenda(id) {
        return this.request(`/vendas/${id}/recusar`, {
            method: 'PATCH'
        });
    },

    // ============================================
    // CAPTURAS
    // ============================================
    getCapturas() {
        return this.request('/capturas');
    },
    getCapturasPendentes() {
        return this.request('/capturas/pendentes');
    },
    getCapturasPorUsuario(usuarioId) {
        return this.request(`/capturas/usuario/${usuarioId}`);
    },
    createCaptura(data) {
        return this.request('/capturas', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    aprovarCaptura(id) {
        return this.request(`/capturas/${id}/aprovar`, {
            method: 'PATCH'
        });
    },
    recusarCaptura(id) {
        return this.request(`/capturas/${id}/recusar`, {
            method: 'PATCH'
        });
    },

    // ============================================
    // TRANSAÇÕES
    // ============================================
    getTransacoes() {
        return this.request('/transacoes');
    },
    getComissoes() {
        return this.request('/transacoes/comissoes');
    },
    getComissoesPorUsuario(usuarioId) {
        return this.request(`/transacoes/comissoes/${usuarioId}`);
    }
};

// ============================================
// AUTENTICAÇÃO
// ============================================
const Auth = {
    user: null,

    init() {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                this.user = JSON.parse(userData);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    },

    async login(email, senha) {
        try {
            const response = await api.login(email, senha);
            
            // Verificar se a resposta tem a estrutura esperada
            let userData = response.data || response;
            
            // Se a resposta for um array ou não tiver os campos esperados
            if (!userData.token && !userData.accessToken) {
                // Tenta buscar o token em outro lugar
                if (response.token) {
                    userData = response;
                } else {
                    throw new Error('Resposta inválida do servidor');
                }
            }
            
            const accessToken = userData.token || userData.accessToken;
            const refreshToken = userData.refreshToken || '';
            const user = {
                id: userData.id || 1,
                name: userData.name || userData.nome || 'Usuário',
                email: userData.email || email,
                role: userData.role || 'USER'
            };
            
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            
            this.user = {
                ...user,
                isAdmin: user.role === 'ADMIN'
            };
            
            return this.user;
            
        } catch (error) {
            // Fallback para login local (apenas para testes)
            if (email === 'admin@maisonmaquinas.com' && senha === 'admin123') {
                const user = {
                    id: 1,
                    name: 'Administrador',
                    email: 'admin@maisonmaquinas.com',
                    role: 'ADMIN',
                    isAdmin: true
                };
                
                localStorage.setItem('accessToken', 'local-token-' + Date.now());
                localStorage.setItem('refreshToken', 'local-refresh-' + Date.now());
                localStorage.setItem('user', JSON.stringify(user));
                
                this.user = user;
                return user;
            }
            
            if (email === 'joao@maisonmaquinas.com' && senha === 'vendedor123') {
                const user = {
                    id: 2,
                    name: 'João Silva',
                    email: 'joao@maisonmaquinas.com',
                    role: 'USER',
                    isAdmin: false
                };
                
                localStorage.setItem('accessToken', 'local-token-' + Date.now());
                localStorage.setItem('refreshToken', 'local-refresh-' + Date.now());
                localStorage.setItem('user', JSON.stringify(user));
                
                this.user = user;
                return user;
            }
            
            throw new Error('E-mail ou senha inválidos');
        }
    },

    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.user = null;
        location.reload();
    },

    isAuthenticated() {
        return !!this.user && !!localStorage.getItem('accessToken');
    },

    isAdmin() {
        return this.user?.role === 'ADMIN';
    },

    getUser() {
        return this.user;
    }
};

// ============================================
// INICIALIZAÇÃO DOS DADOS LOCAIS (FALLBACK)
// ============================================
function initLocalData() {
    if (!localStorage.getItem('users')) {
        const users = [
            { id: 1, name: 'Administrador', email: 'admin@maisonmaquinas.com', senha: 'admin123', role: 'ADMIN', tipo: 'V', ativo: true },
            { id: 2, name: 'João Silva', email: 'joao@maisonmaquinas.com', senha: 'vendedor123', role: 'USER', tipo: 'V', ativo: true }
        ];
        localStorage.setItem('users', JSON.stringify(users));
    }

    if (!localStorage.getItem('products')) {
        const products = [
            { id: 1, nome: 'Escavadeira CAT 320D', categoria: 'Industrial', preco: 250000, descricao: 'Escavadeira em excelente estado', vendedorId: 2, vendedorNome: 'João Silva', ativo: true },
            { id: 2, nome: 'Compressor Atlas Copco', categoria: 'Pneumática', preco: 45000, descricao: 'Compressor industrial', vendedorId: 2, vendedorNome: 'João Silva', ativo: true }
        ];
        localStorage.setItem('products', JSON.stringify(products));
    }

    if (!localStorage.getItem('transactions')) {
        const transactions = [
            { id: 1, produto: 'Escavadeira CAT 320D', valor: 250000, vendedor: 'João Silva', comprador: 'Construção Rápida', comissao: 12500, status: 'ativo', data: new Date().toISOString() }
        ];
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
}

// ============================================
// NAVEGAÇÃO
// ============================================
function showLoginPage() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('adminPage').classList.remove('active');
    document.getElementById('userPage').classList.remove('active');
    
    // Esconder mensagem de verificação
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) statusEl.style.display = 'none';
    
    // Esconder senha
    document.getElementById('loginPassword').type = 'password';
}

function showAdminPage() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('adminPage').classList.add('active');
    document.getElementById('userPage').classList.remove('active');
    
    const user = Auth.getUser();
    document.getElementById('userName').textContent = user?.name || 'Administrador';
    document.getElementById('pageTitle').textContent = 'Dashboard';
    
    loadAdminContent('admin-dashboard');
}

function showUserPage() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('adminPage').classList.remove('active');
    document.getElementById('userPage').classList.add('active');
    
    const user = Auth.getUser();
    document.getElementById('userNameUser').textContent = user?.name || 'Usuário';
    document.getElementById('userPageTitle').textContent = 'Início';
    
    loadUserContent('user-dashboard');
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    if (page.startsWith('admin-')) {
        loadAdminContent(page);
    } else if (page.startsWith('user-')) {
        loadUserContent(page);
    }
}

// ============================================
// CARREGAR CONTEÚDO ADMIN
// ============================================
function loadAdminContent(page) {
    const contentArea = document.getElementById('contentArea');
    const titles = {
        'admin-dashboard': 'Dashboard',
        'admin-usuarios': 'Usuários',
        'admin-produtos': 'Produtos',
        'admin-financeiro': 'Financeiro',
        'admin-negociacoes': 'Negociações',
        'admin-aprovacoes': 'Aprovações'
    };
    
    document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

    switch(page) {
        case 'admin-dashboard':
            renderDashboard(contentArea);
            break;
        case 'admin-usuarios':
            renderUsuarios(contentArea);
            break;
        case 'admin-produtos':
            renderProdutos(contentArea);
            break;
        case 'admin-financeiro':
            renderFinanceiro(contentArea);
            break;
        case 'admin-negociacoes':
            renderNegociacoes(contentArea);
            break;
        case 'admin-aprovacoes':
            renderAprovacoes(contentArea);
            break;
        default:
            contentArea.innerHTML = '<div class="loading-state">Página não encontrada</div>';
    }
}

function loadUserContent(page) {
    const contentArea = document.getElementById('userContentArea');
    const titles = {
        'user-dashboard': 'Início',
        'user-produtos': 'Catálogo'
    };
    
    document.getElementById('userPageTitle').textContent = titles[page] || 'Início';

    switch(page) {
        case 'user-dashboard':
            renderUserDashboard(contentArea);
            break;
        case 'user-produtos':
            renderUserCatalog(contentArea);
            break;
        default:
            contentArea.innerHTML = '<div class="loading-state">Página não encontrada</div>';
    }
}

// ============================================
// RENDER DASHBOARD
// ============================================
function renderDashboard(container) {
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
        const activeNegotiations = transactionsData.filter(t => t.status === 'ativo').length;

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
    } catch {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

        const totalRevenue = transactions.reduce((sum, t) => sum + (t.valor || 0), 0);
        const activeNegotiations = transactions.filter(t => t.status === 'ativo').length;

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

// ============================================
// RENDER USUÁRIOS
// ============================================
function renderUsuarios(container) {
    container.innerHTML = `
        <div class="usuarios-container fade-in">
            <div class="page-header">
                <h2>Gerenciar Usuários</h2>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody id="usuariosTableBody">
                        <tr><td colspan="4" class="loading-state">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    loadUsuariosTable();
}

async function loadUsuariosTable() {
    const tbody = document.getElementById('usuariosTableBody');
    
    try {
        const response = await api.getUsuarios();
        const users = response.data || response || [];
        
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-state">Nenhum usuário cadastrado</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name || user.nome || ''}</td>
                <td>${user.email || ''}</td>
                <td><span class="status-badge status-${(user.role || user.estado || 'user').toLowerCase()}">${user.role === 'ADMIN' ? 'Admin' : 'Comum'}</span></td>
                <td><span class="tipo-badge">${user.tipo || 'V'}</span></td>
            </tr>
        `).join('');
    } catch {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name || user.nome || ''}</td>
                <td>${user.email || ''}</td>
                <td><span class="status-badge status-${(user.role || user.estado || 'user').toLowerCase()}">${user.role === 'ADMIN' ? 'Admin' : 'Comum'}</span></td>
                <td><span class="tipo-badge">${user.tipo || 'V'}</span></td>
            </tr>
        `).join('');
    }
}

// ============================================
// RENDER PRODUTOS
// ============================================
function renderProdutos(container) {
    container.innerHTML = `
        <div class="produtos-container fade-in">
            <div class="page-header">
                <h2>Gerenciar Produtos</h2>
            </div>
            <div class="products-grid" id="produtosGrid">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;
    loadProdutosGrid();
}

async function loadProdutosGrid() {
    const grid = document.getElementById('produtosGrid');
    
    try {
        const response = await api.getProdutos();
        const products = response.data || response || [];
        
        if (!products || products.length === 0) {
            grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;"><p>Nenhum produto cadastrado</p></div>';
            return;
        }
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-content">
                    <h3>${product.nome || ''}</h3>
                    <span class="product-category">${product.categoria || ''}</span>
                    <p class="product-description">${product.descricao || ''}</p>
                    <div class="product-footer">
                        <span class="product-price">R$ ${(product.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch {
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-content">
                    <h3>${product.nome || ''}</h3>
                    <span class="product-category">${product.categoria || ''}</span>
                    <p class="product-description">${product.descricao || ''}</p>
                    <div class="product-footer">
                        <span class="product-price">R$ ${(product.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// RENDER FINANCEIRO
// ============================================
function renderFinanceiro(container) {
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

async function loadFinanceiro() {
    const content = document.getElementById('financeiroContent');
    
    try {
        const response = await api.getTransacoes();
        const transactions = response.data || response || [];
        
        const totalComissoes = transactions.reduce((sum, t) => sum + (t.comissao || 0), 0);

        content.innerHTML = `
            <div class="commission-stats">
                <div class="stat-card-total">
                    <div class="stat-icon-total">💰</div>
                    <div>
                        <h3>Total em Comissões</h3>
                        <p class="stat-value-total">R$ ${totalComissoes.toLocaleString()}</p>
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
                        </div>
                        <div class="transaction-commission">
                            <span>Comissão: R$ ${(t.comissao || 0).toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const totalComissoes = transactions.reduce((sum, t) => sum + (t.comissao || 0), 0);
        
        content.innerHTML = `
            <div class="commission-stats">
                <div class="stat-card-total">
                    <div class="stat-icon-total">💰</div>
                    <div>
                        <h3>Total em Comissões</h3>
                        <p class="stat-value-total">R$ ${totalComissoes.toLocaleString()}</p>
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
                        </div>
                        <div class="transaction-commission">
                            <span>Comissão: R$ ${(t.comissao || 0).toLocaleString()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

// ============================================
// RENDER NEGOCIAÇÕES
// ============================================
function renderNegociacoes(container) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
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

// ============================================
// RENDER APROVAÇÕES
// ============================================
function renderAprovacoes(container) {
    const pendingSales = JSON.parse(localStorage.getItem('user_sales') || '[]').filter(s => s.status === 'pendente');
    
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
                            <button class="btn-approve" onclick="alert('Aprovar item ${item.id}')">✅ Aprovar</button>
                            <button class="btn-reject" onclick="alert('Recusar item ${item.id}')">❌ Recusar</button>
                        </div>
                    </div>
                `).join('')
            }
        </div>
    `;
}

// ============================================
// RENDER USER DASHBOARD
// ============================================
function renderUserDashboard(container) {
    const user = Auth.getUser();
    const userSales = JSON.parse(localStorage.getItem('user_sales') || '[]').filter(s => s.userId === user?.id);
    
    container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <h2>Olá, ${user?.name || 'Usuário'}!</h2>
                <p>Bem-vindo ao sistema Lamaison Máquinas</p>
            </div>
            <div class="action-cards">
                <div class="action-card sell-card" onclick="alert('Implementar venda')">
                    📦
                    <h3>Quero Vender</h3>
                    <p>Anuncie sua máquina</p>
                </div>
                <div class="action-card capture-card" onclick="alert('Implementar captura')">
                    👥
                    <h3>Tenho um Comprador</h3>
                    <p>Indique um cliente</p>
                </div>
                <div class="action-card catalog-card" onclick="navigateTo('user-produtos')">
                    👁️
                    <h3>Ver Catálogo</h3>
                    <p>Consulte máquinas</p>
                </div>
            </div>
            <div class="my-activities">
                <h3 style="padding:15px;color:var(--laranja-escuro);">Minhas Vendas</h3>
                <div class="activities-list">
                    ${userSales.length === 0 ? 
                        '<div class="empty-state"><p>Nenhuma máquina anunciada</p></div>' :
                        userSales.map(item => `
                            <div class="activity-card">
                                <div class="activity-header">
                                    <h4>${item.nomeMaquina || ''}</h4>
                                    <span class="status-badge status-${item.status || 'pendente'}">
                                        ${item.status === 'pendente' ? '⏳ Aguardando' : '✅ Aprovado'}
                                    </span>
                                </div>
                                <div class="activity-details">
                                    <div><span class="label">Preço:</span> R$ ${(item.preco || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    `;
}

// ============================================
// RENDER USER CATALOG
// ============================================
function renderUserCatalog(container) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <button class="back-btn" onclick="navigateTo('user-dashboard')">← Voltar</button>
                <h2>Catálogo de Máquinas</h2>
            </div>
            <div class="products-grid">
                ${products.length === 0 ? 
                    '<div class="empty-state" style="grid-column:1/-1;"><p>Nenhuma máquina disponível</p></div>' :
                    products.map(product => `
                        <div class="product-card-catalog">
                            <h3>${product.nome || ''}</h3>
                            <span class="category">${product.categoria || ''}</span>
                            <p class="description">${product.descricao || ''}</p>
                            <div class="product-footer">
                                <span class="price">R$ ${(product.preco || 0).toLocaleString()}</span>
                                <button class="btn-interest" onclick="alert('Entre em contato com o administrador!')">Tenho Interesse</button>
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

// ============================================
// INICIALIZAÇÃO
// ============================================
function initApp() {
    // Inicializar dados locais
    initLocalData();
    
    // Verificar autenticação
    if (Auth.init()) {
        const user = Auth.getUser();
        if (user.isAdmin) {
            showAdminPage();
        } else {
            showUserPage();
        }
    } else {
        showLoginPage();
    }

    // Configurar eventos
    document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
    document.getElementById('logoutBtnUser')?.addEventListener('click', () => Auth.logout());

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Setup do Login
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            errorDiv.textContent = 'Preencha todos os campos';
            errorDiv.style.display = 'block';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Entrando...';
        errorDiv.style.display = 'none';

        try {
            const user = await Auth.login(email, password);
            
            if (user.isAdmin) {
                showAdminPage();
            } else {
                showUserPage();
            }
        } catch (error) {
            errorDiv.textContent = error.message || 'E-mail ou senha inválidos';
            errorDiv.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    });
}

// ============================================
// INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', initApp);