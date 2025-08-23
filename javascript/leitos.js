// Gestão de Leitos Hospitalares
let leitos = JSON.parse(localStorage.getItem("leitos")) || [];
let internacoes = JSON.parse(localStorage.getItem("internacoes")) || [];
let pacientes = JSON.parse(localStorage.getItem("usuarios")) || [];

const perfil = localStorage.getItem("perfil") || "comum";

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  gerarLeitosIniciais();
  atualizarEstatisticas();
  renderizarLeitos();
  
  // Event listeners
  document.getElementById("btnAcaoLeito")?.addEventListener("click", executarAcaoLeito);
});

// Gerar leitos iniciais
function gerarLeitosIniciais() {
  if (leitos.length > 0) return;
  
  const andares = [1, 2, 3, 4, 5];
  const setores = ["clinico", "cirurgico", "pediatria", "uti", "enfermaria"];
  const tipos = ["individual", "duplo", "enfermaria"];
  
  let id = 1;
  andares.forEach(andar => {
    setores.forEach(setor => {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const capacidade = tipo === "individual" ? 1 : tipo === "duplo" ? 2 : 4;
      
      for (let i = 0; i < capacidade; i++) {
        leitos.push({
          id: id++,
          numero: `${andar}${String(i + 1).padStart(2, '0')}`,
          andar: andar,
          setor: setor,
          tipo: tipo,
          status: "disponivel",
          paciente: null,
          dataInternacao: null,
          dataAlta: null,
          observacoes: "",
          criadoEm: new Date().toISOString()
        });
      }
    });
  });
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
}

// Atualizar estatísticas
function atualizarEstatisticas() {
  const totalLeitos = leitos.length;
  const leitosOcupados = leitos.filter(l => l.status === "ocupado").length;
  const leitosDisponiveis = leitos.filter(l => l.status === "disponivel").length;
  const taxaOcupacao = totalLeitos > 0 ? Math.round((leitosOcupados / totalLeitos) * 100) : 0;
  
  document.getElementById("totalLeitos").textContent = totalLeitos;
  document.getElementById("leitosOcupados").textContent = leitosOcupados;
  document.getElementById("leitosDisponiveis").textContent = leitosDisponiveis;
  document.getElementById("taxaOcupacao").textContent = `${taxaOcupacao}%`;
}

// Renderizar leitos
function renderizarLeitos() {
  const grid = document.getElementById("leitoGrid");
  if (!grid) return;
  
  const filtroAndar = document.getElementById("filtroAndar")?.value || "";
  const filtroSetor = document.getElementById("filtroSetor")?.value || "";
  const filtroStatus = document.getElementById("filtroStatus")?.value || "";
  
  let leitosFiltrados = leitos;
  
  if (filtroAndar) {
    leitosFiltrados = leitosFiltrados.filter(l => l.andar == filtroAndar);
  }
  
  if (filtroSetor) {
    leitosFiltrados = leitosFiltrados.filter(l => l.setor === filtroSetor);
  }
  
  if (filtroStatus) {
    leitosFiltrados = leitosFiltrados.filter(l => l.status === filtroStatus);
  }
  
  grid.innerHTML = "";
  
  leitosFiltrados.forEach(leito => {
    const card = document.createElement("div");
    card.className = `leito-card ${leito.status}`;
    card.onclick = () => abrirDetalhesLeito(leito);
    
    const statusClass = {
      "disponivel": "status-disponivel",
      "ocupado": "status-ocupado",
      "manutencao": "status-manutencao",
      "reservado": "status-reservado"
    }[leito.status];
    
    const statusText = {
      "disponivel": "Disponível",
      "ocupado": "Ocupado",
      "manutencao": "Manutenção",
      "reservado": "Reservado"
    }[leito.status];
    
    const statusColor = {
      "disponivel": "text-success",
      "ocupado": "text-danger",
      "manutencao": "text-warning",
      "reservado": "text-info"
    }[leito.status];
    
    card.innerHTML = `
      <div class="leito-status ${statusClass}"></div>
      <div class="leito-info">
        <h6 class="${statusColor}">Leito ${leito.numero}</h6>
        <p><i class="fas fa-building me-1"></i>${leito.andar}º Andar</p>
        <p><i class="fas fa-stethoscope me-1"></i>${leito.setor}</p>
        <p><i class="fas fa-bed me-1"></i>${leito.tipo}</p>
        <p><i class="fas fa-info-circle me-1"></i>${statusText}</p>
        ${leito.paciente ? `<p><i class="fas fa-user me-1"></i>${leito.paciente}</p>` : ""}
      </div>
    `;
    
    grid.appendChild(card);
  });
  
  if (leitosFiltrados.length === 0) {
    grid.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-bed fa-2x mb-2"></i><p>Nenhum leito encontrado com os filtros aplicados</p></div>';
  }
}

