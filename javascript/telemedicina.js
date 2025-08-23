// Sistema de Telemedicina
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let teleconsultas = JSON.parse(localStorage.getItem("teleconsultas")) || [];
let consultaEmAndamento = null;
let chatMensagens = [];

const perfil = localStorage.getItem("perfil") || "comum";

// Especialidades médicas
const especialidades = [
  "Clínico Geral", "Pediatria", "Dermatologia", "Cardiologia", "Oftalmologia",
  "Ginecologia e Obstetrícia", "Ortopedia e Traumatologia", "Neurologia", "Psiquiatria",
  "Endocrinologia e Metabologia", "Gastroenterologia", "Urologia", "Otorrinolaringologia",
  "Reumatologia", "Pneumologia", "Nefrologia", "Infectologia", "Oncologia"
];

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  popularPacientesMedicos();
  carregarConsultas();
  
  // Event listeners
  document.getElementById("medicoTele")?.addEventListener("change", atualizarEspecialidade);
  
  // Data mínima = hoje
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataTele")?.setAttribute("min", hoje);
});

// Popular pacientes e médicos
function popularPacientesMedicos() {
  const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
  const medicos = usuarios.filter(u => u.tipoUsuario === "Médico");
  
  // Select de paciente
  const pacienteTele = document.getElementById("pacienteTele");
  if (pacienteTele) {
    pacienteTele.innerHTML = '<option value="">Selecione o paciente</option>';
    pacientes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      pacienteTele.appendChild(option);
    });
  }
  
  // Select de médico
  const medicoTele = document.getElementById("medicoTele");
  if (medicoTele) {
    medicoTele.innerHTML = '<option value="">Selecione o médico</option>';
    medicos.forEach(m => {
      const option = document.createElement("option");
      option.value = m.nome;
      option.textContent = m.nome;
      medicoTele.appendChild(option);
    });
  }
}

// Atualizar especialidade
function atualizarEspecialidade() {
  const medico = document.getElementById("medicoTele").value;
  const especialidadeInput = document.getElementById("especialidadeTele");
  
  if (medico && especialidadeInput) {
    // Simular especialidade do médico
    const especialidadeAleatoria = especialidades[Math.floor(Math.random() * especialidades.length)];
    especialidadeInput.value = especialidadeAleatoria;
  } else {
    especialidadeInput.value = "";
  }
}

// Agendar teleconsulta
function agendarTeleconsulta() {
  const paciente = document.getElementById("pacienteTele").value;
  const medico = document.getElementById("medicoTele").value;
  const especialidade = document.getElementById("especialidadeTele").value;
  const data = document.getElementById("dataTele").value;
  const horario = document.getElementById("horarioTele").value;
  const motivo = document.getElementById("motivoTele").value;
  
  // Validação
  if (!paciente || !medico || !especialidade || !data || !horario) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  
  // Verificar conflito de horário
  const conflito = teleconsultas.some(t => 
    t.medico === medico && 
    t.data === data && 
    t.horario === horario && 
    t.status !== "Cancelada"
  );
  
  if (conflito) {
    alert("Este médico já possui uma teleconsulta agendada para este horário.");
    return;
  }
  
  const novaTeleconsulta = {
    id: Date.now(),
    paciente: paciente,
    medico: medico,
    especialidade: especialidade,
    data: data,
    horario: horario,
    motivo: motivo,
    status: "Agendada",
    dataCadastro: new Date().toISOString(),
    linkAcesso: gerarLinkAcesso(),
    prontuario: ""
  };
  
  teleconsultas.push(novaTeleconsulta);
  localStorage.setItem("teleconsultas", JSON.stringify(teleconsultas));
  
  // Mostrar mensagem de sucesso
  const alerta = document.createElement("div");
  alerta.className = "alert alert-success alert-dismissible fade show";
  alerta.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Teleconsulta agendada com sucesso!
    <br><small><strong>Link de acesso:</strong> ${novaTeleconsulta.linkAcesso}</small>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.querySelector("#agendarTele .container");
  container.insertBefore(alerta, container.firstChild);
  
  // Limpar formulário
  document.getElementById("pacienteTele").value = "";
  document.getElementById("medicoTele").value = "";
  document.getElementById("especialidadeTele").value = "";
  document.getElementById("dataTele").value = "";
  document.getElementById("horarioTele").value = "";
  document.getElementById("motivoTele").value = "";
  
  // Remover alerta após 5 segundos
  setTimeout(() => {
    alerta.remove();
  }, 5000);
}

// Gerar link de acesso simulado
function gerarLinkAcesso() {
  return `https://telemedicina.vidaplus.com/consulta/${Date.now().toString(36)}`;
}

// Carregar consultas
function carregarConsultas() {
  renderizarConsultas(teleconsultas);
}

// Filtrar consultas
function filtrarConsultas() {
  const status = document.getElementById("filtroStatus").value;
  const periodo = document.getElementById("filtroPeriodo").value;
  
  let consultasFiltradas = teleconsultas;
  
  // Filtrar por status
  if (status) {
    consultasFiltradas = consultasFiltradas.filter(t => t.status === status);
  }
  
  // Filtrar por período
  if (periodo !== "todos") {
    const dias = parseInt(periodo);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    consultasFiltradas = consultasFiltradas.filter(t => {
      const dataConsulta = new Date(t.data);
      return dataConsulta >= dataLimite;
    });
  }
  
  renderizarConsultas(consultasFiltradas);
}

// Renderizar consultas
function renderizarConsultas(consultasParaRenderizar) {
  const listaConsultas = document.getElementById("listaConsultas");
  
  if (!listaConsultas) return;
  
  listaConsultas.innerHTML = "";
  
  if (consultasParaRenderizar.length === 0) {
    listaConsultas.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-calendar-times fa-2x mb-2"></i><p>Nenhuma teleconsulta encontrada</p></div>';
    return;
  }
  
  // Ordenar por data (mais recente primeiro)
  consultasParaRenderizar.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  consultasParaRenderizar.forEach(consulta => {
    const card = document.createElement("div");
    card.className = "card mb-3";
    
    const statusClass = {
      "Agendada": "bg-primary",
      "Em Andamento": "bg-warning",
      "Concluída": "bg-success",
      "Cancelada": "bg-danger"
    }[consulta.status] || "bg-secondary";
    
    const statusIcon = {
      "Agendada": "fas fa-clock",
      "Em Andamento": "fas fa-play-circle",
      "Concluída": "fas fa-check-circle",
      "Cancelada": "fas fa-times-circle"
    }[consulta.status] || "fas fa-question-circle";
    
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${consulta.paciente}</h6>
            <p class="mb-1"><strong>${consulta.especialidade}</strong> - ${consulta.medico}</p>
            <p class="mb-1 text-muted">
              <i class="fas fa-calendar me-1"></i>${consulta.data} às ${consulta.horario}
            </p>
            <p class="mb-1 text-muted">
              <i class="fas fa-link me-1"></i><small>${consulta.linkAcesso}</small>
            </p>
            ${consulta.motivo ? `<p class="mb-1 text-muted"><small><strong>Motivo:</strong> ${consulta.motivo}</small></p>` : ""}
            <span class="badge ${statusClass}">
              <i class="${statusIcon} me-1"></i>${consulta.status}
            </span>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu">
              ${consulta.status === "Agendada" ? `
                <li><a class="dropdown-item" href="#" onclick="iniciarConsultaDireta(${consulta.id})">
                  <i class="fas fa-play me-1"></i>Iniciar Consulta
                </a></li>
                <li><a class="dropdown-item text-warning" href="#" onclick="cancelarConsulta(${consulta.id})">
                  <i class="fas fa-clock me-1"></i>Adiar
                </a></li>
                <li><a class="dropdown-item text-danger" href="#" onclick="cancelarConsulta(${consulta.id})">
                  <i class="fas fa-trash me-1"></i>Cancelar
                </a></li>
              ` : ""}
              ${consulta.status === "Concluída" ? `
                <li><a class="dropdown-item" href="#" onclick="verProntuario(${consulta.id})">
                  <i class="fas fa-file-medical me-1"></i>Ver Prontuário
                </a></li>
              ` : ""}
            </ul>
          </div>
        </div>
      </div>
    `;
    
    listaConsultas.appendChild(card);
  });
}

// Iniciar consulta direta
function iniciarConsultaDireta(idConsulta) {
  const consulta = teleconsultas.find(t => t.id === idConsulta);
  if (!consulta) return;
  
  // Mudar para aba de consulta em andamento
  const emAndamentoTab = document.getElementById("emAndamento-tab");
  const emAndamentoTabButton = new bootstrap.Tab(emAndamentoTab);
  emAndamentoTabButton.show();
  
  // Simular início da consulta
  iniciarConsulta();
}

// Iniciar consulta
function iniciarConsulta() {
  consultaEmAndamento = {
    id: Date.now(),
    inicio: new Date(),
    status: "Em Andamento"
  };
  
  // Atualizar interface
  const videoArea = document.getElementById("videoArea");
  videoArea.innerHTML = `
    <div class="text-center text-white">
      <i class="fas fa-video fa-3x mb-3"></i>
      <h5>Consulta em Andamento</h5>
      <p>Conexão estabelecida com sucesso</p>
      <div class="mt-3">
        <span class="status-indicator status-online"></span>
        <span>Conectado</span>
      </div>
    </div>
  `;
  
  // Mostrar botões de controle
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("stopBtn").style.display = "inline-flex";
  document.getElementById("muteBtn").style.display = "inline-flex";
  document.getElementById("videoBtn").style.display = "inline-flex";
  document.getElementById("shareBtn").style.display = "inline-flex";
  
  // Habilitar chat
  document.getElementById("chatInput").disabled = false;
  document.getElementById("sendBtn").disabled = false;
  
  // Adicionar mensagem inicial ao chat
  adicionarMensagem("sistema", "Consulta iniciada. Bem-vindo à telemedicina VidaPlus!");
  
  // Atualizar informações da consulta
  atualizarInfoConsulta();
}

// Parar consulta
function pararConsulta() {
  if (!confirm("Tem certeza que deseja encerrar a consulta?")) return;
  
  consultaEmAndamento = null;
  
  // Atualizar interface
  const videoArea = document.getElementById("videoArea");
  videoArea.innerHTML = `
    <div class="text-center">
      <i class="fas fa-video-slash fa-3x mb-3 text-muted"></i>
      <p class="text-muted">Consulta encerrada</p>
    </div>
  `;
  
  // Esconder botões de controle
  document.getElementById("startBtn").style.display = "inline-flex";
  document.getElementById("stopBtn").style.display = "none";
  document.getElementById("muteBtn").style.display = "none";
  document.getElementById("videoBtn").style.display = "none";
  document.getElementById("shareBtn").style.display = "none";
  
  // Desabilitar chat
  document.getElementById("chatInput").disabled = true;
  document.getElementById("sendBtn").disabled = true;
  
  // Limpar chat
  document.getElementById("chatArea").innerHTML = '<div class="text-center text-muted"><small>Consulta encerrada</small></div>';
  
  // Limpar prontuário
  document.getElementById("sintomas").value = "";
  document.getElementById("diagnostico").value = "";
  document.getElementById("recomendacoes").value = "";
  
  // Limpar informações da consulta
  document.getElementById("infoConsulta").innerHTML = `
    <div class="text-center text-muted">
      <i class="fas fa-info-circle fa-2x mb-2"></i>
      <p>Nenhuma consulta em andamento</p>
    </div>
  `;
}

// Alternar microfone
function alternarMute() {
  const muteBtn = document.getElementById("muteBtn");
  const icon = muteBtn.querySelector("i");
  
  if (icon.classList.contains("fa-microphone")) {
    icon.classList.remove("fa-microphone");
    icon.classList.add("fa-microphone-slash");
    muteBtn.classList.remove("primary");
    muteBtn.classList.add("danger");
    adicionarMensagem("sistema", "Microfone desativado");
  } else {
    icon.classList.remove("fa-microphone-slash");
    icon.classList.add("fa-microphone");
    muteBtn.classList.remove("danger");
    muteBtn.classList.add("primary");
    adicionarMensagem("sistema", "Microfone ativado");
  }
}

// Alternar vídeo
function alternarVideo() {
  const videoBtn = document.getElementById("videoBtn");
  const icon = videoBtn.querySelector("i");
  
  if (icon.classList.contains("fa-video")) {
    icon.classList.remove("fa-video");
    icon.classList.add("fa-video-slash");
    videoBtn.classList.remove("primary");
    videoBtn.classList.add("danger");
    adicionarMensagem("sistema", "Vídeo desativado");
  } else {
    icon.classList.remove("fa-video-slash");
    icon.classList.add("fa-video");
    videoBtn.classList.remove("danger");
    videoBtn.classList.add("primary");
    adicionarMensagem("sistema", "Vídeo ativado");
  }
}

// Compartilhar tela
function compartilharTela() {
  adicionarMensagem("sistema", "Solicitação de compartilhamento de tela enviada");
  // Simular compartilhamento
  setTimeout(() => {
    adicionarMensagem("sistema", "Tela compartilhada com sucesso");
  }, 2000);
}

// Enviar mensagem
function enviarMensagem() {
  const chatInput = document.getElementById("chatInput");
  const mensagem = chatInput.value.trim();
  
  if (!mensagem) return;
  
  adicionarMensagem("paciente", mensagem);
  chatInput.value = "";
  
  // Simulação de resposta
  setTimeout(() => {
    const respostas = [
      "Entendo, vou verificar isso para você.",
      "Pode me dar mais detalhes sobre esse sintoma?",
      "Vamos agendar um exame complementar.",
      "Isso parece ser normal, não se preocupe.",
      "Vou prescrever um medicamento para ajudar com isso."
    ];
    const respostaAleatoria = respostas[Math.floor(Math.random() * respostas.length)];
    adicionarMensagem("medico", respostaAleatoria);
  }, 1000 + Math.random() * 2000);
}

// Adicionar mensagem ao chat
function adicionarMensagem(remitente, texto) {
  const chatArea = document.getElementById("chatArea");
  
  if (!chatArea) return;
  
  const mensagemDiv = document.createElement("div");
  mensagemDiv.className = `chat-message ${remitente}`;
  
  const timestamp = new Date().toLocaleTimeString("pt-BR", { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
  
  mensagemDiv.innerHTML = `
    <div>${texto}</div>
    <small class="text-muted">${timestamp}</small>
  `;
  
  chatArea.appendChild(mensagemDiv);
  chatArea.scrollTop = chatArea.scrollHeight;
}

// Atualizar informações da consulta
function atualizarInfoConsulta() {
  const infoConsulta = document.getElementById("infoConsulta");
  
  if (!infoConsulta || !consultaEmAndamento) return;
  
  infoConsulta.innerHTML = `
    <div>
      <h6><i class="fas fa-user-md me-2"></i>Médico</h6>
      <p>Dr(a). Maria Silva</p>
      
      <h6><i class="fas fa-user me-2"></i>Paciente</h6>
      <p>João da Silva</p>
      
      <h6><i class="fas fa-clock me-2"></i>Duração</h6>
      <p id="duracaoConsulta">00:00</p>
      
      <h6><i class="fas fa-link me-2"></i>Link da Consulta</h6>
      <p class="small text-muted">${gerarLinkAcesso()}</p>
    </div>
  `;
  
  // Atualizar duração
  atualizarDuracaoConsulta();
}

// Atualizar duração da consulta
function atualizarDuracaoConsulta() {
  if (!consultaEmAndamento) return;
  
  const duracaoElement = document.getElementById("duracaoConsulta");
  if (!duracaoElement) return;
  
  const agora = new Date();
  const duracao = Math.floor((agora - consultaEmAndamento.inicio) / 1000);
  
  const minutos = Math.floor(duracao / 60);
  const segundos = duracao % 60;
  
  duracaoElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  
  setTimeout(atualizarDuracaoConsulta, 1000);
}

// Finalizar consulta
function finalizarConsulta() {
  if (!confirm("Tem certeza que deseja finalizar esta consulta?")) return;
  
  const sintomas = document.getElementById("sintomas").value;
  const diagnostico = document.getElementById("diagnostico").value;
  const recomendacoes = document.getElementById("recomendacoes").value;
  
  if (!sintomas || !diagnostico || !recomendacoes) {
    alert("Por favor, preencha todos os campos do prontuário.");
    return;
  }
  
  // Salvar prontuário
  const prontuario = {
    sintomas: sintomas,
    diagnostico: diagnostico,
    recomendacoes: recomendacoes,
    data: new Date().toISOString()
  };
  
  // Atualizar status da consulta
  consultaEmAndamento.status = "Concluída";
  consultaEmAndamento.prontuario = JSON.stringify(prontuario);
  
  // Salvar no localStorage
  localStorage.setItem("teleconsultas", JSON.stringify(teleconsultas));
  
  alert("Consulta finalizada com sucesso! Prontuário salvo.");
  
  // Encerrar consulta
  pararConsulta();
}

// Cancelar consulta
function cancelarConsulta(idConsulta) {
  if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;
  
  const consulta = teleconsultas.find(t => t.id === idConsulta);
  if (consulta) {
    consulta.status = "Cancelada";
    localStorage.setItem("teleconsultas", JSON.stringify(teleconsultas));
    carregarConsultas();
  }
}

// Ver prontuário
function verProntuario(idConsulta) {
  const consulta = teleconsultas.find(t => t.id === idConsulta);
  if (!consulta || !consulta.prontuario) return;
  
  const prontuario = JSON.parse(consulta.prontuario);
  
  alert(`Prontuário da consulta de ${consulta.paciente}:\n\n` +
        `Sintomas: ${prontuario.sintomas}\n\n` +
        `Diagnóstico: ${prontuario.diagnostico}\n\n` +
        `Recomendações: ${prontuario.recomendacoes}`);
}

// Event listener para Enter no chat
document.addEventListener("DOMContentLoaded", () => {
  const chatInput = document.getElementById("chatInput");
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        enviarMensagem();
      }
    });
  }
});