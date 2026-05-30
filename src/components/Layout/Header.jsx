// import React from 'react';
import { LogOut, User } from 'lucide-react';
import './Header.css';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-left">
        <h1>Bem-vindo, {user?.name || 'Usuário'}</h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <User size={18} />
          <span>{user?.type === 'admin' ? 'Administrador' : 'Usuário'}</span>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;