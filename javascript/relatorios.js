
// Relatórios Financeiros
let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
let exames = JSON.parse(localStorage.getItem("exames")) || [];
let teleconsultas = JSON.parse(localStorage.getItem("teleconsultas")) || [];
let leitos = JSON.parse(localStorage.getItem("leitos")) || [];
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let financeiro = JSON.parse(localStorage.getItem("financeiro")) || [];
const relatorios_tab = document.getElementById("relatorios_tab");
const acessoRestrito = document.getElementById("acessoRestrito");

const perfil = (localStorage.getItem("perfil") || "comum").toLowerCase();
function verificarPermissoes() {
  const ehAdministrador = perfil === "administrador";
  // Restringir acesso ao formulário de Relatórios
  if (!ehAdministrador) {
      if (relatorios_tab) {
        relatorios_tab.style.display = "none";
      }
      if (acessoRestrito) {
        acessoRestrito.style.display = "block";
      }
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  verificarPermissoes();
  gerarRelatorio();
  
  document.getElementById("periodo")?.addEventListener("change", gerarRelatorio);
  document.getElementById("tipoRelatorio")?.addEventListener("change", gerarRelatorio);
});

function valorParaNumero(valorStr) {
  if (!valorStr) return 0;
  return Number(
    valorStr
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
  ) || 0;
}

function gerarRelatorio() {
  const periodo = document.getElementById("periodo")?.value || "mes";
  const tipoRelatorio = document.getElementById("tipoRelatorio")?.value || "geral";
  let transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio);
  
  atualizarMetricas(transacoesFiltradas);
  
  atualizarGraficos(transacoesFiltradas);
  
  atualizarTabela(transacoesFiltradas);
}

function filtrarTransacoes(periodo, tipoRelatorio) {
  const hoje = new Date();
  let dataInicio = new Date();
  let dataFinal = new Date();

  const dataInicialInput = document.getElementById("dataInicial")?.value;
  const dataFinalInput = document.getElementById("dataFinal")?.value;

  switch (periodo) {
    case "personalizado":
      if (dataInicialInput) {
        dataInicio = new Date(dataInicialInput);
      }
      if (dataFinalInput) {
        dataFinal = new Date(dataFinalInput);
        dataFinal.setHours(23, 59, 59, 999);
      }
      break;
    case "mes":
      dataInicio.setMonth(hoje.getMonth() - 1);
      dataInicio.setDate(1);
      break;
    case "trimestre":
      dataInicio.setMonth(hoje.getMonth() - 3);
      dataInicio.setDate(1);
      break;
    case "semestre":
      dataInicio.setMonth(hoje.getMonth() - 6);
      dataInicio.setDate(1);
      break;
    case "ano":
      dataInicio.setFullYear(hoje.getFullYear() - 1);
      dataInicio.setMonth(0);
      dataInicio.setDate(1);
      break;
  }

  if (!dataFinalInput && periodo !== "personalizado") {
    dataFinal = new Date();
  }

  const filtradas = financeiro.filter(t => {
    const dataTransacao = new Date(t.data);
    const dentroDoPeriodo = dataTransacao >= dataInicio && dataTransacao <= dataFinal;
    const doTipo = tipoRelatorio.toLowerCase() === "geral" || t.tipo.toLowerCase() === tipoRelatorio;
    return dentroDoPeriodo && doTipo;
  });

  return filtradas;
}

function limparFiltros() {
  document.getElementById("dataInicial").value = "";
  document.getElementById("dataFinal").value = "";
  document.getElementById("periodo").value = "mes";
  document.getElementById("tipoRelatorio").value = "geral";
  gerarRelatorio();
}

