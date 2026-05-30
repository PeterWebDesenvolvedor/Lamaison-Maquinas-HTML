import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';
import './Layout.css';

const Layout = ({ children, onNavigate, currentPage, onLogout, user, isAdmin = true }) => {
  return (
    <div className="layout">
      <Sidebar 
        onNavigate={onNavigate} 
        currentPage={currentPage} 
        isAdmin={isAdmin}
      />
      <div className="main-content">
        <Header user={user} onLogout={onLogout} />
        <main className="content-area fade-in">{children}</main>
      </div>
      {!isAdmin && (
        <MobileMenu 
          onNavigate={onNavigate} 
          currentPage={currentPage} 
          onLogout={onLogout}
          user={user}
        />
      )}
    </div>
  );
};

export default Layout;