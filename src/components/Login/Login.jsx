/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import "./Login.css";
// username ='admin' password ='admin123'

const Login = ({ onLogin, onVisitorAccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulação de autenticação
    if (username === "admin" && password === "admin123") {
      onLogin({
        id: 1,
        username: "Admin",
        type: "admin",
        name: "Administrador",
      });
    } else if (username && password) {
      onLogin({ id: 2, username, type: "common", name: username });
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-header">
          <div className="logo-icon">LM</div>
          <h1>Lamaison Máquinas</h1>
          <p>Sistema de Gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary">
            Entrar
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onVisitorAccess}
          >
            Acesso Visitante
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