function atualizarMetricas(transacoesFiltradas) {

  const receitaTotal = transacoesFiltradas.reduce((sum, t) => sum +valorParaNumero(t.valor), 0);

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

function atualizarGraficos(transacoesFiltradas) {
  const ctxReceita = document.getElementById("graficoReceita")?.getContext("2d");
  if (ctxReceita) {
    const receitaPorMes = {};
    
    transacoesFiltradas.forEach(t => {
      const data = new Date(t.data);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (!receitaPorMes[chave]) receitaPorMes[chave] = 0;
      receitaPorMes[chave] += valorParaNumero(t.valor);
    });
  
    const labels = Object.keys(receitaPorMes).sort();
    const valores = labels.map(label => receitaPorMes[label]);

    if (window.graficoReceita instanceof Chart) { window.graficoReceita.destroy() };
    window.graficoReceita = new Chart(ctxReceita, {
      type: 'line',
      data: {
        labels: labels.map(label => {
          const [ano, mes] = label.split('-');
          return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
        }),
        datasets: [{
          label: 'Receita',
          data: valores,
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(context.parsed.y);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value);
              }
            }
          }
        }
      }
    });
  }

  const ctxServicos = document.getElementById("graficoServicos")?.getContext("2d");
  if (ctxServicos) {
    const receitaPorServico = {};
    transacoesFiltradas.forEach(t => {
      if (!receitaPorServico[t.tipo]) receitaPorServico[t.tipo] = 0;
      receitaPorServico[t.tipo] += valorParaNumero(t.valor);
    });
    
    const labels = Object.keys(receitaPorServico);
    const valores = Object.values(receitaPorServico);
    const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

    if (window.graficoServicos instanceof Chart) { window.graficoServicos.destroy() };

    window.graficoServicos = new Chart(ctxServicos, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: valores,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}


function atualizarTabela(transacoesFiltradas) {
  const tbody = document.getElementById("tabelaTransacoes");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  const ordenadas = transacoesFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  ordenadas.forEach(transacao => {
    const row = document.createElement("tr");
    const dataTransacao = new Date(transacao.data);
    const hoje = new Date();
    const diferencaDias = Math.ceil((hoje - dataTransacao) / (1000 * 60 * 60 * 24));
    
    let statusBadge = '';
    if (diferencaDias < 0) {
      statusBadge = '<span class="badge bg-warning">Futura</span>';
    } else if (diferencaDias === 0) {
      statusBadge = '<span class="badge bg-success">Hoje</span>';
    } else if (diferencaDias <= 7) {
      statusBadge = '<span class="badge bg-info">Última semana</span>';
    } else {
      statusBadge = '<span class="badge bg-secondary">Antiga</span>';
    }

    row.innerHTML = `
      <td>${formatarData(transacao.data)}</td>
      <td>
        <div class="d-flex align-items-center">
          <i class="fas fa-user-circle me-2 text-muted"></i>
          ${transacao.paciente}
        </div>
      </td>
      <td>
        <span class="badge bg-primary">${transacao.tipo}</span>
      </td>
      <td>
        <strong class="text-success">R$ ${transacao.valor}</strong>
      </td>
      <td>
        ${statusBadge}
      </td>
      <td>
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-primary" onclick="verDetalheTransacao(${transacao.id})" title="Ver detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-secondary" onclick="exportarTransacao(${transacao.id})" title="Exportar">
            <i class="fas fa-download"></i>
          </button>
        </div>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  if (ordenadas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Nenhuma transação encontrada</td></tr>';
  }
}

function verDetalheTransacao(id) {
  const transacao = financeiro.find(t => t.id === id);
  
  if (!transacao) {
    alert("Transação não encontrada.");
    return;
  }
  
  alert(`Detalhes da Transação:\n\n` +
        `ID: ${transacao.id}\n` +
        `Paciente: ${transacao.paciente}\n` +
        `Serviço: ${transacao.tipo}\n` +
        `Valor: R$ ${transacao.valor}\n` +
        `Data: ${formatarData(transacao.data)}\n`);
}

function exportarTransacao(id) {
  const transacao = financeiro.find(t => t.id === id);
  if (!transacao) return;
  
  const csv = `Data;Paciente;Serviço;Valor\n` +
              `${formatarData(transacao.data)};${transacao.paciente};${transacao.tipo};R$ ${transacao.valor}`;
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `transacao_${transacao.id}_${transacao.paciente.replace(/\s+/g, '_')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function exportarPDF() {
  alert("Exportação para PDF em desenvolvimento. Esta funcionalidade será implementada em breve.");
}

function exportarExcel() {
  alert("Exportação para Excel em desenvolvimento. Esta funcionalidade será implementada em breve.");
}

function exportarCSV() {
  const periodo = document.getElementById("periodo")?.value || "mes";
  const tipoRelatorio = document.getElementById("tipoRelatorio")?.value || "geral";
  
  const transacoesFiltradas = filtrarTransacoes(periodo, tipoRelatorio);
  
  let csv = "Data;Paciente;Serviço;Valor;Status\n";
 
  transacoesFiltradas.forEach(t => {
    csv += `${formatarData(t.data)};${t.paciente};${t.tipo};R$ ${t.valor};let status = '';
    const dataTransacao = new Date(t.data);
    const hoje = new Date();
    const diferencaDias = Math.ceil((hoje - dataTransacao) / (1000 * 60 * 60 * 24));
    
    if (diferencaDias < 0) {
      status = 'Futura';
    } else if (diferencaDias === 0) {
      status = 'Hoje';
    } else if (diferencaDias <= 7) {
      status = 'Última semana';
    } else {
      status = 'Antiga';
    }\n`;
  });
 
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

function formatarData(dataString) {
  if (!dataString) return "Não informada";
  
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}