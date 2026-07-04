// ============================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// ============================================

import { CONFIG } from "./config.js";
import { api } from "./api.js";

export const Auth = {
  user: null,

  // --------------------------------------------
  // INICIALIZAR
  // --------------------------------------------
  init() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);

    if (token && userData) {
      try {
        this.user = JSON.parse(userData);
        this.user.name = this.user.name || this.user.nome || "Usuário";
        this.user.isAdmin = this.user.role === "ADMIN";
        console.log(
          "✅ Usuário autenticado:",
          this.user.name,
          "| Role:",
          this.user.role,
        );
        return true;
      } catch {
        console.warn("⚠️ Erro ao carregar usuário");
        return false;
      }
    }
    return false;
  },

  // --------------------------------------------
  // VERIFICAR PERMISSÕES
  // --------------------------------------------
  hasPermission(requiredRole) {
    if (!this.user) return false;
    // Admin tem acesso a tudo
    if (this.user.role === "ADMIN") return true;
    // Se não for admin, só tem acesso se for USER e a role exigida for USER
    return requiredRole === "USER" && this.user.role === "USER";
  },

  // --------------------------------------------
  // LOGIN
  // --------------------------------------------
  async login(email, senha) {
    try {
      console.log("🔐 Tentando login...");

      const response = await api.login(email, senha);

      console.log("📦 Resposta do login:", response);

      let userData = response.data || response;

      let user = userData.user || userData;

      const userObj = {
        id: user.id || 1,
        name: user.name || user.nome || "Usuário",
        email: user.email || email,
        role: user.role || "USER",
        tipo: user.tipo || "V",
        isAdmin: (user.role || "USER") === "ADMIN",
      };

      const accessToken =
        userData.token ||
        userData.accessToken ||
        response.token ||
        response.accessToken;

      if (!accessToken) {
        console.error("❌ Token não encontrado na resposta:", response);
        throw new Error("Token não recebido do servidor");
      }

      localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
        userData.refreshToken || response.refreshToken || "",
      );
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userObj));

      this.user = userObj;

      console.log(
        "✅ Login realizado! Usuário:",
        this.user.name,
        "| Role:",
        this.user.role,
      );
      return this.user;
    } catch (error) {
      console.error("❌ Erro no login:", error.message);

      // Fallback para login local
      const users = JSON.parse(
        localStorage.getItem(CONFIG.STORAGE_KEYS.USERS) || "[]",
      );
      const user = users.find((u) => u.email === email && u.senha === senha);

      if (user) {
        const userObj = {
          id: user.id || 1,
          name: user.name || user.nome || "Usuário",
          email: user.email || email,
          role: user.role || "USER",
          tipo: user.tipo || "V",
          isAdmin: (user.role || "USER") === "ADMIN",
        };

        localStorage.setItem(
          CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          "local-token-" + Date.now(),
        );
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
          "local-refresh-" + Date.now(),
        );
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(userObj));

        this.user = userObj;
        console.log(
          "✅ Login local realizado! Usuário:",
          this.user.name,
          "| Role:",
          this.user.role,
        );
        return this.user;
      }

      throw new Error("E-mail ou senha inválidos");
    }
  },

  // --------------------------------------------
  // LOGOUT
  // --------------------------------------------
  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    this.user = null;
    console.log("👋 Usuário desconectado");
    location.reload();
  },

  // --------------------------------------------
  // UTILIDADES
  // --------------------------------------------
  isAuthenticated() {
    return (
      !!this.user && !!localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN)
    );
  },

  isAdmin() {
    return this.user?.role === "ADMIN";
  },

  getUser() {
    return this.user;
  },
};
