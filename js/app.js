// ============================================
// PONTO DE ENTRADA PRINCIPAL
// ============================================

import { CONFIG } from './config.js';
import { api } from './api.js';
import { Auth } from './auth.js';
import { Data } from './data.js';
import { Navigation } from './navigation.js';

console.log('🚀 Sistema Lamaison Máquinas iniciando...');

// Inicializar dados locais (fallback)
Data.init();

// Verificar autenticação
if (Auth.init()) {
    const user = Auth.getUser();
    console.log('👤 Usuário logado:', user?.name || user?.nome || 'Usuário');
    console.log('📋 Role:', user?.role || 'USER');
    
    // Redirecionar baseado na role
    if (user.isAdmin) {
        console.log('👑 Acesso Administrador concedido');
        Navigation.showAdminPage();
    } else {
        console.log('👤 Acesso Usuário concedido');
        Navigation.showUserPage();
    }
} else {
    console.log('🔐 Nenhum usuário logado, mostrando login');
    Navigation.showLoginPage();
}

// Configurar eventos
document.addEventListener('DOMContentLoaded', () => {
    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        console.log('👋 Logout realizado');
        Auth.logout();
    });
    document.getElementById('logoutBtnUser')?.addEventListener('click', () => {
        console.log('👋 Logout realizado');
        Auth.logout();
    });

    // Navegação do sidebar - Admin
    document.querySelectorAll('#sidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            Navigation.navigateTo(page);
        });
    });
    
    // Navegação do sidebar - User
    document.querySelectorAll('#userSidebar .nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const page = item.dataset.page;
            Navigation.navigateTo(page);
        });
    });

    // Login
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');

    // Preencher campos para teste
    emailInput.value = 'admin@maisonmaquinas.com';
    passwordInput.value = 'admin123';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            errorDiv.textContent = 'Preencha todos os campos';
            errorDiv.style.display = 'block';
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'Entrando...';
        errorDiv.style.display = 'none';

        try {
            const user = await Auth.login(email, password);
            console.log('✅ Login bem-sucedido! Usuário:', user.name);
            console.log('📋 Role:', user.role);
            
            if (user.isAdmin) {
                Navigation.showAdminPage();
            } else {
                Navigation.showUserPage();
            }
        } catch (error) {
            console.error('❌ Erro no login:', error.message);
            errorDiv.textContent = error.message || 'E-mail ou senha inválidos';
            errorDiv.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Entrar';
        }
    });
});

console.log('✅ Sistema Lamaison Máquinas iniciado!');