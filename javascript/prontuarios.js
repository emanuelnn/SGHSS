// Gerenciamento de prontuários eletrônicos
let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let prontuarios = JSON.parse(localStorage.getItem("prontuarios")) || [];
let pacienteSelecionado = null;

const filtroPacienteInput = document.getElementById("filtroPaciente");
const filtroCPFSelect = document.getElementById("filtroCPF");
const listaPacientes = document.getElementById("listaPacientes");
const infoPaciente = document.getElementById("infoPaciente");
const conteudoProntuario = document.getElementById("conteudoProntuario");

const prontuarios_tab = document.getElementById("prontuarios_tab");
const acessoRestrito = document.getElementById("acessoRestrito");

const perfil = (localStorage.getItem("perfil") || "comum").toLowerCase();

function verificarPermissoes() {
  const ehAdministrador = perfil === "administrador";
  const ehMedico = perfil === "médico";
  const ehEnfermeiro = perfil === "téc. de enfermagem";

  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {
      if (prontuarios_tab) {
        prontuarios_tab.style.display = "none";
      }
      if (acessoRestrito) {
        acessoRestrito.style.display = "block";
      }
  }
  return true;
}

// Função utilitária para formatar data
function formatarDataBR(dataISO) {
  return dataISO ? dataISO.split("-").reverse().join("/") : "";
}

// Função utilitária para formatar CPF
function formatarCPF(cpf) {
  return cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3-**") : "";
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  verificarPermissoes();
  popularListaPacientes();
  popularFiltroCPF();
  
  // Event listeners
  filtroPacienteInput?.addEventListener("input", filtrarPacientes);
  filtroCPFSelect?.addEventListener("change", filtrarPacientes);
  
  // Formulário de edição
  const formProntuario = document.getElementById("formProntuario");
  if (formProntuario) {
    formProntuario.addEventListener("submit", salvarProntuario);
  }
});

// Popular lista de pacientes
function popularListaPacientes() {
  const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
  listaPacientes.innerHTML = "";
  
  pacientes.forEach((paciente, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action cursor-pointer";
    li.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${paciente.nome}</strong><br>
          <small class="text-muted">CPF: ${formatarCPF(paciente.cpf)}</small>
        </div>
        <i class="fas fa-chevron-right text-muted"></i>
      </div>
    `;
    li.addEventListener("click", () => selecionarPaciente(paciente, index));
    listaPacientes.appendChild(li);
  });
  
  if (pacientes.length === 0) {
    listaPacientes.innerHTML = '<li class="list-group-item text-muted text-center">Nenhum paciente cadastrado</li>';
  }
}

// Popular filtro de CPF
function popularFiltroCPF() {
  const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
  filtroCPFSelect.innerHTML = '<option value="">Todos os pacientes</option>';
  
  pacientes.forEach(paciente => {
    const option = document.createElement("option");
    option.value = paciente.cpf;
    option.textContent = `${paciente.nome} (${formatarCPF(paciente.cpf)})`;
    filtroCPFSelect.appendChild(option);
  });
}

// Filtrar pacientes
function filtrarPacientes() {
  const filtroNome = (filtroPacienteInput?.value || "").toLowerCase();
  const filtroCPF = filtroCPFSelect?.value || "";
  
  const pacientesFiltrados = usuarios.filter(u => {
    const ehPaciente = u.tipoUsuario === "Paciente";
    const matchNome = u.nome.toLowerCase().includes(filtroNome);
    const matchCPF = !filtroCPF || u.cpf === filtroCPF;
    return ehPaciente && matchNome && matchCPF;
  });
  
  listaPacientes.innerHTML = "";
  pacientesFiltrados.forEach(paciente => {
    const li = document.createElement("li");
    li.className = "list-group-item list-group-item-action cursor-pointer";
    li.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${paciente.nome}</strong><br>
          <small class="text-muted">CPF: ${formatarCPF(paciente.cpf)}</small>
        </div>
        <i class="fas fa-chevron-right text-muted"></i>
      </div>
    `;
    li.addEventListener("click", () => selecionarPaciente(paciente));
    listaPacientes.appendChild(li);
  });
  
  if (pacientesFiltrados.length === 0) {
    listaPacientes.innerHTML = '<li class="list-group-item text-muted text-center">Nenhum paciente encontrado</li>';
  }
}

// Selecionar paciente
function selecionarPaciente(paciente) {
  pacienteSelecionado = paciente;
  
  // Exibir informações do paciente
  infoPaciente.innerHTML = `
    <div class="text-start">
      <h5 class="mb-3">${paciente.nome}</h5>
      <div class="row">
        <div class="col-md-6">
          <p><strong>CPF:</strong> ${paciente.cpf}</p>
          <p><strong>Data de Nascimento:</strong> ${formatarDataBR(paciente.nascimento)}</p>
          <p><strong>Email:</strong> ${paciente.email}</p>
        </div>
        <div class="col-md-6">
          <p><strong>Telefone:</strong> ${paciente.telefone || "Não informado"}</p>
          <p><strong>Tipo:</strong> ${paciente.tipoUsuario}</p>
        </div>
      </div>
      <div class="mt-3">
        <button class="btn btn-primary" onclick="visualizarProntuario('${paciente.nome}')">
          <i class="fas fa-file-medical me-1"></i>Visualizar Prontuário
        </button>
      </div>
    </div>
  `;
}

// Visualizar prontuário
function visualizarProntuario(nomePaciente) {
  const prontuario = prontuarios.find(p => p.paciente === nomePaciente);
  
  if (prontuario) {
    conteudoProntuario.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h6><i class="fas fa-history me-2"></i>Histórico Pregressos</h6>
          <p class="border rounded p-3 bg-light">${prontuario.historicoPregressos || "Não informado"}</p>
        </div>
        <div class="col-md-6">
          <h6><i class="fas fa-exclamation-triangle me-2"></i>Alergias</h6>
          <p class="border rounded p-3 bg-light">${prontuario.alergias || "Não informado"}</p>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-md-6">
          <h6><i class="fas fa-pills me-2"></i>Medicamentos em Uso</h6>
          <p class="border rounded p-3 bg-light">${prontuario.medicamentos || "Não informado"}</p>
        </div>
        <div class="col-md-6">
          <h6><i class="fas fa-users me-2"></i>Histórico Familiar</h6>
          <p class="border rounded p-3 bg-light">${prontuario.historicoFamiliar || "Não informado"}</p>
        </div>
      </div>
      <div class="mt-3">
        <h6><i class="fas fa-sticky-note me-2"></i>Observações Gerais</h6>
        <p class="border rounded p-3 bg-light">${prontuario.observacoes || "Não informado"}</p>
      </div>
      <div class="mt-3">
        <small class="text-muted">
          <i class="fas fa-clock me-1"></i>
          Última atualização: ${prontuario.dataAtualizacao || "Primeiro registro"}
        </small>
      </div>
    `;
  } else {
    conteudoProntuario.innerHTML = `
      <div class="text-center text-muted">
        <i class="fas fa-file-medical fa-3x mb-3"></i>
        <h6>Nenhum prontuário encontrado</h6>
        <p>Clique no botão "Editar" para criar o prontuário do paciente.</p>
      </div>
    `;
  }
  
  // Habilitar aba de visualização
  const visualizarTab = document.getElementById("visualizar-tab");
  const editarTab = document.getElementById("editar-tab");
  visualizarTab.disabled = false;
  editarTab.disabled = false;
  
  // Mudar para aba de visualização
  const visualizarTabButton = new bootstrap.Tab(visualizarTab);
  visualizarTabButton.show();
}

// Habilitar edição
function habilitarEdicao() {
  const prontuario = prontuarios.find(p => p.paciente === pacienteSelecionado.nome);
  
  if (prontuario) {
    document.getElementById("historicoPregressos").value = prontuario.historicoPregressos || "";
    document.getElementById("alergias").value = prontuario.alergias || "";
    document.getElementById("medicamentos").value = prontuario.medicamentos || "";
    document.getElementById("historicoFamiliar").value = prontuario.historicoFamiliar || "";
    document.getElementById("observacoes").value = prontuario.observacoes || "";
  } else {
    // Limpar campos
    document.getElementById("historicoPregressos").value = "";
    document.getElementById("alergias").value = "";
    document.getElementById("medicamentos").value = "";
    document.getElementById("historicoFamiliar").value = "";
    document.getElementById("observacoes").value = "";
  }
  
  // Mudar para aba de edição
  const editarTab = document.getElementById("editar-tab");
  const editarTabButton = new bootstrap.Tab(editarTab);
  editarTabButton.show();
}

// Cancelar edição
function cancelarEdicao() {
  visualizarProntuario(pacienteSelecionado.nome);
}

// Salvar prontuário
function salvarProntuario(e) {
  e.preventDefault();
  
  if (!pacienteSelecionado) {
    alert("Selecione um paciente primeiro.");
    return;
  }
  
  const prontuarioAtualizado = {
    paciente: pacienteSelecionado.nome,
    historicoPregressos: document.getElementById("historicoPregressos").value,
    alergias: document.getElementById("alergias").value,
    medicamentos: document.getElementById("medicamentos").value,
    historicoFamiliar: document.getElementById("historicoFamiliar").value,
    observacoes: document.getElementById("observacoes").value,
    dataAtualizacao: new Date().toLocaleString("pt-BR")
  };
  
  // Verificar se já existe prontuário
  const indexExistente = prontuarios.findIndex(p => p.paciente === pacienteSelecionado.nome);
  
  if (indexExistente !== -1) {
    prontuarios[indexExistente] = prontuarioAtualizado;
  } else {
    prontuarios.push(prontuarioAtualizado);
  }
  
  localStorage.setItem("prontuarios", JSON.stringify(prontuarios));
  
  // Mostrar mensagem de sucesso
  const alerta = document.createElement("div");
  alerta.className = "alert alert-success alert-dismissible fade show";
  alerta.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Prontuário salvo com sucesso!
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const form = document.getElementById("formProntuario");
  form.parentNode.insertBefore(alerta, form);
  
  // Remover alerta após 3 segundos
  setTimeout(() => {
    alerta.remove();
  }, 3000);
  
  // Voltar para visualização
  visualizarProntuario(pacienteSelecionado.nome);
}