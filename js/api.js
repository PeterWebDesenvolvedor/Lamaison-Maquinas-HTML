// ============================================
// SERVIÇO DE API - REQUISIÇÕES HTTP
// ============================================

import { API_BASE_URL, CONFIG } from "./config.js";
import { Auth } from "./auth.js";

export const api = {
  // --------------------------------------------
  // REQUISIÇÃO BASE
  // --------------------------------------------
  async request(endpoint, options = {}) {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const url = `${API_BASE_URL}${cleanEndpoint}`;
      console.log(`📡 ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Token expirado
      if (response.status === 401) {
        console.log("🔄 Token expirado, tentando refresh...");
        const refreshed = await this.refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem(
            CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          );
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...options,
            headers,
          });
          const retryData = await retryResponse.json();
          if (!retryResponse.ok) {
            throw new Error(retryData.message || "Erro na requisição");
          }
          return retryData;
        } else {
          Auth.logout();
          throw new Error("Sessão expirada. Faça login novamente.");
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(
          `❌ Erro ${response.status}:`,
          errorData.message || response.statusText,
        );
        throw new Error(errorData.message || `Erro ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Erro na requisição:", error.message);

      // Se for erro de rede ou 404, tenta localStorage como fallback
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("404")
      ) {
        console.warn(
          "⚠️ Backend indisponível, usando localStorage como fallback",
        );
        return this.getFallbackData(endpoint);
      }
      throw error;
    }
  },

  // --------------------------------------------
  // FALLBACK PARA LOCALSTORAGE
  // --------------------------------------------
  getFallbackData(endpoint) {
    console.log("📦 Usando dados do localStorage (fallback)");

    const fallbackMap = {
      "/auth/login": () => null,
      "/usuarios": () =>
        JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.USERS) || "[]"),
      "/produtos": () =>
        JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.PRODUCTS) || "[]"),
      "/vendas": () =>
        JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS) || "[]",
        ),
      "/vendas/pendentes": () =>
        JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SALES) || "[]",
        ).filter((s) => s.status === "pendente"),
      "/capturas": () =>
        JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.USER_CAPTURES) || "[]",
        ),
      "/capturas/pendentes": () =>
        JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.USER_CAPTURES) || "[]",
        ).filter((c) => c.status === "pendente"),
      "/transacoes": () =>
        JSON.parse(
          localStorage.getItem(CONFIG.STORAGE_KEYS.TRANSACTIONS) || "[]",
        ),
    };

    for (const [key, getData] of Object.entries(fallbackMap)) {
      if (endpoint === key || endpoint.startsWith(key + "/")) {
        const data = getData();
        return { data: data };
      }
    }
    return { data: [] };
  },

  // --------------------------------------------
  // REFRESH TOKEN
  // --------------------------------------------
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem(
        CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      );
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
          data.accessToken,
        );
        localStorage.setItem(
          CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
          data.refreshToken,
        );
        console.log("✅ Token renovado com sucesso!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Refresh token error:", error);
      return false;
    }
  },

  // --------------------------------------------
  // AUTH
  // --------------------------------------------
  async login(email, senha) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    return response;
  },

  // --------------------------------------------
  // USUÁRIOS (CRUD)
  // --------------------------------------------
  getUsuarios() {
    return this.request("/usuarios");
  },
  createUsuario(data) {
    return this.request("/usuarios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateUsuario(id, data) {
    return this.request(`/usuarios/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteUsuario(id) {
    return this.request(`/usuarios/${id}`, {
      method: "DELETE",
    });
  },
  deleteUsuarios(ids) {
    return this.request("/usuarios", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },

  // --------------------------------------------
  // PRODUTOS (CRUD)
  // --------------------------------------------
  getProdutos() {
    return this.request("/produtos");
  },
  createProduto(data) {
    return this.request("/produtos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateProduto(id, data) {
    return this.request(`/produtos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteProduto(id) {
    return this.request(`/produtos/${id}`, {
      method: "DELETE",
    });
  },
  deleteProdutos(ids) {
    return this.request("/produtos", {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    });
  },

  // --------------------------------------------
  // VENDAS
  // --------------------------------------------
  getVendas() {
    return this.request("/vendas");
  },
  getVendasPendentes() {
    return this.request("/vendas/pendentes");
  },
  getVendasPorUsuario(usuarioId) {
    return this.request(`/vendas/usuario/${usuarioId}`);
  },
  createVenda(data) {
    return this.request("/vendas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  aprovarVenda(id) {
    return this.request(`/vendas/${id}/aprovar`, {
      method: "PATCH",
    });
  },
  recusarVenda(id) {
    return this.request(`/vendas/${id}/recusar`, {
      method: "PATCH",
    });
  },

  // --------------------------------------------
  // CAPTURAS
  // --------------------------------------------
  getCapturas() {
    return this.request("/capturas");
  },
  getCapturasPendentes() {
    return this.request("/capturas/pendentes");
  },
  getCapturasPorUsuario(usuarioId) {
    return this.request(`/capturas/usuario/${usuarioId}`);
  },
  createCaptura(data) {
    return this.request("/capturas", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  aprovarCaptura(id) {
    return this.request(`/capturas/${id}/aprovar`, {
      method: "PATCH",
    });
  },
  recusarCaptura(id) {
    return this.request(`/capturas/${id}/recusar`, {
      method: "PATCH",
    });
  },

  // --------------------------------------------
  // TRANSAÇÕES
  // --------------------------------------------
  getTransacoes() {
    return this.request("/transacoes");
  },
  getComissoes() {
    return this.request("/transacoes/comissoes");
  },
  getComissoesPorUsuario(usuarioId) {
    return this.request(`/transacoes/comissoes/${usuarioId}`);
  },
  // Adicione estas funções na classe api, na seção de categorias:

  // --------------------------------------------
  // CATEGORIAS
  // --------------------------------------------
  getCategorias() {
    return this.request("/categorias");
  },
  createCategoria(data) {
    return this.request("/categorias", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  deleteCategoria(id) {
    return this.request(`/categorias/${id}`, {
      method: "DELETE",
    });
  },
};
