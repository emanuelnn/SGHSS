let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];

const perfil = localStorage.getItem("perfil") || "comum";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar permissões de acesso
  const perfil = localStorage.getItem("perfil") || "comum";
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem acessar esta página.");
    window.location.href = "dashboard.html";
    return;
  }

  atualizarEstatisticas();
  renderizarProdutos();
  verificarAlertasEstoque();

  document.getElementById("btnAcaoProduto")?.addEventListener("click", executarAcaoProduto);
});

// Definir status do estoque
function definirStatusEstoque(quantidade, minimo) {
  if (quantidade === 0) return "em-falta";
  if (quantidade <= minimo) return "baixo-estoque";
  return "saudavel";
}

// Atualizar estatísticas
function atualizarEstatisticas() {
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, p) => sum + (p.quantidade || 0), 0);

  const emFalta = produtos.filter(p => p.quantidade < p.estoqueMinimo).length;

  const baixoEstoque = produtos.filter(p => 
    p.quantidade >= p.estoqueMinimo && 
    p.quantidade <= p.estoqueMinimo * 1.2
  ).length;

  // Atualiza na tela
  document.getElementById("totalProdutos").textContent = totalProdutos;
  document.getElementById("totalEstoque").textContent = totalEstoque.toLocaleString();
  document.getElementById("baixoEstoque").textContent = baixoEstoque;
  document.getElementById("emFalta").textContent = emFalta;
}


