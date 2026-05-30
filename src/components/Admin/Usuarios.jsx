import React, { useState, useEffect } from 'react';
import { Edit2, Search, Plus, Trash2, X } from 'lucide-react';
import './Usuarios.css';

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    estado: 'comum',
    tipo: 'V'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Dados iniciais
      const initialUsers = [
        { id: 1, email: 'admin@lamaison.com', password: 'admin123', estado: 'admin', tipo: 'V', nome: 'Admin' },
        { id: 2, email: 'joao@email.com', password: '123456', estado: 'comum', tipo: 'V', nome: 'João Silva' },
        { id: 3, email: 'maria@email.com', password: '123456', estado: 'comum', tipo: 'R', nome: 'Maria Santos' },
      ];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }
  };

  const saveUsers = (newUsers) => {
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)?`)) {
      const newUsers = users.filter(u => !selectedUsers.includes(u.id));
      saveUsers(newUsers);
      setSelectedUsers([]);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      estado: user.estado,
      tipo: user.tipo,
      nome: user.nome
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      estado: 'comum',
      tipo: 'V',
      nome: ''
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: formData.password || u.password }
          : u
      );
      saveUsers(updatedUsers);
    } else {
      // Adicionar
      const newUser = {
        id: Date.now(),
        ...formData,
        nome: formData.email.split('@')[0]
      };
      saveUsers([...users, newUser]);
    }
    
    setShowModal(false);
    setFormData({ email: '', password: '', estado: 'comum', tipo: 'V', nome: '' });
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoLabel = (tipo) => {
    const tipos = { 'V': 'Vendedor', 'R': 'Representante', 'E': 'Empresa/Apontador' };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="usuarios-container">
      <div className="page-header">
        <h2>Gerenciar Usuários</h2>
        <button onClick={handleAdd} className="btn-add">
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input-group">
          <Search size={20} />
          <input
            type="text"
            placeholder="Pesquisar por email ou nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {selectedUsers.length > 0 && (
          <button onClick={handleDeleteSelected} className="btn-delete-selected">
            <Trash2 size={18} />
            Excluir Selecionados ({selectedUsers.length})
          </button>
        )}
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>Nome</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>{user.nome || user.email.split('@')[0]}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`status-badge status-${user.estado}`}>
                    {user.estado === 'admin' ? 'Admin' : 'Comum'}
                  </span>
                </td>
                <td>
                  <span className="tipo-badge">
                    {getTipoLabel(user.tipo)}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleEdit(user)} className="btn-edit">
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Senha {!editingUser && '*'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required={!editingUser}
                  placeholder={editingUser ? 'Deixe em branco para manter a mesma' : ''}
                />
              </div>
              <div className="form-group">
                <label>Estado do Cadastro</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option value="comum">Comum</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo do Usuário</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="V">Vendedor (V)</option>
                  <option value="R">Representante (R)</option>
                  <option value="E">Empresa/Apontador (E)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingUser ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;