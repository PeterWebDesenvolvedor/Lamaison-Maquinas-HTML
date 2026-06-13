/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Edit2, Search, Plus, Trash2, X } from "lucide-react";
import api from "../../api/axios"; // Certifique-se de que o caminho até o seu Axios.js está correto
import "./Usuarios.css";

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    password: "",
    estado: "comum",
    tipo: "V",
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadUsers();
  }, []);

  // 1. CARREGAR DO BACKEND (Substitui o localStorage)
  const loadUsers = async () => {
    setLoading(true);
    try {
      // Ajuste para a sua rota GET de listagem no Java (ex: /auth/usuarios ou /api/usuarios)
      const response = await api.get("auth/usuarios");
      const data = response.data.data || response.data;
      setUsers(data);
    } catch (err) {
      console.error("Erro ao carregar usuários do backend:", err);
      setErrorMessage("Não foi possível carregar a lista de usuários.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // 2. EXCLUIR NO BACKEND
  const handleDeleteSelected = async () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir ${selectedUsers.length} usuário(s)?`,
      )
    ) {
      try {
        setLoading(true);
        // Exclui um por um no loop ou manda a lista, dependendo do seu Java.
        // Aqui fazemos em lote por requisições paralelas:
        await Promise.all(
          selectedUsers.map((id) => api.delete(`auth/usuarios/${id}`)),
        );

        // Atualiza a lista local removendo os excluídos
        setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
        setSelectedUsers([]);
      } catch (err) {
        console.error("Erro ao deletar usuários:", err);
        alert("Erro ao excluir usuário(s) no servidor.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Senha em branco por segurança ao editar
      estado: user.role?.toLowerCase() === "admin" ? "admin" : "comum",
      tipo: user.tipo || "V",
      nome: user.name || user.nome || "",
    });
    setErrorMessage("");
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      password: "",
      estado: "comum",
      tipo: "V",
      nome: "",
    });
    setErrorMessage("");
    setShowModal(true);
  };

  // 3. ENVIAR CRIAÇÃO / ATUALIZAÇÃO PARA O JAVA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Mapeia os campos para o formato que o seu banco/Java espera (Campos em português)
    const payload = {
      name: formData.nome || formData.email.split("@")[0],
      email: formData.email,
      senha: formData.password,
      role: formData.estado.toUpperCase(), // 'ADMIN' ou 'COMUM'
      tipo: formData.tipo,
    };

    try {
      if (editingUser) {
        // Rota de Edição (PUT)
        await api.put(`auth/usuarios/${editingUser.id}`, payload);
      } else {
        // Rota de Cadastro (POST) que criamos no passo anterior
        await api.post("auth/registrar", payload);
      }

      // Recarrega a lista direto do banco de dados para garantir sincronia
      await loadUsers();
      setShowModal(false);
      setFormData({
        email: "",
        password: "",
        estado: "comum",
        tipo: "V",
        nome: "",
      });
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Erro interno do servidor ao salvar os dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const emailMatch = user.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const nomeMatch = (user.name || user.nome)
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    return emailMatch || nomeMatch;
  });

  const getTipoLabel = (tipo) => {
    const tipos = { V: "Vendedor", R: "Representante", E: "Empresa", A: "Apontador" };
    return tipos[tipo] || tipo;
  };

  return (
    <div className="usuarios-container">
      <div className="page-header">
        <h2>Gerenciar Usuários</h2>
        <button onClick={handleAdd} className="btn-add" disabled={loading}>
          <Plus size={18} />
          Novo Usuário
        </button>
      </div>

      {errorMessage && <div className="error-message-bar">{errorMessage}</div>}

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
          <button
            onClick={handleDeleteSelected}
            className="btn-delete-selected"
            disabled={loading}
          >
            <Trash2 size={18} />
            Excluir Selecionados ({selectedUsers.length})
          </button>
        )}
      </div>

      <div className="users-table">
        {loading && users.length === 0 ? (
          <div className="table-loading">
            Carregando usuários do banco de dados...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
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
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td>{user.name || user.nome || user.email.split("@")[0]}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`status-badge status-${(user.role || user.estado)?.toLowerCase()}`}
                    >
                      {(user.role || user.estado)?.toUpperCase() === "ADMIN"
                        ? "Admin"
                        : "Comum"}
                    </span>
                  </td>
                  <td>
                    <span className="tipo-badge">
                      {getTipoLabel(user.tipo)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      className="btn-edit"
                      disabled={loading}
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? "Editar Usuário" : "Novo Usuário"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {errorMessage && (
                <div className="modal-error">{errorMessage}</div>
              )}

              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  placeholder="Nome do usuário"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Senha {!editingUser && "*"}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  placeholder={
                    editingUser ? "Deixe em branco para manter a mesma" : ""
                  }
                />
              </div>
              <div className="form-group">
                <label>Estado do Cadastro</label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({ ...formData, estado: e.target.value })
                  }
                >
                  <option value="comum">Comum</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tipo do Usuário</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                >
                  <option value="V">Vendedor (V)</option>
                  <option value="R">Representante (R)</option>
                  <option value="E">Empresa (E)</option>
                  <option value="A">Apontador (A)</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading
                    ? "Salvando..."
                    : editingUser
                      ? "Salvar"
                      : "Cadastrar"}
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
