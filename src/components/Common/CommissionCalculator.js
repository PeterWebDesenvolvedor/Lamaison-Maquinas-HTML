// Sistema de cálculo de comissões
export const COMMISSION_RULES = {
  totalPercentage: 5, // 5% do valor total
  breakdown: {
    machineBringer: 20, // Quem trouxe a máquina
    seller: 50,         // Quem vendeu
    buyerBringer: 30    // Quem trouxe o comprador
  }
};

// Calcular comissão total
export const calculateTotalCommission = (saleValue) => {
  return (saleValue * COMMISSION_RULES.totalPercentage) / 100;
};

// Calcular comissão por papel
export const calculateRoleCommission = (saleValue, role) => {
  const totalCommission = calculateTotalCommission(saleValue);
  return (totalCommission * COMMISSION_RULES.breakdown[role]) / 100;
};

// Calcular comissão de um usuário baseado em seus papéis na negociação
export const calculateUserCommission = (saleValue, userRoles) => {
  if (!userRoles || userRoles.length === 0) return 0;
  
  let totalUserCommission = 0;
  userRoles.forEach(role => {
    if (COMMISSION_RULES.breakdown[role]) {
      totalUserCommission += calculateRoleCommission(saleValue, role);
    }
  });
  
  return totalUserCommission;
};

// Verificar se um usuário tem direito a comissão
export const getUserCommissionInfo = (sale, userId) => {
  const roles = [];
  
  if (sale.machineBringerId === userId) roles.push('machineBringer');
  if (sale.sellerId === userId) roles.push('seller');
  if (sale.buyerBringerId === userId) roles.push('buyerBringer');
  
  const commissionAmount = calculateUserCommission(sale.value, roles);
  const percentageEarned = roles.length > 0 ? 
    (roles.length === 3 ? 100 : 
     roles.length === 2 ? 
       (roles.includes('machineBringer') && roles.includes('seller') ? 70 :
        roles.includes('machineBringer') && roles.includes('buyerBringer') ? 50 : 80) :
       COMMISSION_RULES.breakdown[roles[0]]) : 0;
  
  return {
    roles,
    commissionAmount,
    percentageEarned,
    hasCommission: roles.length > 0
  };
};