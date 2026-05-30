/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Edit2, Search, Plus, Trash2, X, Tag } from "lucide-react";
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

  const loadProducts = () => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      const initialProducts = [
        {
          id: 1,
          nome: "Máquina XR-2000",
          categoria: "Industrial",
          preco: 25000,
          descricao: "Máquina de alta performance",
        },
        {
          id: 2,
          nome: "Compressor AR-500",
          categoria: "Pneumática",
          preco: 8500,
          descricao: "Compressor industrial",
        },
        {
          id: 3,
          nome: "Esteira Transportadora",
          categoria: "Logística",
          preco: 15000,
          descricao: "Esteira modular",
        },
      ];
      setProducts(initialProducts);
      localStorage.setItem("products", JSON.stringify(initialProducts));
    }
  };

  const loadCategories = () => {
    const storedCategories = localStorage.getItem("categories");
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      const initialCategories = [
        "Industrial",
        "Pneumática",
        "Logística",
        "Elétrica",
      ];
      setCategories(initialCategories);
      localStorage.setItem("categories", JSON.stringify(initialCategories));
    }
  };

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem("products", JSON.stringify(newProducts));
  };

  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem("categories", JSON.stringify(newCategories));
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];
      saveCategories(updatedCategories);
      setNewCategory("");
      setShowCategoryModal(false);
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

  const handleDeleteSelected = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${selectedProducts.length} produto(s)?`,
      )
    ) {
      const newProducts = products.filter(
        (p) => !selectedProducts.includes(p.id),
      );
      saveProducts(newProducts);
      setSelectedProducts([]);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProduct) {
      const updatedProducts = products.map((p) =>
        p.id === editingProduct.id
          ? { ...p, ...formData, preco: parseFloat(formData.preco) }
          : p,
      );
      saveProducts(updatedProducts);
    } else {
      const newProduct = {
        id: Date.now(),
        ...formData,
        preco: parseFloat(formData.preco),
      };
      saveProducts([...products, newProduct]);
    }

    setShowModal(false);
  };

  const filteredProducts = products.filter(
    (product) =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="produtos-container">
      <div className="page-header">
        <h2>Gerenciar Produtos</h2>
        <div className="header-actions">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="btn-category"
          >
            <Tag size={18} />
            Nova Categoria
          </button>
          <button onClick={handleAdd} className="btn-add">
            <Plus size={18} />
            Novo Produto
          </button>
        </div>
      </div>

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
          >
            <Trash2 size={18} />
            Excluir Selecionados ({selectedProducts.length})
          </button>
        )}
      </div>

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
                  R$ {product.preco.toLocaleString()}
                </span>
                <button
                  onClick={() => handleEdit(product)}
                  className="btn-edit"
                >
                  <Edit2 size={16} />
                  Editar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingProduct ? "Salvar" : "Cadastrar"}
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
