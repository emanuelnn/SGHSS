// Relatórios Financeiros
let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
let exames = JSON.parse(localStorage.getItem("exames")) || [];
let teleconsultas = JSON.parse(localStorage.getItem("teleconsultas")) || [];
let leitos = JSON.parse(localStorage.getItem("leitos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let financeiro = JSON.parse(localStorage.getItem("financeiro")) || [];

const perfil = localStorage.getItem("perfil") || "comum";

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  gerarRelatorio();
  
  // Event listeners
  document.getElementById("periodo")?.addEventListener("change", gerarRelatorio);
  document.getElementById("tipoRelatorio")?.addEventListener("change", gerarRelatorio);
});

// Gerar relatório
function gerarRelatorio() {
  const periodo = document.getElementById("periodo")?.value || "mes";
  const tipoRelatorio = document.getElementById("tipoRelatorio")?.value || "geral";
  
  // Filtrar transações
  let transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio);
  
  // Atualizar métricas
  atualizarMetricas(transacoesFiltradas);
  
  // Atualizar gráficos
  atualizarGraficos(transacoesFiltradas);
  
  // Atualizar tabela
  atualizarTabela(transacoesFiltradas);
}

// Filtrar transações
function filtrarTransacoes(periodo, tipoRelatorio) {
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

  // Filtrar transações
  const filtradas = financeiro.filter(t => {
    const dataTransacao = new Date(t.data);
    const dentroDoPeriodo = dataTransacao >= dataInicio;
    const doTipo = tipoRelatorio.toLowerCase() === "geral" || t.tipo === tipoRelatorio;
    return dentroDoPeriodo && doTipo;
  });

  return filtradas;
}

// Atualização de métricas
function atualizarMetricas(transacoesFiltradas) {
  // Converte "R$ 1.840,00" ou "R$1.840,00" -> 1840
  const valorParaNumero = (valorStr) => {
    if (!valorStr) return 0;
    return Number(
      valorStr
        .replace(/[R$\s]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    ) || 0;
  };

  const receitaTotal = transacoesFiltradas.reduce((sum, t) => sum + valorParaNumero(t.valor), 0);

  const receitaMes = transacoesFiltradas
    .filter(t => {
      const dataTransacao = new Date(t.data);
      const mesAtual = new Date().getMonth();
      return dataTransacao.getMonth() === mesAtual;
    })
    .reduce((sum, t) => sum + valorParaNumero(t.valor), 0);

  const pacientesUnicos = new Set(transacoesFiltradas.map(t => t.paciente)).size;
  const ticketMedio = pacientesUnicos > 0 ? receitaTotal / pacientesUnicos : 0;

  document.getElementById("receitaTotal").textContent = receitaTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById("receitaMes").textContent = receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById("totalPacientes").textContent = pacientesUnicos;
  document.getElementById("ticketMedio").textContent = ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

    row.innerHTML = `
      <td>${formatarData(transacao.data)}</td>
      <td>${transacao.paciente}</td>
      <td>${transacao.tipo}</td>
      <td>R$ ${transacao.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="verDetalheTransacao(${transacao.id})">
          <i class="fas fa-eye"></i>
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
  const financeiro = financeiro.find(t => t.id === id);
  
  if (!transacao) return;
  
  alert(`Detalhes da Transação:\n\n` +
        `Paciente: ${financeiro.paciente}\n` +
        `Serviço: ${financeiro.tipo}\n` +
        `Valor: R$ ${financeiro.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}\n` +
        `Data: ${formatarData(financeiro.data)}\n`);
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
  
  const transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio);
  
  // Criar CSV
  let csv = "Data;Paciente;Serviço;Valor;Descrição\n";
 
  transacoesFiltradas.forEach(t => {
    csv += `${formatarData(t.data)};${t.paciente};${t.tipo};R$ ${t.valor};${t.descricao}\n`;
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