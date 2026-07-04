// Admin - Produtos
let produtosData = [];

function renderAdminProdutos(container) {
    container.innerHTML = `
        <div class="produtos-container fade-in">
            <div class="page-header">
                <h2>Gerenciar Produtos</h2>
                <button class="btn-add" onclick="showProdutoModal()">
                    <span data-icon="Plus"></span> Novo Produto
                </button>
            </div>
            <div class="search-bar">
                <div class="search-input-group">
                    <span data-icon="Search"></span>
                    <input type="text" placeholder="Pesquisar..." id="searchProdutos" oninput="filterProdutos()" />
                </div>
                <button class="btn-delete-selected" onclick="deleteSelectedProdutos()" style="display:none;" id="deleteSelectedProdutos">
                    <span data-icon="Trash2"></span> Excluir
                </button>
            </div>
            <div class="products-grid" id="produtosGrid">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;

    lucide.createIcons();
    loadProdutos();
}

async function loadProdutos() {
    try {
        const response = await api.getProdutos();
        produtosData = response.data || response || [];
        renderProdutosGrid(produtosData);
    } catch (error) {
        produtosData = JSON.parse(localStorage.getItem('products') || '[]');
        renderProdutosGrid(produtosData);
    }
}

function renderProdutosGrid(data) {
    const grid = document.getElementById('produtosGrid');
    
    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Nenhum produto cadastrado</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map(product => `
        <div class="product-card">
            <div class="product-checkbox">
                <input type="checkbox" class="product-checkbox-input" value="${product.id}" onchange="updateProdutoDeleteButton()" />
            </div>
            <div class="product-content">
                <h3>${product.nome || ''}</h3>
                <span class="product-category">${product.categoria || ''}</span>
                <p class="product-description">${product.descricao || ''}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${(product.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <button class="btn-edit" onclick="editProduto(${product.id})">
                        <span data-icon="Edit2"></span> Editar
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

function filterProdutos() {
    const search = document.getElementById('searchProdutos').value.toLowerCase();
    const filtered = produtosData.filter(p => 
        (p.nome || '').toLowerCase().includes(search) ||
        (p.categoria || '').toLowerCase().includes(search)
    );
    renderProdutosGrid(filtered);
}

function updateProdutoDeleteButton() {
    const checked = document.querySelectorAll('.product-checkbox-input:checked').length;
    const btn = document.getElementById('deleteSelectedProdutos');
    btn.style.display = checked > 0 ? 'flex' : 'none';
    btn.innerHTML = `<span data-icon="Trash2"></span> Excluir (${checked})`;
    lucide.createIcons();
}

function deleteSelectedProdutos() {
    const ids = Array.from(document.querySelectorAll('.product-checkbox-input:checked')).map(cb => parseInt(cb.value));
    if (!ids.length) return;
    if (!confirm(`Excluir ${ids.length} produto(s)?`)) return;

    try {
        api.deleteProdutos(ids);
        produtosData = produtosData.filter(p => !ids.includes(p.id));
        localStorage.setItem('products', JSON.stringify(produtosData));
        renderProdutosGrid(produtosData);
        updateProdutoDeleteButton();
    } catch (error) {
        produtosData = produtosData.filter(p => !ids.includes(p.id));
        localStorage.setItem('products', JSON.stringify(produtosData));
        renderProdutosGrid(produtosData);
        updateProdutoDeleteButton();
    }
}

function showProdutoModal(data = null) {
    const isEdit = !!data;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'produtoModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? 'Editar Produto' : 'Novo Produto'}</h3>
                <button class="modal-close" onclick="closeProdutoModal()">×</button>
            </div>
            <form class="modal-form" id="produtoForm">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="formProdutoNome" value="${data?.nome || ''}" required />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <input type="text" id="formProdutoCategoria" value="${data?.categoria || ''}" />
                </div>
                <div class="form-group">
                    <label>Preço (R$) *</label>
                    <input type="number" step="0.01" id="formProdutoPreco" value="${data?.preco || ''}" required />
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="formProdutoDescricao" rows="3">${data?.descricao || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeProdutoModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('produtoForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            nome: document.getElementById('formProdutoNome').value,
            categoria: document.getElementById('formProdutoCategoria').value,
            preco: parseFloat(document.getElementById('formProdutoPreco').value),
            descricao: document.getElementById('formProdutoDescricao').value
        };

        try {
            if (isEdit) {
                await api.updateProduto(data.id, formData);
            } else {
                await api.createProduto(formData);
            }
            closeProdutoModal();
            loadProdutos();
        } catch (error) {
            if (isEdit) {
                const index = produtosData.findIndex(p => p.id === data.id);
                if (index !== -1) {
                    produtosData[index] = { ...produtosData[index], ...formData };
                }
            } else {
                formData.id = Date.now();
                formData.vendedorId = 1;
                formData.vendedorNome = 'Administrador';
                formData.ativo = true;
                produtosData.push(formData);
            }
            localStorage.setItem('products', JSON.stringify(produtosData));
            closeProdutoModal();
            renderProdutosGrid(produtosData);
        }
    });
}

function editProduto(id) {
    const product = produtosData.find(p => p.id === id);
    if (product) showProdutoModal(product);
}

function closeProdutoModal() {
    document.getElementById('produtoModal')?.remove();
}

window.showProdutoModal = showProdutoModal;
window.editProduto = editProduto;
window.closeProdutoModal = closeProdutoModal;
window.deleteSelectedProdutos = deleteSelectedProdutos;
window.filterProdutos = filterProdutos;
window.updateProdutoDeleteButton = updateProdutoDeleteButton;