/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Award, Users, Package, Phone } from 'lucide-react';
import { getUserCommissionInfo, COMMISSION_RULES } from '../Common/CommissionCalculator';
import './UserCommissions.css';

const UserCommissions = ({ user }) => {
  const [myCommissions, setMyCommissions] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [stats, setStats] = useState({
    asMachineBringer: 0,
    asSeller: 0,
    asBuyerBringer: 0,
    completedDeals: 0
  });

  useEffect(() => {
    loadMyCommissions();
  }, [user]);

  const loadMyCommissions = () => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    // Filtrar transações onde o usuário tem algum papel
    const userTransactions = allTransactions.filter(transaction => 
      transaction.machineBringerId === user.id ||
      transaction.sellerId === user.id ||
      transaction.buyerBringerId === user.id
    );

    const commissionsData = userTransactions.map(transaction => {
      const commissionInfo = getUserCommissionInfo(transaction, user.id);
      return {
        ...transaction,
        commissionInfo
      };
    });

    setMyCommissions(commissionsData);
    
    // Calcular estatísticas
    const total = commissionsData.reduce((sum, c) => sum + c.commissionInfo.commissionAmount, 0);
    setTotalEarned(total);
    
    setStats({
      asMachineBringer: commissionsData.filter(c => c.commissionInfo.roles.includes('machineBringer')).length,
      asSeller: commissionsData.filter(c => c.commissionInfo.roles.includes('seller')).length,
      asBuyerBringer: commissionsData.filter(c => c.commissionInfo.roles.includes('buyerBringer')).length,
      completedDeals: commissionsData.length
    });
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'machineBringer': return <Package size={16} />;
      case 'seller': return <TrendingUp size={16} />;
      case 'buyerBringer': return <Users size={16} />;
      default: return <Award size={16} />;
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case 'machineBringer': return 'Trouxe a Máquina';
      case 'seller': return 'Vendeu';
      case 'buyerBringer': return 'Trouxe o Comprador';
      default: return '';
    }
  };

  return (
    <div className="user-commissions">
      <div className="page-header">
        <h2>Minhas Comissões</h2>
        <p>Acompanhe seus ganhos e participações</p>
      </div>

      <div className="commission-summary">
        <div className="total-earned-card">
          <div className="total-icon">
            <DollarSign size={48} />
          </div>
          <div className="total-info">
            <span>Total Ganho em Comissões</span>
            <h2>R$ {totalEarned.toLocaleString()}</h2>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-commission-card">
            <Package size={24} />
            <div>
              <h4>Trouxe Máquinas</h4>
              <p>{stats.asMachineBringer} negociação(ões)</p>
              <small>Comissão: {COMMISSION_RULES.breakdown.machineBringer}%</small>
            </div>
          </div>
          <div className="stat-commission-card">
            <TrendingUp size={24} />
            <div>
              <h4>Vendeu</h4>
              <p>{stats.asSeller} negociação(ões)</p>
              <small>Comissão: {COMMISSION_RULES.breakdown.seller}%</small>
            </div>
          </div>
          <div className="stat-commission-card">
            <Users size={24} />
            <div>
              <h4>Trouxe Clientes</h4>
              <p>{stats.asBuyerBringer} negociação(ões)</p>
              <small>Comissão: {COMMISSION_RULES.breakdown.buyerBringer}%</small>
            </div>
          </div>
        </div>
      </div>

      <div className="commissions-list">
        <h3>Histórico de Comissões</h3>
        {myCommissions.length === 0 ? (
          <div className="empty-state">
            <Award size={48} />
            <p>Você ainda não possui comissões</p>
            <small>Participe de negociações para ganhar comissões!</small>
          </div>
        ) : (
          myCommissions.map(commission => (
            <div key={commission.id} className="commission-card">
              <div className="commission-header">
                <div className="product-info">
                  <h4>{commission.product}</h4>
                  <span className="date">
                    {new Date(commission.date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="commission-value">
                  <span className="label">Sua Comissão</span>
                  <span className="value">
                    R$ {commission.commissionInfo.commissionAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="commission-details">
                <div className="sale-info">
                  <div><strong>Valor da Venda:</strong> R$ {commission.value.toLocaleString()}</div>
                  <div><strong>Comprador:</strong> {commission.buyer}</div>
                </div>
                
                <div className="roles-section">
                  <strong>Seus Papéis na Negociação:</strong>
                  <div className="roles-list">
                    {commission.commissionInfo.roles.map(role => (
                      <span key={role} className="role-badge">
                        {getRoleIcon(role)}
                        {getRoleName(role)}
                      </span>
                    ))}
                  </div>
                  <div className="percentage-info">
                    <small>
                      Participação: {commission.commissionInfo.percentageEarned}% da comissão total
                    </small>
                  </div>
                </div>

                <div className="commission-breakdown">
                  <strong>Divisão da Comissão (5% do valor total):</strong>
                  <div className="breakdown-items">
                    <div className="breakdown-item">
                      <Package size={14} />
                      <span>Quem trouxe a máquina (20%):</span>
                      <span>R$ {(commission.value * 0.05 * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                      <TrendingUp size={14} />
                      <span>Quem vendeu (50%):</span>
                      <span>R$ {(commission.value * 0.05 * 0.5).toLocaleString()}</span>
                    </div>
                    <div className="breakdown-item">
                      <Users size={14} />
                      <span>Quem trouxe o comprador (30%):</span>
                      <span>R$ {(commission.value * 0.05 * 0.3).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="commission-info">
        <h4>Como funciona o sistema de comissões?</h4>
        <ul>
          <li>📊 Comissão total: 5% do valor da venda</li>
          <li>🔧 Quem trouxe a máquina: 20% da comissão</li>
          <li>💰 Quem vendeu: 50% da comissão</li>
          <li>👥 Quem trouxe o comprador: 30% da comissão</li>
          <li>⭐ Se você participou em múltiplos papéis, acumula as comissões!</li>
        </ul>
      </div>
    </div>
  );
};

export default UserCommissions;