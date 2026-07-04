// Gerenciamento de Autenticação
const Auth = {
  user: null,

  init() {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        this.user = JSON.parse(userData);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  async login(email, senha) {
    try {
      const response = await api.login(email, senha);
      const { accessToken, refreshToken, user } = response;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      this.user = {
        ...user,
        isAdmin: user.role === "ADMIN",
      };

      return this.user;
    } catch (error) {
      // Fallback para teste sem backend
      if (email === "admin@lamaison.com" && senha === "admin123") {
        const fakeUser = {
          id: 1,
          name: "Administrador",
          email: "admin@lamaison.com",
          role: "ADMIN",
          tipo: "V",
          isAdmin: true,
        };

        localStorage.setItem("accessToken", "fake-token-" + Date.now());
        localStorage.setItem("refreshToken", "fake-refresh-" + Date.now());
        localStorage.setItem("user", JSON.stringify(fakeUser));

        this.user = fakeUser;
        return fakeUser;
      }

      if (email === "joao@lamaison.com" && senha === "vendedor123") {
        const fakeUser = {
          id: 2,
          name: "João Silva",
          email: "joao@lamaison.com",
          role: "USER",
          tipo: "V",
          isAdmin: false,
        };

        localStorage.setItem("accessToken", "fake-token-" + Date.now());
        localStorage.setItem("refreshToken", "fake-refresh-" + Date.now());
        localStorage.setItem("user", JSON.stringify(fakeUser));

        this.user = fakeUser;
        return fakeUser;
      }

      throw new Error("E-mail ou senha inválidos");
    }
  },

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    this.user = null;
    window.location.href = "/";
  },

  isAuthenticated() {
    return !!this.user && !!localStorage.getItem("accessToken");
  },

  isAdmin() {
    return this.user?.role === "ADMIN";
  },

  getUser() {
    return this.user;
  },
};
