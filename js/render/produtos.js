// ============================================
// RENDER PRODUTOS
// ============================================

import { api } from "../api.js";
import { Data } from "../data.js";

let produtosData = [];
let categoriasData = [];

export function renderProdutos(container) {
  container.innerHTML = `
        <div class="produtos-container fade-in">
            <div class="page-header">
                <div>
                    <h2>Gerenciar Produtos</h2>
                    <p>Gerencie seus produtos e categorias</p>
                </div>
                <div class="header-actions">
                    <button class="btn-category" onclick="window.showCategoriaModal()">
                        🏷️ Nova Categoria
                    </button>
                    <button class="btn-add" onclick="window.showProdutoModal()">
                        ➕ Novo Produto
                    </button>
                </div>
            </div>
            <div class="search-bar">
                <div class="search-input-group">
                    🔍
                    <input type="text" placeholder="Pesquisar por nome ou categoria..." id="searchProdutos" oninput="window.filterProdutos()" />
                </div>
                <div class="filter-group">
                    <select id="filterCategoria" onchange="window.filterProdutos()">
                        <option value="todas">Todas Categorias</option>
                    </select>
                </div>
            </div>
            <div class="products-grid" id="produtosGrid">
                <div class="loading-state">Carregando...</div>
            </div>
        </div>
    `;

  loadCategorias();
  loadProdutosGrid();
}

// ============================================
// CARREGAR CATEGORIAS
// ============================================
export async function loadCategorias() {
  try {
    // Tenta buscar do backend
    const response = await api.getCategorias();
    categoriasData = response.data || response || [];

    // Se não tiver categorias, usa as do localStorage
    if (categoriasData.length === 0) {
      categoriasData = JSON.parse(localStorage.getItem("categorias") || "[]");
    }

    // Se ainda estiver vazio, cria categorias padrão
    if (categoriasData.length === 0) {
      categoriasData = [
        "Industrial",
        "Pneumática",
        "Logística",
        "Elétrica",
        "Hidráulica",
      ];
      localStorage.setItem("categorias", JSON.stringify(categoriasData));
    }

    updateCategoriaFilter();
  } catch (error) {
    // Fallback para localStorage
    categoriasData = JSON.parse(localStorage.getItem("categorias") || "[]");
    if (categoriasData.length === 0) {
      categoriasData = [
        "Industrial",
        "Pneumática",
        "Logística",
        "Elétrica",
        "Hidráulica",
      ];
      localStorage.setItem("categorias", JSON.stringify(categoriasData));
    }
    updateCategoriaFilter();
  }
}

function updateCategoriaFilter() {
  const filter = document.getElementById("filterCategoria");
  if (!filter) return;

  filter.innerHTML =
    '<option value="todas">Todas Categorias</option>' +
    categoriasData
      .map((cat) => `<option value="${cat}">${cat}</option>`)
      .join("");
}

// ============================================
// CARREGAR PRODUTOS
// ============================================
export async function loadProdutosGrid() {
  const grid = document.getElementById("produtosGrid");

  try {
    const response = await api.getProdutos();
    produtosData = response.data || response || [];
    renderProdutosGrid(produtosData);
  } catch (error) {
    produtosData = Data.getProducts();
    renderProdutosGrid(produtosData);
  }
}