// Filtrar leitos
function filtrarLeitos() {
  renderizarLeitos();
}

// Limpar filtros
function limparFiltros() {
  document.getElementById("filtroAndar").value = "";
  document.getElementById("filtroSetor").value = "";
  document.getElementById("filtroStatus").value = "";
  renderizarLeitos();
}

// Abrir detalhes do leito
function abrirDetalhesLeito(leito) {
  const modal = new bootstrap.Modal(document.getElementById("leitoModal"));
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const btnAcao = document.getElementById("btnAcaoLeito");
  
  modalTitle.textContent = `Leito ${leito.numero} - ${leito.setor}`;
  
  const statusText = {
    "disponivel": "Disponível",
    "ocupado": "Ocupado",
    "manutencao": "Manutenção",
    "reservado": "Reservado"
  }[leito.status];
  
  const statusColor = {
    "disponivel": "success",
    "ocupado": "danger",
    "manutencao": "warning",
    "reservado": "info"
  }[leito.status];
  
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
            <td><strong>Setor:</strong></td>
            <td>${leito.setor}</td>
          </tr>
          <tr>
            <td><strong>Tipo:</strong></td>
            <td>${leito.tipo}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="badge bg-${statusColor}">${statusText}</span></td>
          </tr>
        </table>
      </div>
      <div class="col-md-6">
        <h6>Paciente Atual</h6>
        ${leito.paciente ? `
          <div class="paciente-info">
            <h6>${leito.paciente}</h6>
            <p><strong>Data de Internação:</strong> ${formatarData(leito.dataInternacao)}</p>
            <p><strong>Data Prevista de Alta:</strong> ${formatarData(leito.dataAlta)}</p>
            <p><strong>Observações:</strong> ${leito.observacoes || "Nenhuma"}</p>
          </div>
        ` : '<p class="text-muted">Nenhum paciente internado</p>'}
      </div>
    </div>
    
    <div class="mt-3">
      <h6>Ações Disponíveis</h6>
      <div class="btn-group w-100" role="group">
        ${leito.status === "disponivel" ? `
          <button class="btn btn-success" onclick="internarPaciente(${leito.id})">
            <i class="fas fa-user-plus me-1"></i>Internar
          </button>
          <button class="btn btn-warning" onclick="reservarLeito(${leito.id})">
            <i class="fas fa-clock me-1"></i>Reservar
          </button>
        ` : ""}
        
        ${leito.status === "ocupado" ? `
          <button class="btn btn-danger" onclick="darAltaPaciente(${leito.id})">
            <i class="fas fa-user-minus me-1"></i>Dar Alta
          </button>
          <button class="btn btn-warning" onclick="manutencaoLeito(${leito.id})">
            <i class="fas fa-tools me-1"></i>Manutenção
          </button>
        ` : ""}
        
        ${leito.status === "reservado" ? `
          <button class="btn btn-success" onclick="confirmarReserva(${leito.id})">
            <i class="fas fa-check me-1"></i>Confirmar
          </button>
          <button class="btn btn-secondary" onclick="cancelarReserva(${leito.id})">
            <i class="fas fa-times me-1"></i>Cancelar
          </button>
        ` : ""}
        
        ${leito.status === "manutencao" ? `
          <button class="btn btn-success" onclick="liberarLeito(${leito.id})">
            <i class="fas fa-check me-1"></i>Liberar
          </button>
        ` : ""}
      </div>
    </div>
  `;
  
  // Configurar botão principal
  if (leito.status === "disponivel") {
    btnAcao.textContent = "Internar Paciente";
    btnAcao.className = "btn btn-success";
  } else if (leito.status === "ocupado") {
    btnAcao.textContent = "Dar Alta";
    btnAcao.className = "btn btn-danger";
  } else if (leito.status === "reservado") {
    btnAcao.textContent = "Confirmar Reserva";
    btnAcao.className = "btn btn-success";
  } else if (leito.status === "manutencao") {
    btnAcao.textContent = "Liberar Leito";
    btnAcao.className = "btn btn-success";
  } else {
    btnAcao.style.display = "none";
  }
  
  // Armazenar leito atual para ações
  btnAcao.dataset.leitoId = leito.id;
  
  modal.show();
}

// Executar ação do leito
function executarAcaoLeito() {
  const leitoId = parseInt(document.getElementById("btnAcaoLeito").dataset.leitoId);
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  if (leito.status === "disponivel") {
    internarPaciente(leitoId);
  } else if (leito.status === "ocupado") {
    darAltaPaciente(leitoId);
  } else if (leito.status === "reservado") {
    confirmarReserva(leitoId);
  } else if (leito.status === "manutencao") {
    liberarLeito(leitoId);
  }
}

// Internar paciente
function internarPaciente(leitoId) {
  const pacientesDisponiveis = pacientes.filter(p => p.tipoUsuario === "Paciente");
  
  if (pacientesDisponiveis.length === 0) {
    alert("Nenhum paciente disponível para internação.");
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
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  // Atualizar leito
  leito.status = "ocupado";
  leito.paciente = paciente.nome;
  leito.dataInternacao = new Date().toISOString().split('T')[0];
  leito.dataAlta = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 7 dias depois
  
  // Registrar internação
  internacoes.push({
    id: Date.now(),
    leitoId: leitoId,
    paciente: paciente.nome,
    dataInternacao: leito.dataInternacao,
    dataAlta: leito.dataAlta,
    status: "ativo",
    criadoEm: new Date().toISOString()
  });
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  localStorage.setItem("internacoes", JSON.stringify(internacoes));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Paciente ${paciente.nome} internado com sucesso no leito ${leito.numero}!`);
}

