// ============================================
// RENDER USUÁRIO
// ============================================

import { Auth } from "../auth.js";
import { Data } from "../data.js";
import { Navigation } from "../navigation.js";

export function renderUserDashboard(container) {
  const user = Auth.getUser();
  const userName = user?.name || user?.nome || "Usuário";
  const userSales = Data.getUserSales().filter((s) => s.userId === user?.id);

  container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <h2>Olá, ${userName}!</h2>
                <p>Bem-vindo ao sistema Lamaison Máquinas</p>
            </div>
            <div class="action-cards">
                <div class="action-card sell-card" onclick="window.showSellerModal()">
                    📦
                    <h3>Quero Vender</h3>
                    <p>Anuncie sua máquina</p>
                </div>
                <div class="action-card capture-card" onclick="window.showBuyerModal()">
                    👥
                    <h3>Tenho um Comprador</h3>
                    <p>Indique um cliente</p>
                </div>
                <div class="action-card catalog-card" onclick="Navigation.navigateTo('user-produtos')">
                    👁️
                    <h3>Ver Catálogo</h3>
                    <p>Consulte máquinas</p>
                </div>
            </div>
            <div class="my-activities">
                <h3 style="padding:15px;color:var(--laranja-escuro);">Minhas Vendas</h3>
                <div class="activities-list">
                    ${
                      userSales.length === 0
                        ? '<div class="empty-state"><p>Nenhuma máquina anunciada</p></div>'
                        : userSales
                            .map(
                              (item) => `
                            <div class="activity-card">
                                <div class="activity-header">
                                    <h4>${item.nomeMaquina || ""}</h4>
                                    <span class="status-badge status-${item.status || "pendente"}">
                                        ${item.status === "pendente" ? "⏳ Aguardando" : "✅ Aprovado"}
                                    </span>
                                </div>
                                <div class="activity-details">
                                    <div><span class="label">Preço:</span> R$ ${(item.preco || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        `,
                            )
                            .join("")
                    }
                </div>
            </div>
        </div>
    `;
}

export function renderUserCatalog(container) {
  const products = Data.getProducts();

  container.innerHTML = `
        <div class="user-dashboard fade-in">
            <div class="welcome-section">
                <button class="back-btn" onclick="Navigation.navigateTo('user-dashboard')">← Voltar</button>
                <h2>Catálogo de Máquinas</h2>
            </div>
            <div class="products-grid">
                ${
                  products.length === 0
                    ? '<div class="empty-state" style="grid-column:1/-1;"><p>Nenhuma máquina disponível</p></div>'
                    : products
                        .map(
                          (product) => `
                        <div class="product-card-catalog">
                            <h3>${product.nome || ""}</h3>
                            <span class="category">${product.categoria || ""}</span>
                            <p class="description">${product.descricao || ""}</p>
                            <div class="product-footer">
                                <span class="price">R$ ${(product.preco || 0).toLocaleString()}</span>
                                <button class="btn-interest" onclick="alert('Entre em contato com o administrador!')">Tenho Interesse</button>
                            </div>
                        </div>
                    `,
                        )
                        .join("")
                }
            </div>
        </div>
    `;
}

// ============================================
// MODAIS DO USUÁRIO
// ============================================

window.showSellerModal = function () {
  const user = Auth.getUser();
  const userName = user?.name || user?.nome || "Usuário";
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "sellerModal";

  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Anunciar Máquina para Venda</h3>
                <button class="modal-close" onclick="window.closeSellerModal()">×</button>
            </div>
            <form class="modal-form" id="sellerForm">
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome da Máquina *</label>
                        <input type="text" id="sellerNomeMaquina" required />
                    </div>
                    <div class="form-group">
                        <label>País de Origem *</label>
                        <input type="text" id="sellerPais" required />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Modelo *</label>
                        <input type="text" id="sellerModelo" required />
                    </div>
                    <div class="form-group">
                        <label>Ano de Fabricação *</label>
                        <input type="number" id="sellerAno" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Preço de Venda (R$) *</label>
                    <input type="number" step="0.01" id="sellerPreco" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome da Empresa *</label>
                        <input type="text" id="sellerEmpresa" required />
                    </div>
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="sellerTelefone" required />
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea id="sellerObservacoes" rows="3"></textarea>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="window.closeSellerModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">Anunciar Máquina</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document.getElementById("sellerForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      id: Date.now(),
      nomeMaquina: document.getElementById("sellerNomeMaquina").value,
      pais: document.getElementById("sellerPais").value,
      modelo: document.getElementById("sellerModelo").value,
      anoFabricacao: document.getElementById("sellerAno").value,
      preco: parseFloat(document.getElementById("sellerPreco").value),
      nomeEmpresa: document.getElementById("sellerEmpresa").value,
      telefone: document.getElementById("sellerTelefone").value,
      observacoes: document.getElementById("sellerObservacoes").value,
      userId: user.id,
      userName: userName,
      status: "pendente",
      data: new Date().toISOString(),
    };

    const sales = Data.getUserSales();
    sales.push(data);
    Data.saveUserSales(sales);
    window.closeSellerModal();
    alert("✅ Máquina anunciada! Aguardando aprovação.");
    location.reload();
  });
};

window.closeSellerModal = function () {
  document.getElementById("sellerModal")?.remove();
};

window.showBuyerModal = function () {
  const user = Auth.getUser();
  const userName = user?.name || user?.nome || "Usuário";
  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "buyerModal";

  modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Cadastrar Cliente Interessado</h3>
                <button class="modal-close" onclick="window.closeBuyerModal()">×</button>
            </div>
            <form class="modal-form" id="buyerForm">
                <div class="form-group">
                    <label>Nome do Contato *</label>
                    <input type="text" id="buyerNome" required />
                </div>
                <div class="form-group">
                    <label>Nome da Empresa *</label>
                    <input type="text" id="buyerEmpresa" required />
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Cidade *</label>
                        <input type="text" id="buyerCidade" required />
                    </div>
                    <div class="form-group">
                        <label>Estado *</label>
                        <select id="buyerEstado" required>
                            <option value="">Selecione</option>
                            <option value="SP">SP</option>
                            <option value="RJ">RJ</option>
                            <option value="MG">MG</option>
                            <option value="PR">PR</option>
                            <option value="RS">RS</option>
                            <option value="SC">SC</option>
                            <option value="BA">BA</option>
                            <option value="DF">DF</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Telefone *</label>
                        <input type="tel" id="buyerTelefone" required />
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="buyerEmail" />
                    </div>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="window.closeBuyerModal()">Cancelar</button>
                    <button type="submit" class="btn-submit">Cadastrar Cliente</button>
                </div>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  document.getElementById("buyerForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      id: Date.now(),
      nomeContato: document.getElementById("buyerNome").value,
      nomeEmpresa: document.getElementById("buyerEmpresa").value,
      cidade: document.getElementById("buyerCidade").value,
      estado: document.getElementById("buyerEstado").value,
      telefone: document.getElementById("buyerTelefone").value,
      email: document.getElementById("buyerEmail").value,
      tipoPessoa: "empresa",
      divulgacao: "site",
      userId: user.id,
      userName: userName,
      status: "pendente",
      data: new Date().toISOString(),
    };

    const captures = Data.getUserCaptures();
    captures.push(data);
    Data.saveUserCaptures(captures);
    window.closeBuyerModal();
    alert("✅ Cliente cadastrado! Aguardando aprovação.");
    location.reload();
  });
};

window.closeBuyerModal = function () {
  document.getElementById("buyerModal")?.remove();
};
