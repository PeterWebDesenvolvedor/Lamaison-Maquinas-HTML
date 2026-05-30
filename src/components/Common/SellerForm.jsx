import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import './CommonForms.css';

const SellerForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nomeMaquina: '',
    pais: '',
    modelo: '',
    anoFabricacao: '',
    observacoes: '',
    preco: '',
    nomeEmpresa: '',
    telefone: '',
    divulgacao: 'site'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const novaVenda = {
      id: Date.now(),
      ...formData,
      preco: parseFloat(formData.preco),
      data: new Date().toISOString(),
      status: 'ativo',
      tipo: 'venda'
    };
    onSubmit(novaVenda);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Anunciar Máquina para Venda</h3>
          <button onClick={onClose} className="modal-close">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome da Máquina *</label>
              <input
                type="text"
                value={formData.nomeMaquina}
                onChange={(e) => setFormData({...formData, nomeMaquina: e.target.value})}
                placeholder="Ex: Escavadeira Hidráulica"
                required
              />
            </div>
            
            <div className="form-group">
              <label>País de Origem *</label>
              <input
                type="text"
                value={formData.pais}
                onChange={(e) => setFormData({...formData, pais: e.target.value})}
                placeholder="Ex: Alemanha, China, Brasil"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Modelo *</label>
              <input
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                placeholder="Ex: CAT 320D, PC200"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Ano de Fabricação *</label>
              <input
                type="number"
                value={formData.anoFabricacao}
                onChange={(e) => setFormData({...formData, anoFabricacao: e.target.value})}
                placeholder="Ex: 2020"
                min="1900"
                max="2024"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Preço de Venda (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.preco}
              onChange={(e) => setFormData({...formData, preco: e.target.value})}
              placeholder="Ex: 250000"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nome da Empresa *</label>
              <input
                type="text"
                value={formData.nomeEmpresa}
                onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                placeholder="Nome da sua empresa"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Telefone para Contato *</label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Observações</label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
              placeholder="Informações adicionais sobre a máquina (horas trabalhadas, manutenções, etc.)"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Como ficou sabendo da oportunidade de venda? *</label>
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
              Anunciar Máquina
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerForm;