// Configuração da API
const API_BASE_URL = "http://localhost:8070/api";

// Serviço de API
const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem("accessToken");
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      // Se for 401, tenta refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Re-tenta a requisição com o novo token
          const newToken = localStorage.getItem("accessToken");
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
          return await retryResponse.json();
        }
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro na requisição");
      }
      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
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
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      return false;
    }
  },

  // Auth
  login(email, senha) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  },

  // Usuários
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

  // Produtos
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

  // Vendas
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

  // Capturas
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

  // Transações
  getTransacoes() {
    return this.request("/transacoes");
  },
  getComissoes() {
    return this.request("/transacoes/comissoes");
  },
  getComissoesPorUsuario(usuarioId) {
    return this.request(`/transacoes/comissoes/${usuarioId}`);
  },
};

// Dados para fallback (quando o backend não está disponível)
const fallbackData = {
  usuarios: [
    {
      id: 1,
      name: "Administrador",
      email: "admin@lamaison.com",
      role: "ADMIN",
      tipo: "V",
      ativo: true,
    },
    {
      id: 2,
      name: "João Silva",
      email: "joao@lamaison.com",
      role: "USER",
      tipo: "V",
      ativo: true,
    },
    {
      id: 3,
      name: "Maria Santos",
      email: "maria@lamaison.com",
      role: "USER",
      tipo: "R",
      ativo: true,
    },
    {
      id: 4,
      name: "Empresa ABC",
      email: "empresa@lamaison.com",
      role: "USER",
      tipo: "E",
      ativo: true,
    },
  ],
  produtos: [
    {
      id: 1,
      nome: "Escavadeira CAT 320D",
      categoria: "Industrial",
      preco: 250000,
      descricao: "Escavadeira em excelente estado",
      vendedorId: 2,
      vendedorNome: "João Silva",
      ativo: true,
    },
    {
      id: 2,
      nome: "Compressor Atlas Copco",
      categoria: "Pneumática",
      preco: 45000,
      descricao: "Compressor industrial",
      vendedorId: 3,
      vendedorNome: "Maria Santos",
      ativo: true,
    },
  ],
  transacoes: [
    {
      id: 1,
      produto: "Escavadeira CAT 320D",
      valor: 250000,
      vendedor: "João Silva",
      comprador: "Construção Rápida",
      comissao: 12500,
      status: "ativo",
      data: new Date().toISOString(),
    },
  ],
};

// Função para usar fallback quando a API falha
async function apiWithFallback(apiCall, fallbackKey) {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.warn(`API indisponível, usando fallback para ${fallbackKey}`);
    return { data: fallbackData[fallbackKey] || [] };
  }
}
