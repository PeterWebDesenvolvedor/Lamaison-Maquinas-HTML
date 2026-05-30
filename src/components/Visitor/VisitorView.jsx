/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Package, Search, Filter, LogOut } from "lucide-react";
import "./VisitorView.css";

const VisitorView = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProducts();
    // eslint-disable-next-line react-hooks/immutability
    loadCategories();
  }, []);

  const loadProducts = () => {
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }
  };

  const loadCategories = () => {
    const storedCategories = localStorage.getItem("categories");
    if (storedCategories) {
      setCategories(["todos", ...JSON.parse(storedCategories)]);
    } else {
      setCategories(["todos", "Industrial", "Pneumática", "Logística"]);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.nome
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "todos" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="visitor-container">
      <header className="visitor-header">
        <div className="logo-section">
          <div className="logo">LM</div>
          <h1>Lamaison Máquinas</h1>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={18} />
          Voltar ao Login
        </button>
      </header>

      <div className="visitor-hero">
        <h2>Catálogo de Máquinas</h2>
        <p>Explore nosso catálogo completo de equipamentos industriais</p>
      </div>

      <div className="visitor-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Pesquisar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "todos" ? "Todas Categorias" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="visitor-products">
        {filteredProducts.length === 0 ? (
          <div className="no-results">
            <Package size={48} />
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card-visitor">
                <div className="product-image-placeholder">
                  <Package size={48} />
                </div>
                <div className="product-info">
                  <h3>{product.nome}</h3>
                  <span className="category">{product.categoria}</span>
                  <p className="description">{product.descricao}</p>
                  <div className="product-footer">
                    <span className="price">
                      R$ {product.preco.toLocaleString()}
                    </span>
                    <button className="btn-interest">Tenho Interesse</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="visitor-footer">
        <p>&copy; 2024 Lamaison Máquinas - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default VisitorView;
