// Admin - Negociações
function renderAdminNegociacoes(container) {
    container.innerHTML = `
        <div class="negociacoes-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Negociações</h2>
                    <p>Acompanhe as negociações ativas</p>
                </div>
            </div>
            <div id="negociacoesContent">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;

    loadNegociacoes();
}

async function loadNegociacoes() {
    const content = document.getElementById('negociacoesContent');
    
    try {
        const [usuariosRes, produtosRes, vendasRes] = await Promise.all([
            api.getUsuarios(),
            api.getProdutos(),
            api.getVendas()
        ]);

        const users = usuariosRes.data || usuariosRes || [];
        const products = produtosRes.data || produtosRes || [];
        const sales = vendasRes.data || vendasRes || [];

        const sellers = users
            .filter(u => u.ativo !== false && ['V', 'R', 'E'].includes(u.tipo))
            .map(user => ({
                id: user.id,
                name: user.name,
                type: user.tipo,
                activeProducts: products.filter(p => p.vendedorId === user.id).length,
                totalSales: sales.filter(s => s.vendedorId === user.id).length,
                status: 'active'
            }));

        const listings = products
            .filter(p => p.ativo !== false)
            .map(product => ({
                id: product.id,
                product: product.nome,
                seller: product.vendedorNome || 'Desconhecido',
                price: product.preco || 0,
                views: product.visualizacoes || 0,
                interested: product.interessados || 0
            }));

        content.innerHTML = `
            <div class="negotiation-stats">
                <div class="stat-card">
                    <span data-icon="UserCheck"></span>
                    <div>
                        <h3>Vendedores Ativos</h3>
                        <p class="stat-number">${sellers.filter(s => s.status === 'active').length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <span data-icon="Package"></span>
                    <div>
                        <h3>Produtos Anunciados</h3>
                        <p class="stat-number">${listings.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <span data-icon="TrendingUp"></span>
                    <div>
                        <h3>Total de Interessados</h3>
                        <p class="stat-number">${listings.reduce((sum, l) => sum + (l.interested || 0), 0)}</p>
                    </div>
                </div>
            </div>
            <div class="sellers-section">
                <h3>Vendedores Ativos</h3>
                <div class="sellers-grid">
                    ${sellers.filter(s => s.status === 'active').map(seller => `
                        <div class="seller-card">
                            <h4>${seller.name}</h4>
                            <span class="seller-type">${seller.type}</span>
                            <div class="seller-stats">
                                <div><span class="label">Produtos:</span> ${seller.activeProducts}</div>
                                <div><span class="label">Vendas:</span> ${seller.totalSales}</div>
                            </div>
                            <div class="seller-status active">
                                <span data-icon="Clock"></span> Ativo
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="listings-section">
                <h3>Produtos em Anúncio</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Vendedor</th>
                                <th>Preço</th>
                                <th>Visualizações</th>
                                <th>Interessados</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listings.map(listing => `
                                <tr>
                                    <td class="product-name">${listing.product}</td>
                                    <td>${listing.seller}</td>
                                    <td class="price">R$ ${listing.price.toLocaleString()}</td>
                                    <td>${listing.views}</td>
                                    <td>${listing.interested}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        lucide.createIcons();
    } catch (error) {
        // Fallback localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');

        const sellers = users
            .filter(u => u.ativo !== false && ['V', 'R', 'E'].includes(u.tipo))
            .map(user => ({
                id: user.id,
                name: user.name,
                type: user.tipo,
                activeProducts: products.filter(p => p.vendedorId === user.id).length,
                totalSales: transactions.filter(s => s.vendedorId === user.id).length,
                status: 'active'
            }));

        const listings = products
            .filter(p => p.ativo !== false)
            .map(product => ({
                id: product.id,
                product: product.nome,
                seller: product.vendedorNome || 'Desconhecido',
                price: product.preco || 0,
                views: product.visualizacoes || 0,
                interested: product.interessados || 0
            }));

        content.innerHTML = `
            <div class="negotiation-stats">
                <div class="stat-card">
                    <span data-icon="UserCheck"></span>
                    <div>
                        <h3>Vendedores Ativos</h3>
                        <p class="stat-number">${sellers.filter(s => s.status === 'active').length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <span data-icon="Package"></span>
                    <div>
                        <h3>Produtos Anunciados</h3>
                        <p class="stat-number">${listings.length}</p>
                    </div>
                </div>
                <div class="stat-card">
                    <span data-icon="TrendingUp"></span>
                    <div>
                        <h3>Total de Interessados</h3>
                        <p class="stat-number">${listings.reduce((sum, l) => sum + (l.interested || 0), 0)}</p>
                    </div>
                </div>
            </div>
            <div class="sellers-section">
                <h3>Vendedores Ativos</h3>
                <div class="sellers-grid">
                    ${sellers.filter(s => s.status === 'active').map(seller => `
                        <div class="seller-card">
                            <h4>${seller.name}</h4>
                            <span class="seller-type">${seller.type}</span>
                            <div class="seller-stats">
                                <div><span class="label">Produtos:</span> ${seller.activeProducts}</div>
                                <div><span class="label">Vendas:</span> ${seller.totalSales}</div>
                            </div>
                            <div class="seller-status active">
                                <span data-icon="Clock"></span> Ativo
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="listings-section">
                <h3>Produtos em Anúncio</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Vendedor</th>
                                <th>Preço</th>
                                <th>Visualizações</th>
                                <th>Interessados</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${listings.map(listing => `
                                <tr>
                                    <td class="product-name">${listing.product}</td>
                                    <td>${listing.seller}</td>
                                    <td class="price">R$ ${listing.price.toLocaleString()}</td>
                                    <td>${listing.views}</td>
                                    <td>${listing.interested}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        lucide.createIcons();
    }
}