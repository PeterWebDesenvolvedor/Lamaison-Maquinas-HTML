/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Edit2, Search, Plus, Trash2, X, Tag } from "lucide-react";
import api from "../../api/axios"; // 👈 Importação da sua instância conectada ao Java
import "./Produtos.css";

const Produtos = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco: "",
    descricao: "",
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // 1. CARREGA PRODUTOS DO BANCO DE DADOS (Acessível por qualquer usuário)
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get("produtos"); // 👈 GET /api/produtos
      const data = response.data.data || response.data;
      setProducts(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setErrorMessage("Erro ao carregar a lista de máquinas do servidor.");
    } finally {
      setLoading(false);
    }
  };

  // 2. CARREGA CATEGORIAS DO BANCO DE DADOS
  const loadCategories = async () => {
    try {
      const response = await api.get("categorias"); // 👈 GET /api/categorias
      const data = response.data.data || response.data;
      setCategories(
        data.length > 0
          ? data
          : ["Industrial", "Pneumática", "Logística", "Elétrica"],
      );
    } catch (err) {
      console.error("Erro ao carregar categorias, usando padrão:", err);
      setCategories(["Industrial", "Pneumática", "Logística", "Elétrica"]);
    }
  };

  // 3. ADICIONA NOVA CATEGORIA NO BANCO
  const handleAddCategory = async () => {
    if (newCategory && !categories.includes(newCategory)) {
      try {
        await api.post("categorias", { nome: newCategory }); // 👈 POST /api/categorias
        setCategories([...categories, newCategory]);
        setNewCategory("");
        setShowCategoryModal(false);
      } catch (err) {
        alert("Erro ao salvar nova categoria.");
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // 4. EXCLUI PRODUTOS DO BANCO DE DADOS
  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?`,
      )
    ) {
      try {
        setLoading(true);
        // Deleta em paralelo no lote usando o ID
        await Promise.all(
          selectedProducts.map((id) => api.delete(`produtos/${id}`)), // 👈 DELETE /api/produtos/{id}
        );
        setProducts(products.filter((p) => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
      } catch (err) {
        console.error("Erro ao deletar produto(s):", err);
        alert("Erro ao excluir itens do servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nome: product.nome,
      categoria: product.categoria,
      preco: product.preco,
      descricao: product.descricao,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      nome: "",
      categoria: categories[0] || "",
      preco: "",
      descricao: "",
    });
    setShowModal(true);
  };

  // 5. CADASTRA OU EDITA MÁQUINA NO BANCO DE DADOS GLOBAL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nome: formData.nome,
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      descricao: formData.descricao,
    };

    try {
      if (editingProduct) {
        // Rota de Edição (PUT)
        await api.put(`produtos/${editingProduct.id}`, payload); // 👈 PUT /api/produtos/{id}
      } else {
        // Rota de Criação (POST)
        await api.post("produtos", payload); // 👈 POST /api/produtos
      }

      await loadProducts(); // Recarrega do banco para sincronizar todos os usuários
      setShowModal(false);
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      alert("Erro ao salvar o produto no banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="produtos-container">
      <div className="page-header">
        <h2>Gerenciar Produtos</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-category"
            disabled={loading}
          >
            <Tag size={18} />
            Nova Categoria
          </button>
          <button onClick={handleAdd} className="btn-add" disabled={loading}>
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

      {errorMessage && <div className="error-message-bar">{errorMessage}</div>}

      <div className="search-bar">
        <div className="search-input-group">
          <Search size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {selectedProducts.length > 0 && (
          <button
            onClick={handleDeleteSelected}
            className="btn-delete-selected"
            disabled={loading}
          >
            <Trash2 size={18} />
            Excluir Selecionados ({selectedProducts.length})
          </button>
        )}
      </div>

      {loading && products.length === 0 ? (
        <div className="table-loading">
          Buscando máquinas registradas no banco de dados...
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-checkbox">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                />
              </div>
              <div className="product-content">
                <h3>{product.nome}</h3>
                <span className="product-category">{product.categoria}</span>
                <p className="product-description">{product.descricao}</p>
                <div className="product-footer">
                  <span className="product-price">
                    R${" "}
                    {product.preco?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    onClick={() => handleEdit(product)}
                    className="btn-edit"
                    disabled={loading}
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Produto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingProduct ? "Editar Produto" : "Novo Produto"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Nome do Produto *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <select
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData({ ...formData, categoria: e.target.value })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Preço (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) =>
                    setFormData({ ...formData, preco: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? "Salvando..."
                    : editingProduct
                      ? "Salvar"
                      : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCategoryModal(false)}
        >
          <div
            className="modal-content small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Nova Categoria</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Nome da Categoria</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Digite o nome da categoria"
                />
              </div>
              <div className="modal-actions">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button onClick={handleAddCategory} className="btn-submit">
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;
