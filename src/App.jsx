/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Login from './components/Login/Login';
import VisitorView from './components/Visitor/VisitorView';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Admin/Dashboard';
import Usuarios from './components/Admin/Usuarios';
import Produtos from './components/Admin/Produtos';
import Financeiro from './components/Admin/Financeiro';
import Negociacoes from './components/Admin/Negociacoes';
import UserDashboard from './components/User/UserDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      // Se for admin, vai para dashboard, se for comum, vai para user-dashboard
      setCurrentPage(userData.type === 'admin' ? 'dashboard' : 'user-dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage(userData.type === 'admin' ? 'dashboard' : 'user-dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  const handleVisitorAccess = () => {
    setUser({ type: 'visitor', name: 'Visitante' });
    setCurrentPage('visitor');
  };

  if (!user) {
    return <Login onLogin={handleLogin} onVisitorAccess={handleVisitorAccess} />;
  }

  if (user.type === 'visitor') {
    return <VisitorView onLogout={handleLogout} />;
  }

  // Usuário comum - apenas acesso ao UserDashboard
  if (user.type !== 'admin') {
    return (
      <Layout 
        onNavigate={() => {}} 
        currentPage="user-dashboard"
        onLogout={handleLogout}
        user={user}
        isAdmin={false}
      >
        <UserDashboard user={user} />
      </Layout>
    );
  }

  // Admin - acesso completo
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'usuarios':
        return <Usuarios />;
      case 'produtos':
        return <Produtos />;
      case 'financeiro':
        return <Financeiro />;
      case 'negociacoes':
        return <Negociacoes />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      onNavigate={setCurrentPage} 
      currentPage={currentPage}
      onLogout={handleLogout}
      user={user}
      isAdmin={true}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;