export function renderProdutosGrid(data) {
  const grid = document.getElementById("produtosGrid");
  const categoriaFiltro =
    document.getElementById("filterCategoria")?.value || "todas";

  let filtered = data;
  if (categoriaFiltro !== "todas") {
    filtered = data.filter((p) => p.categoria === categoriaFiltro);
  }

  if (!filtered || filtered.length === 0) {
    grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <p>Nenhum produto encontrado</p>
                <button class="btn-add" onclick="window.showProdutoModal()">➕ Adicionar Produto</button>
            </div>
        `;
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
        <div class="product-card">
            <div class="product-content">
                <h3>${product.nome || ""}</h3>
                <span class="product-category">${product.categoria || ""}</span>
                <p class="product-description">${product.descricao || ""}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${(product.preco || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    <div>
                        <button class="btn-edit" onclick="window.editProduto(${product.id})">✏️</button>
                        <button class="btn-delete" onclick="window.deleteProduto(${product.id})">🗑️</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}

export function filterProdutos() {
  const search = document.getElementById("searchProdutos").value.toLowerCase();
  const filtered = produtosData.filter(
    (p) =>
      (p.nome || "").toLowerCase().includes(search) ||
      (p.categoria || "").toLowerCase().includes(search),
  );
  renderProdutosGrid(filtered);
}

// ============================================
// MODAL DE CATEGORIA
// ============================================
export function showCategoriaModal() {
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "categoriaModal";

  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Nova Categoria</h3>
                <button class="modal-close" onclick="window.closeCategoriaModal()">×</button>
            </div>
            <form class="modal-form" id="categoriaForm">
                <div class="form-group">
                    <label>Nome da Categoria *</label>
                    <input type="text" id="formCategoriaNome" placeholder="Ex: Automotiva, Agrícola..." required />
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="window.closeCategoriaModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">Adicionar Categoria</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document
    .getElementById("categoriaForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const nome = document.getElementById("formCategoriaNome").value.trim();

      if (!nome) {
        alert("Digite o nome da categoria");
        return;
      }

      // Verificar se já existe
      if (categoriasData.includes(nome)) {
        alert("Esta categoria já existe!");
        return;
      }

      try {
        // Tenta salvar no backend
        await api.createCategoria({ nome });
        categoriasData.push(nome);
        localStorage.setItem("categorias", JSON.stringify(categoriasData));
        updateCategoriaFilter();
        closeCategoriaModal();
        alert("✅ Categoria criada com sucesso!");
      } catch (error) {
        // Fallback localStorage
        categoriasData.push(nome);
        localStorage.setItem("categorias", JSON.stringify(categoriasData));
        updateCategoriaFilter();
        closeCategoriaModal();
        alert("✅ Categoria criada com sucesso!");
      }
    });
}

export function closeCategoriaModal() {
  document.getElementById("categoriaModal")?.remove();
}

// ============================================
// CRUD PRODUTOS
// ============================================
export function showProdutoModal(data = null) {
  const isEdit = !!data;
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "produtoModal";

  // Atualizar opções de categoria no select
  const categoriaOptions = categoriasData
    .map(
      (cat) =>
        `<option value="${cat}" ${data?.categoria === cat ? "selected" : ""}>${cat}</option>`,
    )
    .join("");

  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? "Editar Produto" : "Novo Produto"}</h3>
                <button class="modal-close" onclick="window.closeProdutoModal()">×</button>
            </div>
            <form class="modal-form" id="produtoForm">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="formProdutoNome" value="${data?.nome || ""}" required />
                </div>
                <div class="form-group">
                    <label>Categoria</label>
                    <select id="formProdutoCategoria">
                        ${categoriaOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Preço (R$) *</label>
                    <input type="number" step="0.01" id="formProdutoPreco" value="${data?.preco || ""}" required />
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea id="formProdutoDescricao" rows="3">${data?.descricao || ""}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="window.closeProdutoModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">${isEdit ? "Salvar" : "Cadastrar"}</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document
    .getElementById("produtoForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        nome: document.getElementById("formProdutoNome").value,
        categoria: document.getElementById("formProdutoCategoria").value,
        preco: parseFloat(document.getElementById("formProdutoPreco").value),
        descricao: document.getElementById("formProdutoDescricao").value,
      };

      try {
        if (isEdit) {
          await api.updateProduto(data.id, formData);
        } else {
          await api.createProduto(formData);
        }
        closeProdutoModal();
        loadProdutosGrid();
      } catch (error) {
        // Fallback localStorage
        if (isEdit) {
          const index = produtosData.findIndex((p) => p.id === data.id);
          if (index !== -1) {
            produtosData[index] = { ...produtosData[index], ...formData };
          }
        } else {
          formData.id = Date.now();
          formData.vendedorId = 1;
          formData.vendedorNome = "Administrador";
          formData.ativo = true;
          produtosData.push(formData);
        }
        Data.saveProducts(produtosData);
        closeProdutoModal();
        renderProdutosGrid(produtosData);
      }
    });
}

export function editProduto(id) {
  const product = produtosData.find((p) => p.id === id);
  if (product) showProdutoModal(product);
}

export function deleteProduto(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  try {
    api.deleteProduto(id);
    produtosData = produtosData.filter((p) => p.id !== id);
    Data.saveProducts(produtosData);
    renderProdutosGrid(produtosData);
  } catch (error) {
    produtosData = produtosData.filter((p) => p.id !== id);
    Data.saveProducts(produtosData);
    renderProdutosGrid(produtosData);
  }
}

export function closeProdutoModal() {
  document.getElementById("produtoModal")?.remove();
}

// Expor funções globalmente
window.showProdutoModal = showProdutoModal;
window.editProduto = editProduto;
window.deleteProduto = deleteProduto;
window.closeProdutoModal = closeProdutoModal;
window.filterProdutos = filterProdutos;
window.showCategoriaModal = showCategoriaModal;
window.closeCategoriaModal = closeCategoriaModal;
