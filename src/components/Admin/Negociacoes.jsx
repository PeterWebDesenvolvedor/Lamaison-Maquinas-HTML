/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { UserCheck, Package, TrendingUp, Clock } from 'lucide-react';
import './Negociacoes.css';

const Negociacoes = () => {
  const [activeSellers, setActiveSellers] = useState([]);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  }, []);

  const loadData = () => {
    // Simular dados de negociações ativas
    const sellers = [
      { id: 1, name: 'João Silva', type: 'Vendedor', activeProducts: 3, totalSales: 5, status: 'active' },
      { id: 2, name: 'Maria Santos', type: 'Representante', activeProducts: 2, totalSales: 3, status: 'active' },
      { id: 3, name: 'Empresa ABC', type: 'Empresa', activeProducts: 5, totalSales: 8, status: 'active' },
      { id: 4, name: 'Carlos Oliveira', type: 'Apontador', activeProducts: 1, totalSales: 2, status: 'inactive' }
    ];

    const productListings = [
      { id: 1, product: 'Máquina XR-2000', seller: 'João Silva', price: 25000, status: 'active', views: 45, interested: 3 },
      { id: 2, product: 'Compressor AR-500', seller: 'Maria Santos', price: 8500, status: 'active', views: 32, interested: 2 },
      { id: 3, product: 'Esteira Transportadora', seller: 'Empresa ABC', price: 15000, status: 'active', views: 28, interested: 1 },
      { id: 4, product: 'Motor Elétrico 50HP', seller: 'João Silva', price: 5200, status: 'active', views: 19, interested: 0 },
      { id: 5, product: 'Painel de Controle', seller: 'Carlos Oliveira', price: 3800, status: 'inactive', views: 12, interested: 0 }
    ];

    setActiveSellers(sellers);
    setListings(productListings);
  };

  const activeSellersCount = activeSellers.filter(s => s.status === 'active').length;
  const activeListingsCount = listings.filter(l => l.status === 'active').length;
  const totalInterests = listings.reduce((sum, l) => sum + l.interested, 0);

  return (
    <div className="negociacoes-container">
      <div className="page-header">
        <h2>Negociações</h2>
        <p>Acompanhe as negociações ativas e vendedores</p>
      </div>

      <div className="negotiation-stats">
        <div className="stat-card">
          <UserCheck size={32} color="#a97421" />
          <div>
            <h3>Vendedores Ativos</h3>
            <p className="stat-number">{activeSellersCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <Package size={32} color="#C29C6B" />
          <div>
            <h3>Produtos Anunciados</h3>
            <p className="stat-number">{activeListingsCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={32} color="#604A35" />
          <div>
            <h3>Total de Interessados</h3>
            <p className="stat-number">{totalInterests}</p>
          </div>
        </div>
      </div>

      <div className="sellers-section">
        <h3>Vendedores Ativos</h3>
        <div className="sellers-grid">
          {activeSellers.filter(s => s.status === 'active').map(seller => (
            <div key={seller.id} className="seller-card">
              <div className="seller-header">
                <h4>{seller.name}</h4>
                <span className="seller-type">{seller.type}</span>
              </div>
              <div className="seller-stats">
                <div className="stat">
                  <span className="label">Produtos ativos:</span>
                  <span className="value">{seller.activeProducts}</span>
                </div>
                <div className="stat">
                  <span className="label">Total vendas:</span>
                  <span className="value">{seller.totalSales}</span>
                </div>
              </div>
              <div className="seller-status active">
                <Clock size={14} />
                <span>Ativo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="listings-section">
        <h3>Produtos em Anúncio</h3>
        <div className="listings-table">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Vendedor</th>
                <th>Preço</th>
                <th>Visualizações</th>
                <th>Interessados</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {listings.filter(l => l.status === 'active').map(listing => (
                <tr key={listing.id}>
                  <td className="product-name">{listing.product}</td>
                  <td>{listing.seller}</td>
                  <td className="price">R$ {listing.price.toLocaleString()}</td>
                  <td>{listing.views}</td>
                  <td>{listing.interested}</td>
                  <td>
                    <span className="status-active">Ativo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Negociacoes;