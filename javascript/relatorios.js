// Relatórios Financeiros
let transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];
let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
let exames = JSON.parse(localStorage.getItem("exames")) || [];
let teleconsultas = JSON.parse(localStorage.getItem("teleconsultas")) || [];
let internacoes = JSON.parse(localStorage.getItem("internacoes")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

const perfil = localStorage.getItem("perfil") || "comum";

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  gerarTransacoesIniciais();
  gerarRelatorio();
  
  // Event listeners
  document.getElementById("periodo")?.addEventListener("change", gerarRelatorio);
  document.getElementById("tipoRelatorio")?.addEventListener("change", gerarRelatorio);
  document.getElementById("statusFiltro")?.addEventListener("change", gerarRelatorio);
});

// Gerar transações iniciais
function gerarTransacoesIniciais() {
  if (transacoes.length > 0) return;
  
  const hoje = new Date();
  const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
  
  // Gerar transações para consultas
  consultas.forEach((consulta, index) => {
    if (consulta.data && new Date(consulta.data) <= hoje) {
      transacoes.push({
        id: Date.now() + index,
        data: consulta.data,
        paciente: consulta.paciente,
        servico: "Consulta",
        tipo: "consulta",
        valor: 150 + Math.floor(Math.random() * 100),
        status: Math.random() > 0.2 ? "pago" : "pendente",
        descricao: `Consulta de ${consulta.especialidade}`,
        criadoEm: new Date().toISOString()
      });
    }
  });
  
  // Gerar transações para exames
  exames.forEach((exame, index) => {
    if (exame.resultado && exame.resultado !== "Aguardando") {
      transacoes.push({
        id: Date.now() + index + 1000,
        data: exame.dataAgendamento || exame.dataResultado,
        paciente: exame.paciente,
        servico: "Exame",
        tipo: "exame",
        valor: 80 + Math.floor(Math.random() * 120),
        status: Math.random() > 0.15 ? "pago" : "pendente",
        descricao: `Exame de ${exame.tipo}`,
        criadoEm: new Date().toISOString()
      });
    }
  });
  
  // Gerar transações para teleconsultas
  teleconsultas.forEach((teleconsulta, index) => {
    if (teleconsulta.status === "Concluida") {
      transacoes.push({
        id: Date.now() + index + 2000,
        data: teleconsulta.data,
        paciente: teleconsulta.paciente,
        servico: "Telemedicina",
        tipo: "telemedicina",
        valor: 100 + Math.floor(Math.random() * 80),
        status: Math.random() > 0.1 ? "pago" : "pendente",
        descricao: "Consulta online",
        criadoEm: new Date().toISOString()
      });
    }
  });
  
  // Gerar transações para internações
  internacoes.forEach((internacao, index) => {
    if (internacao.status === "ativo") {
      const diarias = 7 + Math.floor(Math.random() * 14);
      const valorDiaria = 300 + Math.floor(Math.random() * 200);
      
      transacoes.push({
        id: Date.now() + index + 3000,
        data: internacao.dataInternacao,
        paciente: internacao.paciente,
        servico: "Internação",
        tipo: "internacao",
        valor: diarias * valorDiaria,
        status: Math.random() > 0.3 ? "pago" : "pendente",
        descricao: `${diarias} diárias de internação`,
        criadoEm: new Date().toISOString()
      });
    }
  });
  
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// Gerar relatório
function gerarRelatorio() {
  const periodo = document.getElementById("periodo")?.value || "mes";
  const tipoRelatorio = document.getElementById("tipoRelatorio")?.value || "geral";
  const statusFiltro = document.getElementById("statusFiltro")?.value || "todos";
  
  // Filtrar transações
  let transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio, statusFiltro);
  
  // Atualizar métricas
  atualizarMetricas(transacoesFiltradas);
  
  // Atualizar gráficos
  atualizarGraficos(transacoesFiltradas);
  
  // Atualizar tabela
  atualizarTabela(transacoesFiltradas);
}

// Filtrar transações
function filtrarTransacoes(periodo, tipoRelatorio, statusFiltro) {
  const hoje = new Date();
  let dataInicio = new Date();
  
  // Definir período
  switch (periodo) {
    case "mes":
      dataInicio.setMonth(hoje.getMonth() - 1);
      break;
    case "trimestre":
      dataInicio.setMonth(hoje.getMonth() - 3);
      break;
    case "semestre":
      dataInicio.setMonth(hoje.getMonth() - 6);
      break;
    case "ano":
      dataInicio.setFullYear(hoje.getFullYear() - 1);
      break;
  }
  
  let filtradas = transacoes.filter(t => {
    const dataTransacao = new Date(t.data);
    const dentroDoPeriodo = dataTransacao >= dataInicio;
    const doTipo = tipoRelatorio === "geral" || t.tipo === tipoRelatorio;
    const doStatus = statusFiltro === "todos" || t.status === statusFiltro;
    
    return dentroDoPeriodo && doTipo && doStatus;
  });
  
  return filtradas;
}

// Atualizar métricas
function atualizarMetricas(transacoesFiltradas) {
  const receitaTotal = transacoesFiltradas.reduce((sum, t) => sum + t.valor, 0);
  const receitaMes = transacoesFiltradas
    .filter(t => {
      const dataTransacao = new Date(t.data);
      const mesAtual = new Date().getMonth();
      return dataTransacao.getMonth() === mesAtual;
    })
    .reduce((sum, t) => sum + t.valor, 0);
  
  const pacientesUnicos = new Set(transacoesFiltradas.map(t => t.paciente)).size;
  const ticketMedio = pacientesUnicos > 0 ? receitaTotal / pacientesUnicos : 0;
  
  document.getElementById("receitaTotal").textContent = `R$ ${receitaTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  document.getElementById("receitaMes").textContent = `R$ ${receitaMes.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
  document.getElementById("totalPacientes").textContent = pacientesUnicos;
  document.getElementById("ticketMedio").textContent = `R$ ${ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

// Atualizar gráficos
function atualizarGraficos(transacoesFiltradas) {
  // Gráfico de evolução da receita
  const ctxReceita = document.getElementById("graficoReceita")?.getContext("2d");
  if (ctxReceita) {
    // Agrupar por mês
    const receitaPorMes = {};
    
    transacoesFiltradas.forEach(t => {
      const data = new Date(t.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!receitaPorMes[chave]) {
        receitaPorMes[chave] = 0;
      }
      receitaPorMes[chave] += t.valor;
    });
    
    const labels = Object.keys(receitaPorMes).sort();
    const data = labels.map(label => receitaPorMes[label]);
    
    new Chart(ctxReceita, {
      type: 'line',
      data: {
        labels: labels.map(label => {
          const [ano, mes] = label.split('-');
          return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Receita',
          data: data,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R$ ' + value.toLocaleString('pt-BR');
              }
            }
          }
        }
      }
    });
  }
  
  // Gráfico de receita por serviço
  const ctxServicos = document.getElementById("graficoServicos")?.getContext("2d");
  if (ctxServicos) {
    const receitaPorServico = {};
    
    transacoesFiltradas.forEach(t => {
      if (!receitaPorServico[t.servico]) {
        receitaPorServico[t.servico] = 0;
      }
      receitaPorServico[t.servico] += t.valor;
    });
    
    const labels = Object.keys(receitaPorServico);
    const data = Object.values(receitaPorServico);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];
    
    new Chart(ctxServicos, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Atualizar tabela
function atualizarTabela(transacoesFiltradas) {
  const tbody = document.getElementById("tabelaTransacoes");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  // Ordenar por data (mais recente primeiro)
  const ordenadas = transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  ordenadas.forEach(transacao => {
    const row = document.createElement("tr");
    
    const statusClass = {
      "pago": "status-pago",
      "pendente": "status-pendente",
      "atrasado": "status-atrasado"
    }[transacao.status];
    
    const statusText = {
      "pago": "Pago",
      "pendente": "Pendente",
      "atrasado": "Atrasado"
    }[transacao.status];
    
    row.innerHTML = `
      <td>${formatarData(transacao.data)}</td>
      <td>${transacao.paciente}</td>
      <td>${transacao.servico}</td>
      <td>R$ ${transacao.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="verDetalheTransacao(${transacao.id})">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-outline-success" onclick="marcarComoPago(${transacao.id})">
          <i class="fas fa-check"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  if (ordenadas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Nenhuma transação encontrada</td></tr>';
  }
}

// Ver detalhe da transação
function verDetalheTransacao(id) {
  const transacao = transacoes.find(t => t.id === id);
  
  if (!transacao) return;
  
  alert(`Detalhes da Transação:\n\n` +
        `Paciente: ${transacao.paciente}\n` +
        `Serviço: ${transacao.servico}\n` +
        `Valor: R$ ${transacao.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n` +
        `Status: ${transacao.status}\n` +
        `Data: ${formatarData(transacao.data)}\n` +
        `Descrição: ${transacao.descricao}`);
}

// Marcar como pago
function marcarComoPago(id) {
  if (!confirm("Tem certeza que deseja marcar esta transação como paga?")) return;
  
  const transacao = transacoes.find(t => t.id === id);
  
  if (transacao) {
    transacao.status = "pago";
    transacao.dataPagamento = new Date().toISOString().split('T')[0];
    
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
    
    // Recarregar relatório
    gerarRelatorio();
    
    alert("Transação marcada como paga com sucesso!");
  }
}

// Exportar PDF
function exportarPDF() {
  alert("Exportação para PDF em desenvolvimento. Esta funcionalidade será implementada em breve.");
}

// Exportar Excel
function exportarExcel() {
  alert("Exportação para Excel em desenvolvimento. Esta funcionalidade será implementada em breve.");
}

// Exportar CSV
function exportarCSV() {
  const periodo = document.getElementById("periodo")?.value || "mes";
  const tipoRelatorio = document.getElementById("tipoRelatorio")?.value || "geral";
  const statusFiltro = document.getElementById("statusFiltro")?.value || "todos";
  
  const transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio, statusFiltro);
  
  // Criar CSV
  let csv = "Data;Paciente;Serviço;Valor;Status;Descrição\n";
  
  transacoesFiltradas.forEach(t => {
    csv += `${formatarData(t.data)};${t.paciente};${t.servico};R$ ${t.valor};${t.status};${t.descricao}\n`;
  });
  
  // Criar blob e download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Formatar data
function formatarData(dataString) {
  if (!dataString) return "Não informada";
  
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}