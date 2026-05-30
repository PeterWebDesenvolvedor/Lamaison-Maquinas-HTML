import React, { useState } from 'react';
import { X } from 'lucide-react';
import './CommonForms.css';

const BuyerForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nomeContato: '',
    tipoPessoa: 'empresa',
    nomeEmpresa: '',
    cidade: '',
    estado: '',
    telefone: '',
    email: '',
    divulgacao: 'site'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const novoComprador = {
      id: Date.now(),
      ...formData,
      data: new Date().toISOString(),
      status: 'ativo',
      tipo: 'captacao'
    };
    onSubmit(novoComprador);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Trazer Comprador / Cliente</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Nome do Contato *</label>
            <input
              type="text"
              value={formData.nomeContato}
              onChange={(e) => setFormData({...formData, nomeContato: e.target.value})}
              placeholder="Nome completo da pessoa de contato"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Pessoa *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="empresa"
                  checked={formData.tipoPessoa === 'empresa'}
                  onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value})}
                />
                Empresa
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="autonomo"
                  checked={formData.tipoPessoa === 'autonomo'}
                  onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value})}
                />
                Autônomo
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>{formData.tipoPessoa === 'empresa' ? 'Nome da Empresa' : 'Nome/Razão Social'} *</label>
            <input
              type="text"
              value={formData.nomeEmpresa}
              onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
              placeholder={formData.tipoPessoa === 'empresa' ? "Nome da empresa" : "Nome completo"}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cidade *</label>
              <input
                type="text"
                value={formData.cidade}
                onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                placeholder="Cidade"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Estado *</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                required
              >
                <option value="">Selecione o estado</option>
                <option value="AC">Acre</option>
                <option value="AL">Alagoas</option>
                <option value="AP">Amapá</option>
                <option value="AM">Amazonas</option>
                <option value="BA">Bahia</option>
                <option value="CE">Ceará</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="GO">Goiás</option>
                <option value="MA">Maranhão</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="MG">Minas Gerais</option>
                <option value="PA">Pará</option>
                <option value="PB">Paraíba</option>
                <option value="PR">Paraná</option>
                <option value="PE">Pernambuco</option>
                <option value="PI">Piauí</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="RO">Rondônia</option>
                <option value="RR">Roraima</option>
                <option value="SC">Santa Catarina</option>
                <option value="SP">São Paulo</option>
                <option value="SE">Sergipe</option>
                <option value="TO">Tocantins</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Como ficou sabendo da oportunidade? *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="site"
                  checked={formData.divulgacao === 'site'}
                  onChange={(e) => setFormData({...formData, divulgacao: e.target.value})}
                />
                Site
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="telefone"
                  checked={formData.divulgacao === 'telefone'}
                  onChange={(e) => setFormData({...formData, divulgacao: e.target.value})}
                />
                Telefone
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="indicacao"
                  checked={formData.divulgacao === 'indicacao'}
                  onChange={(e) => setFormData({...formData, divulgacao: e.target.value})}
                />
                Indicação de Terceiro
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="email"
                  checked={formData.divulgacao === 'email'}
                  onChange={(e) => setFormData({...formData, divulgacao: e.target.value})}
                />
                Email
              </label>
            </div>
            {formData.divulgacao === 'indicacao' && (
              <input
                type="text"
                className="mt-2"
                placeholder="Nome de quem indicou"
                value={formData.indicacaoNome || ''}
                onChange={(e) => setFormData({...formData, indicacaoNome: e.target.value})}
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Cadastrar Interessado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerForm;