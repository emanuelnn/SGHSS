let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let movimentacoes = JSON.parse(localStorage.getItem("movimentacoes")) || [];
let retiradas = JSON.parse(localStorage.getItem("retiradas")) || [];

const perfil = localStorage.getItem("perfil") || "comum";

document.addEventListener("DOMContentLoaded", () => {
  // Verificar permissões de acesso
  const perfil = localStorage.getItem("perfil") || "comum";
  const perfisPermitidos = ["Administrador", "Médico", "Enfermeiro(a)", "Enfermeiro"];
  
  if (!perfisPermitidos.includes(perfil)) {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem acessar esta página.");
    window.location.href = "dashboard.html";
    return;
  }

  atualizarEstatisticas();
  renderizarProdutos();
  popularSelectProdutos();
  renderizarHistoricoRetiradas();
 
  // Event listeners
  document.getElementById("filtroCategoria")?.addEventListener("change", filtrarProdutos);
  document.getElementById("filtroStatus")?.addEventListener("change", filtrarProdutos);
  document.getElementById("filtroBusca")?.addEventListener("input", filtrarProdutos);
  
  document.getElementById("formRetirada")?.addEventListener("submit", registrarRetirada);
  
  // Popular filtros
  popularFiltros();
});

// Função para popular select de produtos na aba de retiradas
function popularSelectProdutos() {
  const select = document.getElementById("produtoRetirada");
  if (!select) return;
  
  select.innerHTML = '<option value="">Selecione o produto</option>';
  
  produtos.forEach(produto => {
    if (produto.quantidade > 0) {
      const option = document.createElement("option");
      option.value = produto.id;
      option.textContent = `${produto.nome} (${produto.quantidade} ${produto.unidade} disponíveis)`;
      select.appendChild(option);
    }
  });
}

// Popular filtros
function popularFiltros() {
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroStatus = document.getElementById("filtroStatus");
  
  if (filtroCategoria) {
    filtroCategoria.addEventListener("change", filtrarProdutos);
  }
  
  if (filtroStatus) {
    filtroStatus.addEventListener("change", filtrarProdutos);
  }
}

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

  const emFalta = produtos.filter(p => p.quantidade <= p.estoqueMinimo).length;

  const baixoEstoque = produtos.filter(p => 
    p.quantidade > p.estoqueMinimo && 
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
  
  const filtroCategoria = document.getElementById("filtroCategoria")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value || "";
  const filtroBusca = document.getElementById("filtroBusca")?.value || "";
  
  let produtosFiltrados = produtos;
  
  if (filtroCategoria) {
    produtosFiltrados = produtosFiltrados.filter(p => p.categoria === filtroCategoria);
  }
  
  if (filtroStatus) {
    produtosFiltrados = produtosFiltrados.filter(p => {
      const status = definirStatusEstoque(p.quantidade, p.estoqueMinimo);
      return status === filtroStatus;
    });
  }
  
  if (filtroBusca) {
    produtosFiltrados = produtosFiltrados.filter(p => 
      p.nome.toLowerCase().includes(filtroBusca.toLowerCase())
    );
  }
  
  grid.innerHTML = "";
  
  produtosFiltrados.forEach(produto => {
    const statusEstoque = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);
    
    const statusText = {
      "saudavel": "Saudável",
      "baixo-estoque": "Baixo Estoque",
      "em-falta": "Em Falta"
    }[statusEstoque];
    
    const statusClass = {
      "saudavel": "estoque-saudavel",
      "baixo-estoque": "estoque-baixo",
      "em-falta": "estoque-em-falta"
    }[statusEstoque];
    
    const porcentagem = Math.min((produto.quantidade / Math.max(produto.estoqueMinimo, 1)) * 100, 100);
    
    const card = document.createElement("div");
    card.className = `produto-card ${statusClass}`;
    card.onclick = () => abrirDetalhesProduto(produto);
    
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h6 class="mb-0">${produto.nome}</h6>
        <span class="categoria-badge">${produto.categoria}</span>
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
  document.getElementById("filtroBusca").value = "";
  renderizarProdutos();
}

// Abrir detalhes do produto
function abrirDetalhesProduto(produto) {
  const modal = new bootstrap.Modal(document.getElementById("produtoModal"));
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnAcao = document.getElementById("btnAcaoProduto");
  
  modalTitle.textContent = produto.nome;

  const statusEstoque = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);

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

// Salvar novo produto
function salvarNovoProduto() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const categoria = document.getElementById("categoriaProduto").value;
  const quantidade = parseInt(document.getElementById("quantidadeInicial").value);
  const unidade = document.getElementById("unidadeProduto").value;
  const estoqueMinimo = parseInt(document.getElementById("estoqueMinimo").value);
  const fornecedor = document.getElementById("fornecedorProduto").value.trim();
  const localizacao = document.getElementById("localizacaoProduto").value.trim();

  if (!nome || !categoria || !quantidade || !unidade || !estoqueMinimo || !fornecedor || !localizacao) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const novoProduto = {
    id: Date.now(),
    nome,
    categoria,
    quantidade,
    unidade,
    estoqueMinimo,
    fornecedor,
    localizacao,
    status: definirStatusEstoque(quantidade, estoqueMinimo),
    dataUltimaMovimentacao: new Date().toISOString()
  };

  produtos.push(novoProduto);
  localStorage.setItem("produtos", JSON.stringify(produtos));

  // Registrar movimentação inicial
  movimentacoes.push({
    id: Date.now(),
    produtoId: novoProduto.id,
    tipo: "entrada",
    quantidade: quantidade,
    responsavel: perfil,
    data: new Date().toISOString(),
    observacoes: `Entrada inicial de ${quantidade} ${unidade}`
  });

  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));

  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("novoProdutoModal")).hide();
  atualizarEstatisticas();
  renderizarProdutos();
  popularSelectProdutos();

  // Limpar formulário
  document.getElementById("formNovoProduto").reset();

  alert(`Produto "${nome}" cadastrado com sucesso!`);
}

// Adicionar estoque
function adicionarEstoque(produtoId) {
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
  popularSelectProdutos();
 
  alert(`Estoque atualizado! ${quantidadeInt} ${produto.unidade} adicionadas.`);
}

// Remover estoque
function removerEstoque(produtoId) {
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
  popularSelectProdutos();
  
  alert(`Estoque atualizado! ${quantidadeInt} ${produto.unidade} removidas.`);
}

// Repor estoque
function reporEstoque(produtoId) {
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

// Registrar retirada
function registrarRetirada(e) {
  e.preventDefault();
  
  const produtoId = parseInt(document.getElementById("produtoRetirada").value);
  const quantidade = parseInt(document.getElementById("quantidadeRetirada").value);
  const motivo = document.getElementById("motivoRetirada").value;
  const observacoes = document.getElementById("observacoesRetirada").value.trim();
  
  if (!produtoId || !quantidade || !motivo) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  
  const produto = produtos.find(p => p.id === produtoId);
  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }
  
  if (quantidade > produto.quantidade) {
    alert("Quantidade a retirar é maior que o estoque disponível.");
    return;
  }
  
  // Registrar retirada
  const novaRetirada = {
    id: Date.now(),
    produtoId: produtoId,
    produtoNome: produto.nome,
    quantidade: quantidade,
    responsavel: perfil,
    motivo: motivo,
    observacoes: observacoes,
    data: new Date().toISOString()
  };
  
  retiradas.push(novaRetirada);
  localStorage.setItem("retiradas", JSON.stringify(retiradas));
  
  // Atualizar estoque do produto
  produto.quantidade -= quantidade;
  produto.status = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);
  produto.dataUltimaMovimentacao = new Date().toISOString();
  
  // Registrar movimentação
  movimentacoes.push({
    id: Date.now(),
    produtoId: produtoId,
    tipo: "saida",
    quantidade: quantidade,
    responsavel: perfil,
    data: new Date().toISOString(),
    observacoes: `Retirada: ${motivo} - ${observacoes || 'Sem observações'}`
  });
  
  localStorage.setItem("produtos", JSON.stringify(produtos));
  localStorage.setItem("movimentacoes", JSON.stringify(movimentacoes));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("produtoModal"))?.hide();
  atualizarEstatisticas();
  renderizarProdutos();
  popularSelectProdutos();
  renderizarHistoricoRetiradas();
  
  // Limpar formulário
  document.getElementById("formRetirada").reset();
  
  alert(`Retirada registrada com sucesso! ${quantidade} ${produto.unidade} de ${produto.nome}.`);
}

// Renderizar histórico de retiradas
function renderizarHistoricoRetiradas() {
  const tbody = document.getElementById("historicoRetiradas");
  const nenhumaRetirada = document.getElementById("nenhumaRetirada");
  
  if (!tbody || !nenhumaRetirada) return;
  
  if (retiradas.length === 0) {
    tbody.innerHTML = "";
    nenhumaRetirada.style.display = "block";
    return;
  }
  
  nenhumaRetirada.style.display = "none";
  
  tbody.innerHTML = retiradas.slice(-10).reverse().map(retirada => `
    <tr>
      <td>${formatarData(retirada.data)}</td>
      <td>${retirada.produtoNome}</td>
      <td>${retirada.quantidade}</td>
      <td>${retirada.responsavel}</td>
      <td>${retirada.motivo}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="excluirRetirada(${retirada.id})" title="Excluir">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

// Excluir retirada
function excluirRetirada(retiradaId) {
  if (!confirm("Tem certeza que deseja excluir esta retirada?")) return;
  
  const retirada = retiradas.find(r => r.id === retiradaId);
  if (!retirada) return;
  
  // Reabastecer o estoque
  const produto = produtos.find(p => p.id === retirada.produtoId);
  if (produto) {
    produto.quantidade += retirada.quantidade;
    produto.status = definirStatusEstoque(produto.quantidade, produto.estoqueMinimo);
    produto.dataUltimaMovimentacao = new Date().toISOString();
    
    localStorage.setItem("produtos", JSON.stringify(produtos));
  }
  
  // Remover retirada
  retiradas = retiradas.filter(r => r.id !== retiradaId);
  localStorage.setItem("retiradas", JSON.stringify(retiradas));
  
  // Atualizar interface
  atualizarEstatisticas();
  renderizarProdutos();
  popularSelectProdutos();
  renderizarHistoricoRetiradas();
  
  alert("Retirada excluída e estoque reabastecido.");
}

// Exportar relatório
function exportarRelatorio() {
  if (produtos.length === 0) {
    alert("Nenhum produto para exportar.");
    return;
  }
  
  let csv = "ID,Nome,Categoria,Quantidade,Unidade,Estoque Mínimo,Fornecedor,Localização,Status\n";
  
  produtos.forEach(produto => {
    csv += `${produto.id},"${produto.nome}","${produto.categoria}",${produto.quantidade},"${produto.unidade}",${produto.estoqueMinimo},"${produto.fornecedor}","${produto.localizacao}","${produto.status}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_estoque_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Exportar retiradas
function exportarRetiradas() {
  if (retiradas.length === 0) {
    alert("Nenhuma retirada para exportar.");
    return;
  }
  
  let csv = "ID,Produto,Quantidade,Responsável,Motivo,Observações,Data\n";
  
  retiradas.forEach(retirada => {
    csv += `${retirada.id},"${retirada.produtoNome}",${retirada.quantidade},"${retirada.responsavel}","${retirada.motivo}","${retirada.observacoes}","${formatarData(retirada.data)}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio_retiradas_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

// Formatar data
function formatarData(dataString) {
  if (!dataString) return "Não informada";
  
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR") + " " + data.toLocaleTimeString("pt-BR", {hour: '2-digit', minute: '2-digit'});
}