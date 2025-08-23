let leitos = JSON.parse(localStorage.getItem("leitos")) || [];
let pacientes = JSON.parse(localStorage.getItem("usuarios")) || [];

const perfisValidos = ["Livre", "Ocupado", "Manutenção"];
const perfil = localStorage.getItem("perfil") || "comum";

document.addEventListener("DOMContentLoaded", () => {
  gerarLeitosIniciais();
  atualizarEstatisticas();
  renderizarLeitos();

  document.getElementById("btnAcaoLeito")?.addEventListener("click", executarAcaoLeito);
});

function gerarLeitosIniciais() {
  if (leitos.length > 0) return;

  const andares = [1, 2, 3, 4, 5];
  const tipos = ["individual", "duplo", "enfermaria"];

  let id = 1;
  andares.forEach(andar => {
    setores.forEach(setor => {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const capacidade = tipo === "individual" ? 1 : tipo === "duplo" ? 2 : 4;

      for (let i = 0; i < capacidade; i++) {
        leitos.push({
          id: id++, // use id único
          numero: `${andar}${String(i + 1).padStart(2, '0')}`,
          andar: andar,
          setor: setor,
          tipo: tipo,
          status: "Livre",
          paciente: null,
          dataInternacao: null,
          previsaoAlta: null,
          observacoes: "",
          dataCadastro: new Date().toISOString()
        });
      }
    });
  });

  localStorage.setItem("leitos", JSON.stringify(leitos));
}

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
    card.className = `leito-card ${leito.status}`;
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
        <h6 class="${statusColor}">Leito ${leito.codigo}</h6>
        <p><i class="fas fa-building me-1"></i>${leito.andar}º Andar</p>
        <p><i class="fas fa-stethoscope me-1"></i>${leito.codigo}</p>
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

  modalTitle.textContent = `Leito ${leito.codigo} - ${leito.codigo}`;

  modalBody.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6>Informações do Leito</h6>
        <table class="table table-sm">
          <tr>
            <td><strong>Número:</strong></td>
            <td>${leito.codigo}</td>
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
          <button class="btn btn-success" onclick="internarPaciente(${leito.id})">
            <i class="fas fa-user-plus me-1"></i>Internar
          </button>
        ` : ""}
        ${leito.status === "Ocupado" ? `
          <button class="btn btn-danger" onclick="darAltaPaciente(${leito.id})">
            <i class="fas fa-user-minus me-1"></i>Dar Alta
          </button>
          <button class="btn btn-warning" onclick="manutencaoLeito && manutencaoLeito(${leito.id})">
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

  const statusLower = leito.status.toLowerCase();

  if (statusLower === "Livre") internarPaciente(leitoId);
  else if (statusLower === "Ocupado") darAltaPaciente(leitoId);
  else if (statusLower === "Manutenção") liberarLeito(leitoId);
}

// Internar paciente
function internarPaciente(leitoId) {
  const pacientesDisponiveis = pacientes.filter(p => p.tipoUsuario === "Paciente");

  if (pacientesDisponiveis.length === 0) {
    alert("Nenhum paciente Livre para internação.");
    return;
  }

  const pacienteSelect = prompt(`Selecione o paciente para internar:\n${pacientesDisponiveis.map((p, i) => `${i + 1}. ${p.nome}`).join('\n')}`);
  if (!pacienteSelect) return;

  const pacienteIndex = parseInt(pacienteSelect) - 1;
  if (pacienteIndex < 0 || pacienteIndex >= pacientesDisponiveis.length) {
    alert("Paciente inválido.");
    return;
  }

  const paciente = pacientesDisponiveis[pacienteIndex];
  const leitoIndex = leitos.findIndex(l => l.id === leitoId);
  if (leitoIndex === -1) return;

  leitos[leitoIndex] = {
    ...leitos[leitoIndex],
    status: "Ocupado",
    paciente: paciente.nome,
    dataInternacao: new Date().toISOString().split('T')[0],
    previsaoAlta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };

  localStorage.setItem("leitos", JSON.stringify(leitos));
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  alert(`Paciente ${paciente.nome} internado com sucesso no leito ${leitos[leitoIndex].numero}!`);
}

// Dar alta
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

// Liberar leito (manutenção)
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
