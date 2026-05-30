import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import './AdminApprovals.css';

const AdminApprovals = () => {
  const [pendingSales, setPendingSales] = useState([]);
  const [pendingCaptures, setPendingCaptures] = useState([]);
  const [activeTab, setActiveTab] = useState('sales');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadPendingItems();
  }, []);

  const loadPendingItems = () => {
    const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
    const pendingSalesList = allSales.filter(s => s.status === 'pendente');
    setPendingSales(pendingSalesList);

    const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
    const pendingCapturesList = allCaptures.filter(c => c.status === 'pendente');
    setPendingCaptures(pendingCapturesList);
  };

  const handleApprove = (item, type) => {
    if (type === 'sale') {
      const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
      const updated = allSales.map(s => 
        s.id === item.id ? { ...s, status: 'ativo' } : s
      );
      localStorage.setItem('user_sales', JSON.stringify(updated));
      
      // Adicionar à lista de produtos
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const newProduct = {
        id: Date.now(),
        nome: item.nomeMaquina,
        categoria: 'Usuário',
        preco: item.preco,
        descricao: `${item.observacoes || ''} | Anunciado por: ${item.userName} | Modelo: ${item.modelo} | Ano: ${item.anoFabricacao} | País: ${item.pais}`,
        sellerId: item.userId,
        sellerName: item.userName
      };
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
    } else {
      const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
      const updated = allCaptures.map(c => 
        c.id === item.id ? { ...c, status: 'ativo' } : c
      );
      localStorage.setItem('user_captures', JSON.stringify(updated));
    }
    
    loadPendingItems();
    setSelectedItem(null);
    alert('Item aprovado com sucesso!');
  };

  const handleReject = (item, type) => {
    if (window.confirm('Tem certeza que deseja recusar este item?')) {
      if (type === 'sale') {
        const allSales = JSON.parse(localStorage.getItem('user_sales') || '[]');
        const updated = allSales.map(s => 
          s.id === item.id ? { ...s, status: 'recusado' } : s
        );
        localStorage.setItem('user_sales', JSON.stringify(updated));
      } else {
        const allCaptures = JSON.parse(localStorage.getItem('user_captures') || '[]');
        const updated = allCaptures.map(c => 
          c.id === item.id ? { ...c, status: 'recusado' } : c
        );
        localStorage.setItem('user_captures', JSON.stringify(updated));
      }
      
      loadPendingItems();
      setSelectedItem(null);
      alert('Item recusado!');
    }
  };

  return (
    <div className="admin-approvals">
      <div className="page-header">
        <h2>Aprovações Pendentes</h2>
        <p>Revise os itens cadastrados pelos usuários</p>
      </div>

      <div className="approval-tabs">
        <button 
          className={`approval-tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <Package size={18} />
          Máquinas para Venda
          {pendingSales.length > 0 && <span className="badge">{pendingSales.length}</span>}
        </button>
        <button 
          className={`approval-tab ${activeTab === 'captures' ? 'active' : ''}`}
          onClick={() => setActiveTab('captures')}
        >
          <Users size={18} />
          Clientes Captados
          {pendingCaptures.length > 0 && <span className="badge">{pendingCaptures.length}</span>}
        </button>
      </div>

      <div className="approvals-list">
        {activeTab === 'sales' && (
          <>
            {pendingSales.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} />
                <p>Nenhuma máquina aguardando aprovação</p>
              </div>
            ) : (
              pendingSales.map(sale => (
                <div key={sale.id} className="approval-card">
                  <div className="approval-header">
                    <h3>{sale.nomeMaquina}</h3>
                    <span className="user-name">Por: {sale.userName}</span>
                  </div>
                  <div className="approval-details">
                    <div className="detail-grid">
                      <div><strong>Modelo:</strong> {sale.modelo}</div>
                      <div><strong>Ano:</strong> {sale.anoFabricacao}</div>
                      <div><strong>País:</strong> {sale.pais}</div>
                      <div><strong>Preço:</strong> R$ {sale.preco.toLocaleString()}</div>
                      <div><strong>Empresa:</strong> {sale.nomeEmpresa}</div>
                      <div><strong>Telefone:</strong> {sale.telefone}</div>
                      <div><strong>Como soube:</strong> {sale.divulgacao}</div>
                    </div>
                    {sale.observacoes && (
                      <div className="observations">
                        <strong>Observações:</strong>
                        <p>{sale.observacoes}</p>
                      </div>
                    )}
                  </div>
                  <div className="approval-actions">
                    <button onClick={() => handleApprove(sale, 'sale')} className="btn-approve">
                      <CheckCircle size={18} />
                      Aprovar
                    </button>
                    <button onClick={() => handleReject(sale, 'sale')} className="btn-reject">
                      <XCircle size={18} />
                      Recusar
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'captures' && (
          <>
            {pendingCaptures.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} />
                <p>Nenhum cliente aguardando aprovação</p>
              </div>
            ) : (
              pendingCaptures.map(capture => (
                <div key={capture.id} className="approval-card">
                  <div className="approval-header">
                    <h3>{capture.nomeContato}</h3>
                    <span className="user-name">Por: {capture.userName}</span>
                  </div>
                  <div className="approval-details">
                    <div className="detail-grid">
                      <div><strong>Empresa:</strong> {capture.nomeEmpresa}</div>
                      <div><strong>Tipo:</strong> {capture.tipoPessoa}</div>
                      <div><strong>Cidade/UF:</strong> {capture.cidade}/{capture.estado}</div>
                      <div><strong>Telefone:</strong> {capture.telefone}</div>
                      <div><strong>Email:</strong> {capture.email || 'Não informado'}</div>
                      <div><strong>Como soube:</strong> {capture.divulgacao}</div>
                    </div>
                  </div>
                  <div className="approval-actions">
                    <button onClick={() => handleApprove(capture, 'capture')} className="btn-approve">
                      <CheckCircle size={18} />
                      Aprovar
                    </button>
                    <button onClick={() => handleReject(capture, 'capture')} className="btn-reject">
                      <XCircle size={18} />
                      Recusar
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminApprovals;