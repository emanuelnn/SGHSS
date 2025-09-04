// Sistema de consultas unificadas

let usuarios   = JSON.parse(localStorage.getItem("usuarios")) || [];
let consultas  = JSON.parse(localStorage.getItem("consultas")) || [];
let financeiro = JSON.parse(localStorage.getItem("financeiro")) || [];
const agendar_tab = document.getElementById("agendar-tab");
const pacientes_tab = document.getElementById("pacientes-tab");
const acessoRestrito = document.getElementById("acessoRestrito");
const filtroPaciente = document.getElementById("filtroConsulta");
const TabConsultas = document.getElementById("consultas-tab");
const nomeUsuario = localStorage.getItem("nomeUsuario") || "";
const perfil = (localStorage.getItem("perfil") || "comum").toLowerCase();

function verificarPermissoes() {
  const ehAdministrador = perfil === "administrador";
  const ehMedico = perfil === "médico";
  const ehEnfermeiro = perfil === "téc. de enfermagem";

  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {
    if (agendar_tab) {
      agendar_tab.style.display = "none";
    }
    if (pacientes_tab) {
      pacientes_tab.style.display = "none";
    }
    if (acessoRestrito) {
      acessoRestrito.style.display = "block";
    }

    filtroPaciente.style.display = "block";
    filtroPaciente.readOnly = true;
    filtroPaciente.value = nomeUsuario;
    TabConsultas.click();
  }
  return true;
}

let especialidades = [
  "Clínico Geral", "Pediatria", "Dermatologia", "Cardiologia", "Oftalmologia",
  "Ginecologia e Obstetrícia", "Ortopedia e Traumatologia", "Neurologia", "Psiquiatria",
  "Endocrinologia e Metabologia", "Gastroenterologia", "Urologia", "Otorrinolaringologia",
  "Reumatologia", "Pneumologia", "Nefrologia", "Infectologia", "Oncologia"
];

document.addEventListener("DOMContentLoaded", () => {
  verificarPermissoes();
  popularSelects();
  renderPacientes();
  renderConsultas();
 
  document.getElementById("filtroPaciente")?.addEventListener("input", renderPacientes);
  document.getElementById("filtroTipo")?.addEventListener("change", renderPacientes);
  document.getElementById("filtroConsulta")?.addEventListener("input", renderConsultas);
  document.getElementById("filtroStatus")?.addEventListener("change", renderConsultas);
  document.getElementById("filtroEspecialidade")?.addEventListener("change", renderConsultas);
 
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataConsulta")?.setAttribute("min", hoje);
});

function valorMonetarioAleatorio() {
  const valor = Math.floor(Math.random() * (2000 - 100 + 1)) + 50;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function popularSelects() {
  const selectPaciente = document.getElementById("nomePaciente");
  if (selectPaciente) {
    selectPaciente.innerHTML = '<option value="">Selecione o paciente</option>';
    const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
    pacientes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      selectPaciente.appendChild(option);
    });
  }
 
  const selectEspecialidade = document.getElementById("especialidade");
  if (selectEspecialidade) {
    selectEspecialidade.innerHTML = '<option value="">Selecione a especialidade</option>';
    especialidades.forEach(espec => {
      const option = document.createElement("option");
      option.value = espec;
      option.textContent = espec;
      selectEspecialidade.appendChild(option);
    });
  }

  const selectMedico = document.getElementById("medico");
  if (selectMedico) {
    selectMedico.innerHTML = '<option value="">Selecione o médico</option>';
    const medicos = usuarios.filter(u => u.tipoUsuario === "Médico");
    medicos.forEach(m => {
      const option = document.createElement("option");
      option.value = m.nome;
      option.textContent = m.nome;
      selectMedico.appendChild(option);
    });
  }
  
  const selectHora = document.getElementById("horaConsulta");
  if (selectHora) {
    selectHora.innerHTML = '<option value="">Selecione o horário</option>';
    const horarios = ["07:00", "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
    horarios.forEach(h => {
      const option = document.createElement("option");
      option.value = h;
      option.textContent = h;
      selectHora.appendChild(option);
    });
  }
  
  const filtroEspecialidade = document.getElementById("filtroEspecialidade");
  if (filtroEspecialidade) {
    filtroEspecialidade.innerHTML = '<option value="">Todas as especialidades</option>';
    especialidades.forEach(espec => {
      const option = document.createElement("option");
      option.value = espec;
      option.textContent = espec;
      filtroEspecialidade.appendChild(option);
    });
  }
}

function agendarConsulta() {
  const paciente = document.getElementById("nomePaciente").value;
  const especialidade = document.getElementById("especialidade").value;
  const data = document.getElementById("dataConsulta").value;
  const hora = document.getElementById("horaConsulta").value;
  const medico = document.getElementById("medico").value;
  const prioridade = document.getElementById("prioridade").value;
  const motivo = document.getElementById("motivoConsulta").value;
  const observacoes = document.getElementById("observacoes").value;
  
  if (!paciente || !especialidade || !data || !hora || !medico) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  
  const hoje = new Date();
  const dataConsulta = new Date(data + " " + hora);
  if (dataConsulta < hoje) {
    alert("Não é possível agendar consultas para datas passadas.");
    return;
  }
  
  if (perfil === "Paciente") {
    if (paciente !== nomeUsuario) {
      alert("Você só pode agendar consultas para si mesmo.");
      return;
    }
  }
  
    const novaConsulta = {
      id: Date.now(),
      paciente: paciente,
      especialidade: especialidade,
      data: data,
      hora: hora,
      medico: medico,
      prioridade: prioridade,
      motivo: motivo,
      observacoes: observacoes,
      status: "Futuras",
      dataCadastro: new Date().toISOString()
    };

    consultas.push(novaConsulta);
    localStorage.setItem("consultas", JSON.stringify(consultas));

    const NovaCobranca = {
    id: financeiro.length + 1,
    paciente: paciente,
    tipo: "Consulta",
    data: data,
    valor: valorMonetarioAleatorio()
    };
  
    financeiro.push(NovaCobranca);
    localStorage.setItem("financeiro", JSON.stringify(financeiro));
  
    const mensagem = document.getElementById("mensagemAgendamento");
    if (mensagem) {
      mensagem.className = "alert alert-success alert-dismissible fade show";
      mensagem.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>
        Consulta agendada com sucesso!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
    }
  
    document.getElementById("nomePaciente").value = "";
    document.getElementById("especialidade").value = "";
    document.getElementById("dataConsulta").value = "";
    document.getElementById("horaConsulta").value = "";
    document.getElementById("medico").value = "";
    document.getElementById("prioridade").value = "Normal";
    document.getElementById("motivoConsulta").value = "";
    document.getElementById("observacoes").value = "";
    
    renderConsultas();
  }

  function renderPacientes() {
    const lista = document.getElementById("pacienteList");
    if (!lista) return;
    
    const filtroNome = (document.getElementById("filtroPaciente").value || "").trim().toLowerCase();
    const filtroTipo = document.getElementById("filtroTipo").value;
    
    let filtrados = usuarios.filter(u => {
      const matchNome = u.nome.toLowerCase().includes(filtroNome);
      const matchTipo = !filtroTipo || u.tipoUsuario === filtroTipo;
      return matchNome && matchTipo;
    });
    
    lista.innerHTML = "";
    
    if (filtrados.length === 0) {
      lista.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-users fa-2x mb-2"></i><p>Nenhum paciente encontrado.</p></div>';
      return;
    }
    
    filtrados.forEach(p => {
      const card = document.createElement("div");
      card.className = "list-group-item list-group-item-action";
      
      // Verificar restrições de perfil
      let botoesAcao = "";
      if (perfil === "Administrador" || (perfil === "Médico" && p.tipoUsuario === "Paciente")) {
        botoesAcao = `
          <div class="ms-auto">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetalhesPaciente('${p.nome}')">
              <i class="fas fa-eye"></i>
            </button>
            ${perfil === "Administrador" ? `
              <button class="btn btn-sm btn-outline-danger" onclick="removerPaciente('${p.nome}')">
                <i class="fas fa-trash"></i>
              </button>
            ` : ""}
          </div>
        `;
      }
      
      card.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <div>
            <h6 class="mb-1">${p.nome}</h6>
            <p class="mb-1">
              <small class="text-muted">
                <i class="fas fa-id-badge me-1"></i>${p.tipoUsuario} | 
                <i class="fas fa-calendar me-1"></i>${p.nascimento} | 
                <i class="fas fa-envelope me-1"></i>${p.email}
              </small>
            </p>
          </div>
          ${botoesAcao}
        </div>
      `;
      
      lista.appendChild(card);
    });
  }

  function renderConsultas() {
    const lista = document.getElementById("consultaList");
    if (!lista) return;
    
    const filtroPaciente = (document.getElementById("filtroConsulta").value || "").trim().toLowerCase();
    const filtroStatus = document.getElementById("filtroStatus").value;
    const filtroEspecialidade = document.getElementById("filtroEspecialidade").value;
    
    let filtrados = consultas.filter(c => {
      const matchPaciente = c.paciente.toLowerCase().includes(filtroPaciente);
      const matchStatus = !filtroStatus || c.status === filtroStatus;
      const matchEspecialidade = !filtroEspecialidade || c.especialidade === filtroEspecialidade;
      return matchPaciente && matchStatus && matchEspecialidade;
    });
    
    // Ordenar por data e hora
    filtrados.sort((a, b) => {
      const dataA = new Date(a.data + " " + a.hora);
      const dataB = new Date(b.data + " " + b.hora);
      return dataA - dataB;
    });
    
    lista.innerHTML = "";
    
    if (filtrados.length === 0) {
      lista.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-calendar-times fa-2x mb-2"></i><p>Nenhuma consulta encontrada.</p></div>';
      return;
    }
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    filtrados.forEach(c => {
      const dataConsulta = new Date(c.data);
      let status = c.status;
      
      if (c.status === "Futuras" && dataConsulta < hoje) {
        status = "Passadas";
      } else if (c.status === "Futuras" && dataConsulta.getTime() === hoje.getTime()) {
        status = "Hoje";
      }
      
      const card = document.createElement("div");
      card.className = "list-group-item list-group-item-action";
      
      // Verificar restrições de perfil
      let botoesAcao = "";
      if (perfil === "Administrador" || 
          (perfil === "Médico" && c.medico === nomeUsuario) ||
          (perfil === "Paciente" && c.paciente === nomeUsuario)) {
        
        botoesAcao = `
          <div class="ms-auto">
            <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetalhesConsulta(${c.id})">
              <i class="fas fa-eye"></i>
            </button>
            ${status !== "Passadas" ? `
              <button class="btn btn-sm btn-outline-warning me-1" onclick="editarConsulta(${c.id})">
                <i class="fas fa-edit"></i>
              </button>
            ` : ""}
            ${perfil === "Administrador" && status !== "Passadas" ? `
              <button class="btn btn-sm btn-outline-danger" onclick="cancelarConsulta(${c.id})">
                <i class="fas fa-trash"></i>
              </button>
            ` : ""}
          </div>
        `;
      }
      
      const prioridadeClass = {
        "Normal": "bg-secondary",
        "Urgente": "bg-warning",
        "Emergência": "bg-danger"
      }[c.prioridade] || "bg-secondary";
      
      card.innerHTML = `
        <div class="d-flex w-100 justify-content-between">
          <div>
            <div class="d-flex align-items-center mb-1">
              <h6 class="mb-0 me-2">${c.paciente}</h6>
              <span class="badge ${prioridadeClass}">${c.prioridade}</span>
            </div>
            <p class="mb-1">
              <small class="text-muted">
                <i class="fas fa-user-md me-1"></i>${c.medico} | 
                <i class="fas fa-stethoscope me-1"></i>${c.especialidade} | 
                <i class="fas fa-calendar me-1"></i>${c.data} às ${c.hora} - Status: ${c.status}
              </small>
            </p>
            ${c.motivo ? `<p class="mb-0"><small><strong>Motivo:</strong> ${c.motivo}</small></p>` : ""}
          </div>
          ${botoesAcao}
        </div>
      `;
      
      lista.appendChild(card);
    });
  }

  // Detalhes do paciente
  function verDetalhesPaciente(nome) {
    const paciente = usuarios.find(u => u.nome === nome);
    if (!paciente) return;
    
    alert(`Detalhes do Paciente:\n\nNome: ${paciente.nome}\nCPF: ${paciente.cpf}\nNascimento: ${paciente.nascimento}\nEmail: ${paciente.email}\nTipo: ${paciente.tipoUsuario}`);
  }

  // Remover paciente
  function removerPaciente(nome) {
    if (!confirm(`Tem certeza que deseja remover o paciente ${nome}?`)) return;
    
    if (perfil !== "Administrador") {
      alert("Acesso negado: apenas administradores podem remover pacientes.");
      return;
    }
    
    // Remover paciente e consultas vinculadas
    usuarios = usuarios.filter(u => u.nome !== nome);
    consultas = consultas.filter(c => c.paciente !== nome);
    
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("consultas", JSON.stringify(consultas));
    
    renderPacientes();
    renderConsultas();
  }

  // Ver detalhes da consulta
  function verDetalhesConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (!consulta) return;
    
    const modal = new bootstrap.Modal(document.getElementById("modalConsulta"));
    const conteudo = document.getElementById("conteudoModalConsulta");
    
    conteudo.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6><i class="fas fa-user me-2"></i>Paciente</h6>
          <p>${consulta.paciente}</p>
          
          <h6><i class="fas fa-user-md me-2"></i>Médico</h6>
          <p>${consulta.medico}</p>
          
          <h6><i class="fas fa-stethoscope me-2"></i>Especialidade</h6>
          <p>${consulta.especialidade}</p>
        </div>
        <div class="col-md-6">
          <h6><i class="fas fa-calendar me-2"></i>Data e Horário</h6>
          <p>${consulta.data} às ${consulta.hora}</p>
          
          <h6><i class="fas fa-flag me-2"></i>Prioridade</h6>
          <p><span class="badge bg-${getPrioridadeClass(consulta.prioridade)}">${consulta.prioridade}</span></p>
          
          <h6><i class="fas fa-info-circle me-2"></i>Status</h6>
          <p>${consulta.status}</p>
        </div>
      </div>
      
      ${consulta.motivo ? `
        <div class="mt-3">
          <h6><i class="fas fa-clipboard-list me-2"></i>Motivo da Consulta</h6>
          <p>${consulta.motivo}</p>
        </div>
      ` : ""}
      
      ${consulta.observacoes ? `
        <div class="mt-3">
          <h6><i class="fas fa-sticky-note me-2"></i>Observações</h6>
          <p>${consulta.observacoes}</p>
        </div>
      ` : ""}
    `;
    
    // Configurar botões do modal
    const btnEditar = document.getElementById("btnEditarConsulta");
    const btnCancelar = document.getElementById("btnCancelarConsulta");
    
    btnEditar.onclick = () => editarConsulta(id);
    btnCancelar.onclick = () => cancelarConsulta(id);
    
    modal.show();
  }

  // Editar consulta
  function editarConsulta(id) {
    const consulta = consultas.find(c => c.id === id);
    if (!consulta) return;
    
    // Preencher formulário
    document.getElementById("nomePaciente").value = consulta.paciente;
    document.getElementById("especialidade").value = consulta.especialidade;
    document.getElementById("dataConsulta").value = consulta.data;
    document.getElementById("horaConsulta").value = consulta.hora;
    document.getElementById("medico").value = consulta.medico;
    document.getElementById("prioridade").value = consulta.prioridade;
    document.getElementById("motivoConsulta").value = consulta.motivo || "";
    document.getElementById("observacoes").value = consulta.observacoes || "";
    
    // Remover consulta antiga
    consultas = consultas.filter(c => c.id !== id);
    localStorage.setItem("consultas", JSON.stringify(consultas));
    
    bootstrap.Modal.getInstance(document.getElementById("modalConsulta")).hide();
    
    const agendarTab = new bootstrap.Tab(document.getElementById("agendar-tab"));
    agendarTab.show();
    
    document.getElementById("agendar").scrollIntoView({ behavior: 'smooth' });
  }

  // Cancelar consulta
  function cancelarConsulta(id) {
    if (!confirm("Tem certeza que deseja cancelar esta consulta?")) return;
    
    if (perfil !== "Administrador") {
      alert("Acesso negado: apenas administradores podem cancelar consultas.");
      return;
    }
    
    const index = consultas.findIndex(c => c.id === id);
    if (index !== -1) {
      consultas.splice(index, 1);
      localStorage.setItem("consultas", JSON.stringify(consultas));
      renderConsultas();
    }
    
    bootstrap.Modal.getInstance(document.getElementById("modalConsulta")).hide();
  }

  // Funções auxiliares
  function getPrioridadeClass(prioridade) {
    const classes = {
      "Normal": "secondary",
      "Urgente": "warning",
      "Emergência": "danger"
    };
    return classes[prioridade] || "secondary";
  }