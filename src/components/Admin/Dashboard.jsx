import React, { useState, useEffect } from 'react';
import { Users, Package, DollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    activeNegotiations: 0
  });

  useEffect(() => {
    // Carregar dados do localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    setStats({
      totalUsers: users.length,
      totalProducts: products.length,
      totalRevenue: transactions.reduce((sum, t) => sum + t.value, 0),
      activeNegotiations: Math.floor(Math.random() * 20) + 10 // Simulação
    });
  }, []);

  const cardVariants = [
    { icon: Users, title: 'Total Usuários', value: stats.totalUsers, color: '#a97421', bg: '#F8F5F0' },
    { icon: Package, title: 'Total Produtos', value: stats.totalProducts, color: '#C29C6B', bg: '#F8F5F0' },
    { icon: DollarSign, title: 'Faturamento Total', value: `R$ ${stats.totalRevenue.toLocaleString()}`, color: '#604A35', bg: '#F8F5F0' },
    { icon: TrendingUp, title: 'Negociações Ativas', value: stats.activeNegotiations, color: '#302F32', bg: '#F8F5F0' }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Visão geral do sistema</p>
      </div>

      <div className="stats-grid">
        {cardVariants.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stat-card" style={{ background: card.bg }}>
              <div className="stat-icon" style={{ color: card.color }}>
                <Icon size={32} />
              </div>
              <div className="stat-info">
                <h3>{card.title}</h3>
                <p className="stat-value">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="recent-activity">
        <h3>Atividades Recentes</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <p>Novo usuário cadastrado no sistema</p>
              <span>Há 5 minutos</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <p>Venda realizada - Máquina XR-2000</p>
              <span>Há 1 hora</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot"></div>
            <div className="activity-content">
              <p>Novo produto adicionado ao catálogo</p>
              <span>Há 3 horas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;