/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import Login from "./components/Login/Login";
import VisitorView from "./components/Visitor/VisitorView";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Admin/Dashboard";
import Usuarios from "./components/Admin/Usuarios";
import Produtos from "./components/Admin/Produtos";
import Financeiro from "./components/Admin/Financeiro";
import Negociacoes from "./components/Admin/Negociacoes";
import UserDashboard from "./components/User/UserDashboard";

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // CORREÇÃO 1: Padroniza a checagem ao recarregar a página (localStorage)
      const userRole = userData.role || userData.type || "";
      const isAdmin = userRole.toUpperCase() === "ADMIN";

      setCurrentPage(isAdmin ? "dashboard" : "user-dashboard");
    }
  }, []);

  const handleLogin = (userData) => {
    // CORREÇÃO 2: Criamos um objeto padronizado contendo tanto 'role' quanto 'type'
    // Isso garante compatibilidade com o resto do código que usa user.type
    const userRole = userData.role || userData.type || "";
    const formattedUser = {
      ...userData,
      type: userRole.toLowerCase(), // Garante que vira 'admin' ou 'common' em minúsculo
      role: userRole.toUpperCase(), // Garante que vira 'ADMIN' em maiúsculo
    };

    setUser(formattedUser);
    localStorage.setItem("user", JSON.stringify(formattedUser));

    const isAdmin = userRole.toUpperCase() === "ADMIN";
    setCurrentPage(isAdmin ? "dashboard" : "user-dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("dashboard");
  };

  const handleVisitorAccess = () => {
    setUser({ type: "visitor", role: "VISITOR", name: "Visitante" });
    setCurrentPage("visitor");
  };

  if (!user) {
    return (
      <Login onLogin={handleLogin} onVisitorAccess={handleVisitorAccess} />
    );
  }

  if (user.type === "visitor") {
    return <VisitorView onLogout={handleLogout} />;
  }

  // CORREÇÃO 3: Agora a checagem funciona perfeitamente porque garantimos
  // que o formattedUser.type foi salvo em letras minúsculas ('admin')
  if (user.type !== "admin") {
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
      case "dashboard":
        return <Dashboard />;
      case "usuarios":
        return <Usuarios />;
      case "produtos":
        return <Produtos />;
      case "financeiro":
        return <Financeiro />;
      case "negociacoes":
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
