/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import './Financeiro.css';

const Financeiro = () => {
  const [transactions, setTransactions] = useState([]);
  const [commissionStats, setCommissionStats] = useState({
    totalCommissions: 0,
    commissions: {
      machineBringer: 0,  // Quem trouxe a máquina (20%)
      buyerBringer: 0,    // Quem trouxe o comprador (30%)
      seller: 0           // Quem vendeu (50%)
    }
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    } else {
      // Dados de exemplo
      const initialTransactions = [
        {
          id: 1,
          date: '2024-01-15',
          product: 'Máquina XR-2000',
          seller: 'João Silva',
          buyer: 'Empresa ABC Ltda',
          value: 25000,
          machineBringer: 'Carlos Santos',
          buyerBringer: 'Maria Oliveira',
          commission: 1250, // 5% do valor
          commissionBreakdown: {
            machineBringer: 250, // 20%
            buyerBringer: 375,   // 30%
            seller: 625          // 50%
          }
        },
        {
          id: 2,
          date: '2024-01-20',
          product: 'Compressor AR-500',
          seller: 'Ana Paula',
          buyer: 'Indústria Souza',
          value: 8500,
          machineBringer: 'Roberto Lima',
          buyerBringer: 'Ana Paula',
          commission: 425,
          commissionBreakdown: {
            machineBringer: 85,
            buyerBringer: 127.5,
            seller: 212.5
          }
        },
        {
          id: 3,
          date: '2024-01-25',
          product: 'Esteira Transportadora',
          seller: 'Carlos Santos',
          buyer: 'Logística Rápida',
          value: 15000,
          machineBringer: 'Carlos Santos',
          buyerBringer: 'Maria Oliveira',
          commission: 750,
          commissionBreakdown: {
            machineBringer: 150,
            buyerBringer: 225,
            seller: 375
          }
        }
      ];
      setTransactions(initialTransactions);
      localStorage.setItem('transactions', JSON.stringify(initialTransactions));
    }
  };

  useEffect(() => {
    // Calcular estatísticas de comissão
    const totalCommissions = transactions.reduce((sum, t) => sum + t.commission, 0);
    const commissions = transactions.reduce((acc, t) => {
      acc.machineBringer += t.commissionBreakdown.machineBringer;
      acc.buyerBringer += t.commissionBreakdown.buyerBringer;
      acc.seller += t.commissionBreakdown.seller;
      return acc;
    }, { machineBringer: 0, buyerBringer: 0, seller: 0 });

    setCommissionStats({ totalCommissions, commissions });
  }, [transactions]);

  const groupTransactionsByDate = () => {
    const grouped = {};
    transactions.forEach(transaction => {
      const date = transaction.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(transaction);
    });
    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  return (
    <div className="financeiro-container">
      <div className="page-header">
        <h2>Financeiro</h2>
        <p>Visão geral de transações e comissões</p>
      </div>

      <div className="commission-stats">
        <div className="stat-card-total">
          <div className="stat-icon-total">
            <DollarSign size={32} />
          </div>
          <div className="stat-info-total">
            <h3>Total em Comissões</h3>
            <p className="stat-value-total">R$ {commissionStats.totalCommissions.toLocaleString()}</p>
          </div>
        </div>

        <div className="commission-breakdown">
          <h3>Distribuição de Comissões (5% do valor total)</h3>
          <div className="breakdown-grid">
            <div className="breakdown-card" style={{ background: '#a97421' }}>
              <h4>Quem trouxe a máquina</h4>
              <p className="percentage">20%</p>
              <p className="amount">R$ {commissionStats.commissions.machineBringer.toLocaleString()}</p>
            </div>
            <div className="breakdown-card" style={{ background: '#C29C6B' }}>
              <h4>Quem trouxe o comprador</h4>
              <p className="percentage">30%</p>
              <p className="amount">R$ {commissionStats.commissions.buyerBringer.toLocaleString()}</p>
            </div>
            <div className="breakdown-card" style={{ background: '#604A35' }}>
              <h4>Quem vendeu</h4>
              <p className="percentage">50%</p>
              <p className="amount">R$ {commissionStats.commissions.seller.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="transactions-section">
        <h3>Histórico de Transações</h3>
        {Object.entries(groupedTransactions)
          .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
          .map(([date, transactions]) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <h4>{new Date(date).toLocaleDateString('pt-BR')}</h4>
                <span className="date-total">
                  Total: R$ {transactions.reduce((sum, t) => sum + t.value, 0).toLocaleString()}
                </span>
              </div>
              <div className="transactions-list">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="transaction-card">
                    <div className="transaction-header">
                      <h5>{transaction.product}</h5>
                      <span className="transaction-value">
                        R$ {transaction.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="transaction-details">
                      <div className="detail-item">
                        <strong>Vendedor:</strong> {transaction.seller}
                      </div>
                      <div className="detail-item">
                        <strong>Comprador:</strong> {transaction.buyer}
                      </div>
                      <div className="detail-item">
                        <strong>Quem trouxe a máquina:</strong> {transaction.machineBringer}
                      </div>
                      <div className="detail-item">
                        <strong>Quem trouxe o comprador:</strong> {transaction.buyerBringer}
                      </div>
                    </div>
                    <div className="transaction-commission">
                      <span>Comissão (5%): R$ {transaction.commission.toLocaleString()}</span>
                      <div className="commission-details">
                        <small>Distribuição: </small>
                        <small>Máquina (20%): R$ {transaction.commissionBreakdown.machineBringer.toLocaleString()} | </small>
                        <small>Comprador (30%): R$ {transaction.commissionBreakdown.buyerBringer.toLocaleString()} | </small>
                        <small>Venda (50%): R$ {transaction.commissionBreakdown.seller.toLocaleString()}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Financeiro;