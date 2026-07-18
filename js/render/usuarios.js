// ============================================
// RENDER USUÁRIOS
// ============================================

import { api } from '../api.js';
import { Data } from '../data.js';

let usuariosData = [];

export function renderUsuarios(container) {
    container.innerHTML = `
        <div class="usuarios-container fade-in">
            <div class="page-header">
                <h2>Gerenciar Usuários</h2>
                <button class="btn-add" onclick="window.showUsuarioModal()">➕ Novo Usuário</button>
            </div>
            <div class="search-bar">
                <div class="search-input-group">
                    🔍
                    <input type="text" placeholder="Pesquisar..." id="searchUsuarios" oninput="window.filterUsuarios()" />
                </div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="usuariosTableBody">
                        <tr><td colspan="5" class="loading-state">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    loadUsuariosTable();
}

export async function loadUsuariosTable() {
    const tbody = document.getElementById('usuariosTableBody');
    
    try {
        const response = await api.getUsuarios();
        usuariosData = response.data || response || [];
        renderUsuariosTable(usuariosData);
    } catch (error) {
        usuariosData = Data.getUsers();
        renderUsuariosTable(usuariosData);
    }
}

export function renderUsuariosTable(data) {
    const tbody = document.getElementById('usuariosTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">Nenhum usuário cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = data.map(user => `
        <tr>
            <td>${user.name || user.nome || ''}</td>
            <td>${user.email || ''}</td>
            <td><span class="status-badge status-${(user.role || user.estado || 'user').toLowerCase()}">${user.role === 'ADMIN' ? 'Admin' : 'Comum'}</span></td>
            <td><span class="tipo-badge">${user.tipo || 'V'}</span></td>
            <td>
                <button class="btn-edit" onclick="window.editUsuario(${user.id})">✏️</button>
                <button class="btn-delete" onclick="window.deleteUsuario(${user.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

export function filterUsuarios() {
    const search = document.getElementById('searchUsuarios').value.toLowerCase();
    const filtered = usuariosData.filter(u => 
        (u.name || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search)
    );
    renderUsuariosTable(filtered);
}

export function showUsuarioModal(data = null) {
    const isEdit = !!data;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'usuarioModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <button class="modal-close" onclick="window.closeUsuarioModal()">×</button>
            </div>
            <form class="modal-form" id="usuarioForm">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="formUsuarioNome" value="${data?.name || ''}" required />
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="formUsuarioEmail" value="${data?.email || ''}" required />
                </div>
                <div class="form-group">
                    <label>Senha ${isEdit ? '(deixe em branco para manter)' : '*'}</label>
                    <input type="password" id="formUsuarioSenha" ${isEdit ? '' : 'required'} />
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select id="formUsuarioRole">
                        <option value="USER" ${data?.role === 'USER' ? 'selected' : ''}>Comum</option>
                        <option value="ADMIN" ${data?.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo</label>
                    <select id="formUsuarioTipo">
                        <option value="V" ${data?.tipo === 'V' ? 'selected' : ''}>Vendedor</option>
                        <option value="R" ${data?.tipo === 'R' ? 'selected' : ''}>Representante</option>
                        <option value="E" ${data?.tipo === 'E' ? 'selected' : ''}>Empresa</option>
                        <option value="A" ${data?.tipo === 'A' ? 'selected' : ''}>Apontador</option>
                    </select>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="window.closeUsuarioModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">${isEdit ? 'Salvar' : 'Cadastrar'}</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('usuarioForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('formUsuarioNome').value,
            email: document.getElementById('formUsuarioEmail').value,
            senha: document.getElementById('formUsuarioSenha').value,
            role: document.getElementById('formUsuarioRole').value,
            tipo: document.getElementById('formUsuarioTipo').value
        };

        try {
            if (isEdit) {
                await api.updateUsuario(data.id, formData);
            } else {
                await api.createUsuario(formData);
            }
            closeUsuarioModal();
            loadUsuariosTable();
        } catch (error) {
            // Fallback localStorage
            if (isEdit) {
                const index = usuariosData.findIndex(u => u.id === data.id);
                if (index !== -1) {
                    usuariosData[index] = { ...usuariosData[index], ...formData };
                }
            } else {
                formData.id = Date.now();
                formData.ativo = true;
                usuariosData.push(formData);
            }
            Data.saveUsers(usuariosData);
            closeUsuarioModal();
            renderUsuariosTable(usuariosData);
        }
    });
}

export function editUsuario(id) {
    const user = usuariosData.find(u => u.id === id);
    if (user) showUsuarioModal(user);
}

export function deleteUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
        api.deleteUsuario(id);
        usuariosData = usuariosData.filter(u => u.id !== id);
        Data.saveUsers(usuariosData);
        renderUsuariosTable(usuariosData);
    } catch (error) {
        usuariosData = usuariosData.filter(u => u.id !== id);
        Data.saveUsers(usuariosData);
        renderUsuariosTable(usuariosData);
    }
}

export function closeUsuarioModal() {
    document.getElementById('usuarioModal')?.remove();
}

// Expor funções globalmente
window.showUsuarioModal = showUsuarioModal;
window.editUsuario = editUsuario;
window.deleteUsuario = deleteUsuario;
window.closeUsuarioModal = closeUsuarioModal;
window.filterUsuarios = filterUsuarios;