import React, { useState } from 'react';
import { Menu, X, LayoutDashboard, Users, Package, DollarSign, TrendingUp } from 'lucide-react';
import './MobileMenu.css';

const MobileMenu = ({ onNavigate, currentPage, onLogout, user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'negociacoes', label: 'Negociações', icon: TrendingUp },
  ];

  const handleNavigate = (id) => {
    onNavigate(id);
    setIsOpen(false);
  };

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsOpen(false)}>
          <div className="mobile-menu-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="logo">LM</div>
              <h2>Lamaison</h2>
            </div>
            
            <nav className="mobile-menu-nav">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="mobile-menu-footer">
              <div className="mobile-user-info">
                <span>{user?.name || 'Usuário'}</span>
                <small>{user?.type === 'admin' ? 'Admin' : 'Comum'}</small>
              </div>
              <button onClick={onLogout} className="mobile-logout-btn">
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;