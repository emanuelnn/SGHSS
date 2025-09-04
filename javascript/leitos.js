let leitos     = JSON.parse(localStorage.getItem("leitos")) || [];
let pacientes  = JSON.parse(localStorage.getItem("usuarios")) || [];
let financeiro = JSON.parse(localStorage.getItem("financeiro")) || [];

const perfisValidos = ["Livre", "Ocupado", "Manutenção"];
const leitos_tab = document.getElementById("leitos_tab");
const acessoRestrito = document.getElementById("acessoRestrito");

const perfil = (localStorage.getItem("perfil") || "comum").toLowerCase();

function verificarPermissoes() {
  const ehAdministrador = perfil === "administrador";
  const ehMedico = perfil === "médico";
  const ehEnfermeiro = perfil === "téc. de enfermagem";

  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {
    if (leitos_tab) {
      leitos_tab.style.display = "none";
    }
    if (acessoRestrito) {
      acessoRestrito.style.display = "block";
    }
  }

  return true;
}

function valorMonetarioAleatorio() {
  const valor = Math.floor(Math.random() * (2000 - 100 + 1)) + 50;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.addEventListener("DOMContentLoaded", () => {
  verificarPermissoes();
  atualizarEstatisticas();
  renderizarLeitos();

  document.getElementById("btnAcaoLeito")?.addEventListener("click", executarAcaoLeito);
  
  // Adicionar eventos de filtro
  document.getElementById("filtroAndar")?.addEventListener("change", filtrarLeitos);
  document.getElementById("filtroSetor")?.addEventListener("change", filtrarLeitos);
  document.getElementById("filtroStatus")?.addEventListener("change", filtrarLeitos);
});


function atualizarEstatisticas() {
  const leitosValidos = leitos.filter(l => perfisValidos.includes(l.status));
  const totalLeitos = leitosValidos.length;
  const leitosOcupados = leitosValidos.filter(l => l.status === "Ocupado").length;
  const leitosDisponiveis = leitosValidos.filter(l => l.status === "Livre").length;
  const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;

  document.getElementById("totalLeitos").textContent = totalLeitos;
  document.getElementById("leitosOcupados").textContent = leitosOcupados;
  document.getElementById("leitosDisponiveis").textContent = leitosDisponiveis;
  document.getElementById("taxaOcupacao").textContent = `${taxaOcupacao}%`;
}

function renderizarLeitos() {
  const grid = document.getElementById("leitoGrid");
  if (!grid) return;

  const filtroAndar = document.getElementById("filtroAndar")?.value || "";
  const filtroSetor = document.getElementById("filtroSetor")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value || "";

  let leitosFiltrados = leitos.filter(l => perfisValidos.includes(l.status));

  if (filtroAndar) leitosFiltrados = leitosFiltrados.filter(l => l.andar == filtroAndar);
  if (filtroSetor) leitosFiltrados = leitosFiltrados.filter(l => l.setor === filtroSetor);
  if (filtroStatus) leitosFiltrados = leitosFiltrados.filter(l => l.status === filtroStatus);

  grid.innerHTML = "";

  leitosFiltrados.forEach(leito => {
    const card = document.createElement("div");
    card.className = `leito-card ${leito.status.toLowerCase()}`;
    card.onclick = () => abrirDetalhesLeito(leito);

    const statusClass = {
      "Livre": "status-Livre",
      "Ocupado": "status-Ocupado",
      "Manutenção": "status-Manutenção"
    }[leito.status];

    const statusColor = {
      "Livre": "text-success",
      "Ocupado": "text-danger",
      "Manutenção": "text-warning"
    }[leito.status];

    card.innerHTML = `
      <div class="leito-status ${statusClass}"></div>
      <div class="leito-info">
        <h6 class="${statusColor}">Leito ${leito.numero}</h6>
        <p><i class="fas fa-building me-1"></i>${leito.andar}º Andar</p>
        <p><i class="fas fa-stethoscope me-1"></i>${leito.setor}</p>
        <p><i class="fas fa-bed me-1"></i>${leito.tipo}</p>
        <p><i class="fas fa-info-circle me-1"></i>${leito.status}</p>
        ${leito.paciente ? `<p><i class="fas fa-user me-1"></i>${leito.paciente}</p>` : ""}
      </div>
    `;

    grid.appendChild(card);
  });

  if (leitosFiltrados.length === 0) {
    grid.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-bed fa-2x mb-2"></i><p>Nenhum leito encontrado com os filtros aplicados</p></div>';
  }
}

function abrirDetalhesLeito(leito) {
  const modal = new bootstrap.Modal(document.getElementById("leitoModal"));
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnAcao = document.getElementById("btnAcaoLeito");

  modalTitle.textContent = `Leito ${leito.numero} - ${leito.setor}`;

  // Gerar opções de pacientes para internação
  const pacientesSelect = pacientes.filter(p => p.tipoUsuario === "Paciente").map(p =>
    `<option value="${p.nome}">${p.nome}</option>`
  ).join("");

  modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6>Informações do Leito</h6>
        <table class="table table-sm">
          <tr>
            <td><strong>Número:</strong></td>
            <td>${leito.numero}</td>
          </tr>
          <tr>
            <td><strong>Andar:</strong></td>
            <td>${leito.andar}º Andar</td>
          </tr>
          <tr>
            <td><strong>Tipo:</strong></td>
            <td>${leito.tipo}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>${leito.status}</td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6>Paciente Atual</h6>
        ${leito.paciente ? `
          <div class="paciente-info">
            <h6>${leito.paciente}</h6>
            <p><strong>Data de Internação:</strong> ${formatarData(leito.dataInternacao)}</p>
            <p><strong>Data Prevista de Alta:</strong> ${formatarData(leito.previsaoAlta)}</p>
            <p><strong>Observações:</strong> ${leito.observacoes || "Nenhuma"}</p>
          </div>
        ` : `<p class="text-muted">Nenhum paciente internado</p>`}
      </div>
    </div>
    <div class="mt-3">
      <h6>Ações Disponíveis</h6>
      <div class="btn-group w-100" role="group">
        ${leito.status === "Livre" ? `
          <div class="mb-2">
            <label class="form-label small">Selecione o paciente para internar:</label>
            <select id="pacienteSelect" class="form-select form-select-sm mb-2">
              <option value="">Escolha um paciente...</option>
              ${pacientesSelect}
            </select>

            <button class="btn btn-success w-100" onclick="internarPaciente(${leito.id})">
              <i class="fas fa-user-plus me-1"></i>Internar
            </button>
          </div>
        ` : ""}
        ${leito.status === "Ocupado" ? `
          <button class="btn btn-danger" onclick="darAltaPaciente(${leito.id})">
            <i class="fas fa-user-minus me-1"></i>Dar Alta
          </button>
          <button class="btn btn-warning" onclick="colocarManutencao(${leito.id})">
            <i class="fas fa-tools me-1"></i>Manutenção
          </button>
        ` : ""}
        ${(leito.status === "Manutenção") ? `
          <button class="btn btn-success" onclick="liberarLeito(${leito.id})">
            <i class="fas fa-check me-1"></i>Liberar
          </button>
        ` : ""}
      </div>
    </div>
  `;

  btnAcao.style.display = "inline-block";
  if (leito.status === "Livre") {
    btnAcao.textContent = "Internar Paciente";
    btnAcao.className = "btn btn-success";
  } else if (leito.status === "Ocupado") {
    btnAcao.textContent = "Dar Alta";
    btnAcao.className = "btn btn-danger";
  } else if (leito.status === "Manutenção") {
    btnAcao.textContent = "Liberar Leito";
    btnAcao.className = "btn btn-success";
  } else {
    btnAcao.style.display = "none";
  }

  btnAcao.dataset.leitoId = leito.id;
  modal.show();
}

function executarAcaoLeito() {
  const leitoId = parseInt(document.getElementById("btnAcaoLeito").dataset.leitoId);
  const leito = leitos.find(l => l.id === leitoId);
  if (!leito) return;

  if (leito.status === "Livre") internarPaciente(leitoId);
  else if (leito.status === "Ocupado") darAltaPaciente(leitoId);
  else if (leito.status === "Manutenção") liberarLeito(leitoId);
}

function internarPaciente(leitoId) {
  const pacienteSelect = document.getElementById("pacienteSelect");
  if (!pacienteSelect || !pacienteSelect.value) {
    alert("Por favor, selecione um paciente para internar.");
    return;
  }

  const pacienteNome = pacienteSelect.value;
  const leitoIndex = leitos.findIndex(l => l.id === leitoId);
  if (leitoIndex === -1) return;

  leitos[leitoIndex] = {
    ...leitos[leitoIndex],
    status: "Ocupado",
    paciente: pacienteNome,
    dataInternacao: new Date().toISOString().split('T')[0],
    previsaoAlta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  localStorage.setItem("leitos", JSON.stringify(leitos));

    const NovaCobranca = {
    id: financeiro.length + 1,
    paciente: pacienteNome,
    tipo: "Internação",
    data: new Date().toISOString().split('T')[0],
    valor: valorMonetarioAleatorio()
    };
  
    financeiro.push(NovaCobranca);
    localStorage.setItem("financeiro", JSON.stringify(financeiro));

  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  alert(`Paciente ${pacienteNome} internado com sucesso no leito ${leitos[leitoIndex].numero}!`);
}

function darAltaPaciente(leitoId) {
  if (!confirm("Tem certeza que deseja dar alta ao paciente deste leito?")) return;

  const leitoIndex = leitos.findIndex(l => l.id === leitoId);
  if (leitoIndex === -1) return;

  leitos[leitoIndex] = {
    ...leitos[leitoIndex],
    status: "Livre",
    paciente: null,
    dataInternacao: null,
    previsaoAlta: null,
    observacoes: ""
  };

  localStorage.setItem("leitos", JSON.stringify(leitos));
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  alert(`Alta liberada para o leito ${leitos[leitoIndex].numero}!`);
}

function liberarLeito(leitoId) {
  const leitoIndex = leitos.findIndex(l => l.id === leitoId);
  if (leitoIndex === -1) return;

  leitos[leitoIndex] = {
    ...leitos[leitoIndex],
    status: "Livre",
    observacoes: ""
  };

  localStorage.setItem("leitos", JSON.stringify(leitos));
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  alert(`Leito ${leitos[leitoIndex].numero} liberado com sucesso!`);
}

function formatarData(dataString) {
  if (!dataString) return "Não informada";
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}

function filtrarLeitos() {
  renderizarLeitos();
}

function limparFiltros() {
  document.getElementById("filtroAndar").value = "";
  document.getElementById("filtroSetor").value = "";
  document.getElementById("filtroStatus").value = "";
  renderizarLeitos();
}

function colocarManutencao(leitoId) {
  if (!confirm("Tem certeza que deseja colocar este leito em manutenção?")) return;

  const leitoIndex = leitos.findIndex(l => l.id === leitoId);
  if (leitoIndex === -1) return;

  leitos[leitoIndex] = {
    ...leitos[leitoIndex],
    status: "Manutenção",
    observacoes: "Em manutenção"
  };

  localStorage.setItem("leitos", JSON.stringify(leitos));
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  alert(`Leito ${leitos[leitoIndex].numero} colocado em manutenção!`);
}
