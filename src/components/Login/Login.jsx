/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import "./Login.css";
import api from "../../api/axios"; // Ajuste o caminho se necessário

const Login = ({ onLogin, onVisitorAccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Bate direto na rota mapeada: http://localhost:8070/api/auth/login
      const response = await api.post("auth/login", {
        email: email,
        senha: password
      });

      // Pega o ResponseDTO gerado pelo Spring Boot
      const loginResponseDTO = response.data.data || response.data;

      setLoading(false);
      onLogin(loginResponseDTO);
    } catch (err) {
      setLoading(false);
      
      // Captura mensagens amigáveis vindas do backend
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("E-mail ou senha inválidos.");
      }
      console.error("Erro na tentativa de login:", err);
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
            <label>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Verificando..." : "Entrar"}
          </button>
          
          <button
            type="button"
            className="btn-secondary"
            onClick={onVisitorAccess}
            disabled={loading}
          >
            Acesso Visitante
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;