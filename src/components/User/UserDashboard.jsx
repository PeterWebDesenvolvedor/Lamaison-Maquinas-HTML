/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Package, Users, TrendingUp, Clock, CheckCircle, XCircle, Plus, Eye } from 'lucide-react';
import SellerForm from '../Common/SellerForm';
import BuyerForm from '../Common/BuyerForm';
import UserCommissions from '../Admin/UserCommisions';
import './UserDashboard.css';

const UserDashboard = ({ user }) => {
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [mySales, setMySales] = useState([]);
  const [myCaptures, setMyCaptures] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('sales');
  const [showCatalog, setShowCatalog] = useState(false);

  useEffect(() => {
    loadMySales();
    loadMyCaptures();
    loadProducts();
  }, [user]);

  const loadMySales = () => {
    const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
    const userSales = allSales.filter(sale => sale.userId === user.id);
    setMySales(userSales);
  };

  const loadMyCaptures = () => {
    const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
    const userCaptures = allCaptures.filter(capture => capture.userId === user.id);
    setMyCaptures(userCaptures);
  };

  const loadProducts = () => {
    const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(allProducts);
  };

  const handleNewSale = (saleData) => {
    const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
    const newSale = {
      ...saleData,
      userId: user.id,
      userName: user.name,
      status: 'pendente',
      data: new Date().toISOString()
    };
    allSales.push(newSale);
    localStorage.setItem('user_sales', JSON.stringify(allSales));
    loadMySales();
    setShowSellerModal(false);
    alert('Máquina anunciada com sucesso! Aguardando aprovação do admin.');
  };

  const handleNewCapture = (captureData) => {
    const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
    const newCapture = {
      ...captureData,
      userId: user.id,
      userName: user.name,
      status: 'pendente',
      data: new Date().toISOString()
    };
    allCaptures.push(newCapture);
    localStorage.setItem('user_captures', JSON.stringify(allCaptures));
    loadMyCaptures();
    setShowBuyerModal(false);
    alert('Interessado cadastrado com sucesso! Aguardando aprovação do admin.');
  };

  const stats = {
    totalSales: mySales.length,
    activeSales: mySales.filter(s => s.status === 'ativo' || s.status === 'pendente').length,
    totalCaptures: myCaptures.length,
    activeCaptures: myCaptures.filter(c => c.status === 'ativo' || c.status === 'pendente').length
  };

  if (showCatalog) {
    return (
      <div className="user-dashboard">
        <div className="welcome-section">
          <button onClick={() => setShowCatalog(false)} className="back-btn">
            ← Voltar
          </button>
          <h2>Catálogo de Máquinas</h2>
          <p>Máquinas disponíveis para venda</p>
        </div>
        <div className="products-grid-catalog">
          {products.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>Nenhuma máquina disponível no momento</p>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className="product-card-catalog">
                <h3>{product.nome}</h3>
                <span className="category">{product.categoria}</span>
                <p className="description">{product.descricao}</p>
                <div className="product-footer">
                  <span className="price">R$ {product.preco.toLocaleString()}</span>
                  <button className="btn-interest">Tenho Interesse</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="welcome-section">
        <h2>Olá, {user.name}!</h2>
        <p>Bem-vindo ao sistema Lamaison Máquinas</p>
      </div>

      <div className="action-cards">
        <div className="action-card sell-card" onClick={() => setShowSellerModal(true)}>
          <div className="action-icon">
            <Package size={32} />
          </div>
          <h3>Quero Vender</h3>
          <p>Anuncie sua máquina para venda</p>
        </div>

        <div className="action-card capture-card" onClick={() => setShowBuyerModal(true)}>
          <div className="action-icon">
            <Users size={32} />
          </div>
          <h3>Tenho um Comprador</h3>
          <p>Indique um cliente interessado</p>
        </div>

        <div className="action-card catalog-card" onClick={() => setShowCatalog(true)}>
          <div className="action-icon">
            <Eye size={32} />
          </div>
          <h3>Ver Catálogo</h3>
          <p>Consulte máquinas disponíveis</p>
        </div>
      </div>

      <div className="stats-mini">
        <div className="stat-mini">
          <TrendingUp size={20} />
          <div>
            <span className="stat-value">{stats.totalSales}</span>
            <span className="stat-label">Máquinas Anunciadas</span>
          </div>
        </div>
        <div className="stat-mini">
          <Users size={20} />
          <div>
            <span className="stat-value">{stats.totalCaptures}</span>
            <span className="stat-label">Clientes Captados</span>
          </div>
        </div>
      </div>

      <div className="my-activities">
        <div className="tabs">
          <button 
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
          >
            <Package size={16} />
            Minhas Vendas
          </button>
          <button 
            className={`tab-btn ${activeTab === 'captures' ? 'active' : ''}`}
            onClick={() => setActiveTab('captures')}
          >
            <Users size={16} />
            Meus Clientes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'commissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('commissions')}
          >
            <TrendingUp size={16} />
            Minhas Comissões
          </button>
        </div>

        <div className="activities-list">
          {activeTab === 'sales' && (
            <>
              {mySales.length === 0 ? (
                <div className="empty-state">
                  <Package size={48} />
                  <p>Você ainda não anunciou nenhuma máquina</p>
                  <button onClick={() => setShowSellerModal(true)} className="btn-empty">
                    Anunciar Máquina
                  </button>
                </div>
              ) : (
                mySales.map(sale => (
                  <div key={sale.id} className="activity-card">
                    <div className="activity-header">
                      <h4>{sale.nomeMaquina}</h4>
                      <span className={`status-badge status-${sale.status}`}>
                        {sale.status === 'pendente' && <Clock size={12} />}
                        {sale.status === 'ativo' && <CheckCircle size={12} />}
                        {sale.status === 'recusado' && <XCircle size={12} />}
                        {sale.status === 'pendente' ? 'Aguardando' : 
                         sale.status === 'ativo' ? 'Aprovado' : 'Recusado'}
                      </span>
                    </div>
                    <div className="activity-details">
                      <div className="detail-row">
                        <span className="label">Modelo:</span>
                        <span>{sale.modelo}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Ano:</span>
                        <span>{sale.anoFabricacao}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Preço:</span>
                        <span className="price">R$ {sale.preco.toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Como soube:</span>
                        <span>{sale.divulgacao}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'captures' && (
            <>
              {myCaptures.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <p>Você ainda não cadastrou nenhum cliente interessado</p>
                  <button onClick={() => setShowBuyerModal(true)} className="btn-empty">
                    Cadastrar Cliente
                  </button>
                </div>
              ) : (
                myCaptures.map(capture => (
                  <div key={capture.id} className="activity-card">
                    <div className="activity-header">
                      <h4>{capture.nomeContato}</h4>
                      <span className={`status-badge status-${capture.status}`}>
                        {capture.status === 'pendente' && <Clock size={12} />}
                        {capture.status === 'ativo' && <CheckCircle size={12} />}
                        {capture.status === 'recusado' && <XCircle size={12} />}
                        {capture.status === 'pendente' ? 'Aguardando' : 
                         capture.status === 'ativo' ? 'Aprovado' : 'Recusado'}
                      </span>
                    </div>
                    <div className="activity-details">
                      <div className="detail-row">
                        <span className="label">Empresa:</span>
                        <span>{capture.nomeEmpresa}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Localização:</span>
                        <span>{capture.cidade}/{capture.estado}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Telefone:</span>
                        <span>{capture.telefone}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Como soube:</span>
                        <span>{capture.divulgacao}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'commissions' && (
            <UserCommissions user={user} />
          )}
        </div>
      </div>

      {showSellerModal && (
        <SellerForm 
          onClose={() => setShowSellerModal(false)}
          onSubmit={handleNewSale}
        />
      )}

      {showBuyerModal && (
        <BuyerForm 
          onClose={() => setShowBuyerModal(false)}
          onSubmit={handleNewCapture}
        />
      )}
    </div>
  );
};

export default UserDashboard;