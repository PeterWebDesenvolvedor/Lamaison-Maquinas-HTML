// ============================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ============================================

import { Auth } from "./auth.js";
import { renderDashboard } from "./render/dashboard.js";
import { renderUsuarios } from "./render/usuarios.js";
import { renderProdutos } from "./render/produtos.js";
import { renderFinanceiro } from "./render/financeiro.js";
import { renderNegociacoes } from "./render/negociacoes.js";
import { renderAprovacoes } from "./render/aprovacoes.js";
import { renderUserDashboard, renderUserCatalog } from "./render/user.js";

export const Navigation = {
  // --------------------------------------------
  // VERIFICAR PERMISSÕES
  // --------------------------------------------
  checkPermission(requiredRole) {
    const user = Auth.getUser();
    if (!user) return false;

    // Admin tem acesso a tudo
    if (user.role === "ADMIN") return true;

    // Se não for admin, verifica se tem a role específica
    if (requiredRole === "ADMIN") return false;

    // Usuário comum só tem acesso a páginas de usuário
    return requiredRole === "USER";
  },

  // --------------------------------------------
  // MOSTRAR PÁGINAS
  // --------------------------------------------
  showLoginPage() {
    document.getElementById("loginPage").classList.add("active");
    document.getElementById("adminPage").classList.remove("active");
    document.getElementById("userPage").classList.remove("active");
  },

  showAdminPage() {
    // Verificar se o usuário é admin
    if (!this.checkPermission("ADMIN")) {
      alert("Você não tem permissão para acessar esta área!");
      this.showLoginPage();
      return;
    }

    document.getElementById("loginPage").classList.remove("active");
    document.getElementById("adminPage").classList.add("active");
    document.getElementById("userPage").classList.remove("active");

    const user = Auth.getUser();
    const userName = user?.name || user?.nome || "Administrador";
    document.getElementById("userName").textContent = userName;
    document.getElementById("pageTitle").textContent = "Dashboard";

    console.log("👤 Admin logado:", userName);

    this.loadAdminContent("admin-dashboard");
  },

  showUserPage() {
    // Verificar se o usuário está logado
    if (!Auth.isAuthenticated()) {
      this.showLoginPage();
      return;
    }

    document.getElementById("loginPage").classList.remove("active");
    document.getElementById("adminPage").classList.remove("active");
    document.getElementById("userPage").classList.add("active");

    const user = Auth.getUser();
    const userName = user?.name || user?.nome || "Usuário";
    document.getElementById("userNameUser").textContent = userName;
    document.getElementById("userPageTitle").textContent = "Início";

    console.log("👤 Usuário logado:", userName);

    this.loadUserContent("user-dashboard");
  },

  // --------------------------------------------
  // NAVEGAR
  // --------------------------------------------
  navigateTo(page) {
    // Se for página admin, verificar permissão
    if (page.startsWith("admin-")) {
      if (!this.checkPermission("ADMIN")) {
        alert("⚠️ Você não tem permissão para acessar esta página!");
        return;
      }
    }

    // Se for página de usuário, verificar se está logado
    if (page.startsWith("user-")) {
      if (!Auth.isAuthenticated()) {
        alert("⚠️ Você precisa estar logado!");
        this.showLoginPage();
        return;
      }
    }

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.dataset.page === page);
    });

    if (page.startsWith("admin-")) {
      this.loadAdminContent(page);
    } else if (page.startsWith("user-")) {
      this.loadUserContent(page);
    }
  },

  // --------------------------------------------
  // CARREGAR CONTEÚDO ADMIN
  // --------------------------------------------
  loadAdminContent(page) {
    // Verificar permissão novamente
    if (!this.checkPermission("ADMIN")) {
      document.getElementById("contentArea").innerHTML = `
                <div class="error-message">
                    ⚠️ Você não tem permissão para acessar esta área.
                </div>
            `;
      return;
    }

    const contentArea = document.getElementById("contentArea");
    const titles = {
      "admin-dashboard": "Dashboard",
      "admin-usuarios": "Usuários",
      "admin-produtos": "Produtos",
      "admin-financeiro": "Financeiro",
      "admin-negociacoes": "Negociações",
      "admin-aprovacoes": "Aprovações",
    };

    document.getElementById("pageTitle").textContent =
      titles[page] || "Dashboard";

    switch (page) {
      case "admin-dashboard":
        renderDashboard(contentArea);
        break;
      case "admin-usuarios":
        renderUsuarios(contentArea);
        break;
      case "admin-produtos":
        renderProdutos(contentArea);
        break;
      case "admin-financeiro":
        renderFinanceiro(contentArea);
        break;
      case "admin-negociacoes":
        renderNegociacoes(contentArea);
        break;
      case "admin-aprovacoes":
        renderAprovacoes(contentArea);
        break;
      default:
        contentArea.innerHTML =
          '<div class="loading-state">Página não encontrada</div>';
    }
  },

  // --------------------------------------------
  // CARREGAR CONTEÚDO USUÁRIO
  // --------------------------------------------
  loadUserContent(page) {
    // Verificar se está logado
    if (!Auth.isAuthenticated()) {
      this.showLoginPage();
      return;
    }

    const contentArea = document.getElementById("userContentArea");
    const titles = {
      "user-dashboard": "Início",
      "user-produtos": "Catálogo",
    };

    document.getElementById("userPageTitle").textContent =
      titles[page] || "Início";

    switch (page) {
      case "user-dashboard":
        renderUserDashboard(contentArea);
        break;
      case "user-produtos":
        renderUserCatalog(contentArea);
        break;
      default:
        contentArea.innerHTML =
          '<div class="loading-state">Página não encontrada</div>';
    }
  },
};