// Dar alta ao paciente
function darAltaPaciente(leitoId) {
  if (!confirm("Tem certeza que deseja dar alta ao paciente deste leito?")) return;
  
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  // Atualizar leito
  leito.status = "disponivel";
  leito.paciente = null;
  leito.dataInternacao = null;
  leito.dataAlta = null;
  leito.observacoes = "";
  
  // Registrar alta
  const internacao = internacoes.find(i => i.leitoId === leitoId && i.status === "ativo");
  if (internacao) {
    internacao.status = "concluido";
    internacao.dataAltaReal = new Date().toISOString().split('T')[0];
  }
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  localStorage.setItem("internacoes", JSON.stringify(internacoes));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Alta liberada para o leito ${leito.numero}!`);
}

// Reservar leito
function reservarLeito(leitoId) {
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  leito.status = "reservado";
  leito.observacoes = "Leito reservado";
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Leito ${leito.numero} reservado com sucesso!`);
}

// Confirmar reserva
function confirmarReserva(leitoId) {
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  leito.status = "disponivel";
  leito.observacoes = "";
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Reserva confirmada para o leito ${leito.numero}!`);
}

// Cancelar reserva
function cancelarReserva(leitoId) {
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  leito.status = "disponivel";
  leito.observacoes = "";
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Reserva cancelada para o leito ${leito.numero}!`);
}

// Manutenção do leito
function manutencaoLeito(leitoId) {
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  const motivo = prompt("Informe o motivo da manutenção:");
  
  if (!motivo) return;
  
  leito.status = "manutencao";
  leito.observacoes = `Manutenção: ${motivo}`;
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Leito ${leito.numero} em manutenção!`);
}

// Liberar leito
function liberarLeito(leitoId) {
  const leito = leitos.find(l => l.id === leitoId);
  
  if (!leito) return;
  
  leito.status = "disponivel";
  leito.observacoes = "";
  
  localStorage.setItem("leitos", JSON.stringify(leitos));
  
  // Fechar modal e atualizar
  bootstrap.Modal.getInstance(document.getElementById("leitoModal")).hide();
  atualizarEstatisticas();
  renderizarLeitos();
  
  alert(`Leito ${leito.numero} liberado com sucesso!`);
}

// Formatar data
function formatarData(dataString) {
  if (!dataString) return "Não informada";
  
  const data = new Date(dataString);
  return data.toLocaleDateString("pt-BR");
}