// Renderizar produtos
function renderizarProdutos() {
  const grid = document.getElementById("estoqueGrid");
  if (!grid) return;
  
  const perfil = localStorage.getItem("perfil") || "comum";
  
  // Verificar permissões
  if (perfil === "Paciente") {
    grid.innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-lock fa-3x text-muted mb-3"></i>
        <h5 class="text-muted">Acesso Restrito</h5>
        <p class="text-muted">Pacientes não podem visualizar detalhes dos produtos.</p>
      </div>
    `;
    return;
  }
  
  const filtroCategoria = document.getElementById("filtroCategoria")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value || "";
  const filtroLocalizacao = document.getElementById("filtroLocalizacao")?.value || "";
  
  let produtosFiltrados = produtos;
  
  if (filtroCategoria) {
    produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoria);
  }
  
  if (filtroStatus) {
    produtosFiltrados = produtosFiltrados.filter(p => p.status === filtroStatus);
  }
  
  if (filtroLocalizacao) {
    produtosFiltrados = produtosFiltrados.filter(p => p.localizacao === filtroLocalizacao);
  }
  
  grid.innerHTML = "";
  
  produtosFiltrados.forEach(produto => {
    const card = document.createElement("div");
    card.className = `produto-card ${produto.status}`;
    card.onclick = () => abrirDetalhesProduto(produto);
    
    const categoriaClass = {
      "medico": "categoria-medico",
      "enfermagem": "categoria-enfermagem",
      "laboratorio": "categoria-laboratorio",
      "administrativo": "categoria-administrativo"
    }[produto.categoria];
    
    const categoriaText = {
      "medico": "Material Médico",
      "enfermagem": "Material de Enfermagem",
      "laboratorio": "Laboratório",
      "administrativo": "Administrativo"
    }[produto.categoria];
    
    const statusText = {
      "saudavel": "Saudável",
      "baixo-estoque": "Baixo Estoque",
      "em-falta": "Em Falta"
    }[produto.status];
    
    const statusClass = {
      "saudavel": "estoque-saudavel",
      "baixo-estoque": "estoque-baixo",
      "em-falta": "estoque-em-falta"
    }[produto.status];
    
    const porcentagem = Math.min((produto.quantidade / produto.estoqueMinimo) * 100, 100);
    
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-0">${produto.nome}</h6>
        <span class="categoria-badge ${categoriaClass}">${categoriaText}</span>
      </div>
      
      <div class="produto-info">
        <p><i class="fas fa-map-marker-alt me-1"></i>${produto.localizacao}</p>
        <p><i class="fas fa-boxes me-1"></i>${produto.quantidade} ${produto.unidade}</p>
        <p><i class="fas fa-building me-1"></i>${produto.fornecedor}</p>
        <p><i class="fas fa-exclamation-triangle me-1"></i>Mínimo: ${produto.estoqueMinimo} ${produto.unidade}</p>
        
        <div class="estoque-bar">
          <div class="estoque-fill ${statusClass}" style="width: ${porcentagem}%"></div>
        </div>
        
        <small class="text-muted">${statusText}</small>
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  if (produtosFiltrados.length === 0) {
    grid.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-boxes fa-2x mb-2"></i><p>Nenhum produto encontrado com os filtros aplicados</p></div>';
  }
}

// Filtrar produtos
function filtrarProdutos() {
  renderizarProdutos();
}

// Limpar filtros
function limparFiltros() {
  document.getElementById("filtroCategoria").value = "";
  document.getElementById("filtroStatus").value = "";
  document.getElementById("filtroLocalizacao").value = "";
  renderizarProdutos();
}

  function calcularStatusEstoque(produto) {
    if (produto.quantidade <= 0) {
      return "em-falta";
    } else if (produto.quantidade <= produto.estoqueMinimo) {
      return "baixo-estoque";
    } else {
      return "saudavel";
    }
  }
  
// Abrir detalhes do produto
function abrirDetalhesProduto(produto) {
  const perfil = localStorage.getItem("perfil") || "comum";
  
  // Verificar permissões
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem acessar detalhes dos produtos.");
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById("produtoModal"));
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnAcao = document.getElementById("btnAcaoProduto");
  
  modalTitle.textContent = produto.nome;

  const statusEstoque = calcularStatusEstoque(produto);

  const statusText = {
    "saudavel": "Saudável",
    "baixo-estoque": "Baixo Estoque",
    "em-falta": "Em Falta"
  }[statusEstoque];

  const statusColor = {
    "saudavel": "success",
    "baixo-estoque": "warning",
    "em-falta": "danger"
  }[statusEstoque];

  const movimentacoesProduto = movimentacoes.filter(m => m.produtoId === produto.id);
  
  modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6>Informações do Produto</h6>
        <table class="table table-sm">
          <tr>
            <td><strong>Código:</strong></td>
            <td>#${produto.id}</td>
          </tr>
          <tr>
            <td><strong>Nome:</strong></td>
            <td>${produto.nome}</td>
          </tr>
          <tr>
            <td><strong>Categoria:</strong></td>
            <td>${produto.categoria}</td>
          </tr>
          <tr>
            <td><strong>Localização:</strong></td>
            <td>${produto.localizacao}</td>
          </tr>
          <tr>
            <td><strong>Fornecedor:</strong></td>
            <td>${produto.fornecedor}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="badge bg-${statusColor}">${statusText}</span></td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6>Estoque</h6>
        <table class="table table-sm">
          <tr>
            <td><strong>Quantidade Atual:</strong></td>
            <td>${produto.quantidade} ${produto.unidade}</td>
          </tr>
          <tr>
            <td><strong>Estoque Mínimo:</strong></td>
            <td>${produto.estoqueMinimo} ${produto.unidade}</td>
          </tr>
          <tr>
            <td><strong>Unidade:</strong></td>
            <td>${produto.unidade}</td>
          </tr>
          <tr>
            <td><strong>Última Movimentação:</strong></td>
            <td>${formatarData(produto.dataUltimaMovimentacao)}</td>
          </tr>
        </table>
      </div>
    </div>
    
    <div class="mt-3">
      <h6>Movimentações Recentes</h6>
      <div class="table-responsive" style="max-height: 200px;">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Responsável</th>
            </tr>
          </thead>
          <tbody>
            ${movimentacoesProduto.length > 0 ? movimentacoesProduto.slice(-5).reverse().map(mov => `
              <tr>
                <td>${formatarData(mov.data)}</td>
                <td>${mov.tipo}</td>
                <td>${mov.quantidade} ${produto.unidade}</td>
                <td>${mov.responsavel}</td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="text-center">Nenhuma movimentação registrada</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="mt-3">
      <h6>Ações Disponíveis</h6>
      <div class="btn-group w-100" role="group">
        <button class="btn btn-success" onclick="adicionarEstoque(${produto.id})">
          <i class="fas fa-plus me-1"></i>Adicionar Estoque
        </button>
        <button class="btn btn-danger" onclick="removerEstoque(${produto.id})">
          <i class="fas fa-minus me-1"></i>Remover Estoque
        </button>
        <button class="btn btn-warning" onclick="reporEstoque(${produto.id})">
          <i class="fas fa-sync me-1"></i>Repor Estoque
        </button>
      </div>
    </div>
  `;
  

if (produto.quantidade <= produto.estoqueMinimo) {
  btnAcao.textContent = "Repor Estoque";
  btnAcao.className = "btn btn-warning";
} else if (produto.quantidade <= Math.floor(produto.estoqueMinimo * 1.5)) {
  btnAcao.textContent = "Adicionar Estoque";
  btnAcao.className = "btn btn-success";
} else {
  btnAcao.textContent = "Remover Estoque";
  btnAcao.className = "btn btn-danger";
}
  btnAcao.dataset.produtoId = produto.id;
  
  modal.show();
}

// Executar ação do produto
function executarAcaoProduto() {
  const produtoId = parseInt(document.getElementById("btnAcaoProduto").dataset.produtoId);
  const produto = produtos.find(p => p.id === produtoId);
  
  if (!produto) return;
  
  if (produto.quantidade <= produto.estoqueMinimo) {
    reporEstoque(produtoId);
  } else if (produto.quantidade <= Math.floor(produto.estoqueMinimo * 1.5)) {
    adicionarEstoque(produtoId);
  } else {
    removerEstoque(produtoId);
  }

}

// Adicionar estoque
function adicionarEstoque(produtoId) {
  const perfil = localStorage.getItem("perfil") || "comum";
  
  // Verificar permissões
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem gerenciar estoque.");
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  
  if (!produto) return;
  
  const quantidade = prompt(`Informe a quantidade de ${produto.unidade} para adicionar:`);
  
  if (!quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
    alert("Quantidade inválida.");
    return;
  }
  
  const quantidadeInt = parseInt(quantidade);
  
  // Atualizar produto
  produto.quantidade += quantidadeInt;
  produto.status = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);
  produto.dataUltimaMovimentacao = new Date().toISOString();
  
  // Registrar movimentação
  movimentacoes.push({
    id: Date.now(),
    produtoId: produtoId,
    tipo: "entrada",
    quantidade: quantidadeInt,
    responsavel: perfil,
    data: new Date().toISOString(),
    observacoes: `Entrada de ${quantidadeInt} ${produto.unidade}`
  });
  
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("produtoModal")).hide();
  atualizarEstatisticas();
  renderizarProdutos();
  verificarAlertasEstoque();
  
  alert(`Estoque atualizado! ${quantidadeInt} ${produto.unidade} adicionadas.`);
}

// Remover estoque
function removerEstoque(produtoId) {
  const perfil = localStorage.getItem("perfil") || "comum";
  
  // Verificar permissões
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem gerenciar estoque.");
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  
  if (!produto) return;
  
  const quantidade = prompt(`Informe a quantidade de ${produto.unidade} para remover:`);
  
  if (!quantidade || isNaN(quantidade) || parseInt(quantidade) <= 0) {
    alert("Quantidade inválida.");
    return;
  }
  
  const quantidadeInt = parseInt(quantidade);
  
  if (quantidadeInt > produto.quantidade) {
    alert("Quantidade a remover é maior que o estoque disponível.");
    return;
  }
  
  // Atualizar produto
  produto.quantidade -= quantidadeInt;
  produto.status = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);
  produto.dataUltimaMovimentacao = new Date().toISOString();
  
  // Registrar movimentação
  movimentacoes.push({
    id: Date.now(),
    produtoId: produtoId,
    tipo: "saida",
    quantidade: quantidadeInt,
    responsavel: perfil,
    data: new Date().toISOString(),
    observacoes: `Saída de ${quantidadeInt} ${produto.unidade}`
  });
  
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("produtoModal")).hide();
  atualizarEstatisticas();
  renderizarProdutos();
  verificarAlertasEstoque();
  
  alert(`Estoque atualizado! ${quantidadeInt} ${produto.unidade} removidas.`);
}

// repor estoque
function reporEstoque(produtoId) {
  const perfil = localStorage.getItem("perfil") || "comum";
  
  // Verificar permissões
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem gerenciar estoque.");
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  
  if (!produto) return;
  
  const quantidadeNecessaria = produto.estoqueMinimo - produto.quantidade;
  
  if (quantidadeNecessaria <= 0) {
    alert("O produto não precisa de reposição.");
    return;
  }
  
  if (confirm(`Deseja repor o estoque com ${quantidadeNecessaria} ${produto.unidade}?`)) {
    adicionarEstoque(produtoId);
  }
}

// Verificar alertas de estoque
function verificarAlertasEstoque() {
  const perfil = localStorage.getItem("perfil") || "comum";
  const alertasContainer = document.getElementById("alertasContainer");
  if (!alertasContainer) return;
  
  // Verificar permissões
  if (perfil === "Paciente") {
    alertasContainer.innerHTML = "";
    return;
  }
  
  const produtosEmFalta = produtos.filter(p => p.status === "em-falta");
  const produtosBaixoEstoque = produtos.filter(p => p.status === "baixo-estoque");
  
  alertasContainer.innerHTML = "";
  
  // Alertas de falta
  produtosEmFalta.forEach(produto => {
    const alerta = document.createElement("div");
    alerta.className = "alert alert-danger alert-dismissible fade show alerta-estoque";
    alerta.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      <strong>EM FALTA:</strong> ${produto.nome} (${produto.localizacao})
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertasContainer.appendChild(alerta);
  });
  
  // Alertas de baixo estoque
  produtosBaixoEstoque.forEach(produto => {
    const alerta = document.createElement("div");
    alerta.className = "alert alert-warning alert-dismissible fade show alerta-estoque";
    alerta.innerHTML = `
      <i class="fas fa-exclamation-circle me-2"></i>
      <strong>BAIXO ESTOQUE:</strong> ${produto.nome} (${produto.quantidade}/${produto.estoqueMinimo} ${produto.unidade})
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    alertasContainer.appendChild(alerta);
  });
  
  // Remover alertas automaticamente após 5 segundos
  setTimeout(() => {
    alertasContainer.innerHTML = "";
  }, 5000);
}

// Formatar data
function formatarData(dataString) {
  if (!dataString) return "Não informada";
  
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});
}