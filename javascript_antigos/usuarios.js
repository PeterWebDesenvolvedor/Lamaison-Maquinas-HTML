// Admin - Usuários
let usuariosData = [];

function renderAdminUsuarios(container) {
    container.innerHTML = `
        <div class="usuarios-container fade-in">
            <div class="page-header">
                <h2>Gerenciar Usuários</h2>
                <button class="btn-add" onclick="showUsuarioModal()">
                    <span data-icon="Plus"></span> Novo Usuário
                </button>
            </div>
            <div class="search-bar">
                <div class="search-input-group">
                    <span data-icon="Search"></span>
                    <input type="text" placeholder="Pesquisar..." id="searchUsuarios" oninput="filterUsuarios()" />
                </div>
                <button class="btn-delete-selected" onclick="deleteSelectedUsuarios()" style="display:none;" id="deleteSelectedUsuarios">
                    <span data-icon="Trash2"></span> Excluir
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="selectAllUsuarios" onchange="toggleAllUsuarios()" /></th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="usuariosTableBody">
                        <tr><td colspan="6" class="loading-state">Carregando...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    lucide.createIcons();
    loadUsuarios();
}

async function loadUsuarios() {
    try {
        const response = await api.getUsuarios();
        usuariosData = response.data || response || [];
        renderUsuariosTable(usuariosData);
    } catch (error) {
        // Fallback localStorage
        usuariosData = JSON.parse(localStorage.getItem('users') || '[]');
        renderUsuariosTable(usuariosData);
    }
}

function renderUsuariosTable(data) {
    const tbody = document.getElementById('usuariosTableBody');
    
    if (!data || data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <p>Nenhum usuário cadastrado</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = data.map(user => `
        <tr>
            <td><input type="checkbox" class="user-checkbox" value="${user.id}" onchange="updateDeleteButton()" /></td>
            <td>${user.name || ''}</td>
            <td>${user.email || ''}</td>
            <td>
                <span class="status-badge status-${user.role?.toLowerCase() || 'user'}">
                    ${user.role === 'ADMIN' ? 'Admin' : 'Comum'}
                </span>
            </td>
            <td><span class="tipo-badge">${user.tipo || 'V'}</span></td>
            <td>
                <button class="btn-edit" onclick="editUsuario(${user.id})">
                    <span data-icon="Edit2"></span>
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function filterUsuarios() {
    const search = document.getElementById('searchUsuarios').value.toLowerCase();
    const filtered = usuariosData.filter(u => 
        (u.name || '').toLowerCase().includes(search) ||
        (u.email || '').toLowerCase().includes(search)
    );
    renderUsuariosTable(filtered);
}

function toggleAllUsuarios() {
    const checked = document.getElementById('selectAllUsuarios').checked;
    document.querySelectorAll('.user-checkbox').forEach(cb => cb.checked = checked);
    updateDeleteButton();
}

function updateDeleteButton() {
    const checked = document.querySelectorAll('.user-checkbox:checked').length;
    const btn = document.getElementById('deleteSelectedUsuarios');
    btn.style.display = checked > 0 ? 'flex' : 'none';
    btn.innerHTML = `<span data-icon="Trash2"></span> Excluir (${checked})`;
    lucide.createIcons();
}

function deleteSelectedUsuarios() {
    const ids = Array.from(document.querySelectorAll('.user-checkbox:checked')).map(cb => parseInt(cb.value));
    if (!ids.length) return;
    if (!confirm(`Excluir ${ids.length} usuário(s)?`)) return;

    // Chamar API ou localStorage
    try {
        api.deleteUsuarios(ids);
        usuariosData = usuariosData.filter(u => !ids.includes(u.id));
        localStorage.setItem('users', JSON.stringify(usuariosData));
        renderUsuariosTable(usuariosData);
        updateDeleteButton();
    } catch (error) {
        // Fallback localStorage
        usuariosData = usuariosData.filter(u => !ids.includes(u.id));
        localStorage.setItem('users', JSON.stringify(usuariosData));
        renderUsuariosTable(usuariosData);
        updateDeleteButton();
    }
}

function showUsuarioModal(data = null) {
    const isEdit = !!data;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'usuarioModal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${isEdit ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                <button class="modal-close" onclick="closeUsuarioModal()">×</button>
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
                    <button type="button" class="btn-cancel" onclick="closeUsuarioModal()">Cancelar</button>
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
            loadUsuarios();
        } catch (error) {
            // Fallback localStorage
            if (isEdit) {
                const index = usuariosData.findIndex(u => u.id === data.id);
                if (index !== -1) {
                    usuariosData[index] = { ...usuariosData[index], ...formData };
                }
            } else {
                formData.id = Date.now();
                usuariosData.push(formData);
            }
            localStorage.setItem('users', JSON.stringify(usuariosData));
            closeUsuarioModal();
            renderUsuariosTable(usuariosData);
        }
    });
}

function editUsuario(id) {
    const user = usuariosData.find(u => u.id === id);
    if (user) showUsuarioModal(user);
}

function closeUsuarioModal() {
    document.getElementById('usuarioModal')?.remove();
}

// Expor funções globalmente
window.showUsuarioModal = showUsuarioModal;
window.editUsuario = editUsuario;
window.closeUsuarioModal = closeUsuarioModal;
window.deleteSelectedUsuarios = deleteSelectedUsuarios;
window.toggleAllUsuarios = toggleAllUsuarios;
window.filterUsuarios = filterUsuarios;
window.updateDeleteButton = updateDeleteButton;