import React from 'react';
import { LayoutDashboard, Users, Package, DollarSign, TrendingUp, Home } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ onNavigate, currentPage, isAdmin = true }) => {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'negociacoes', label: 'Negociações', icon: TrendingUp },
  ];

  const userMenuItems = [
    { id: 'user-dashboard', label: 'Início', icon: Home },
    { id: 'produtos', label: 'Catálogo', icon: Package },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">LM</div>
        <h2>Lamaison</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;