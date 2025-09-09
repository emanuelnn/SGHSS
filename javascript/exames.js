let usuarios      = JSON.parse(localStorage.getItem("usuarios")) || [];
let exames        = JSON.parse(localStorage.getItem("exames")) || [];
let consultas     = JSON.parse(localStorage.getItem("consultas")) || [];
let teleconsultas = JSON.parse(localStorage.getItem("teleconsultas")) || [];
let financeiro    = JSON.parse(localStorage.getItem("financeiro")) || [];

const tiposExames = [
  "Hemograma Completo", "Glicemia de Jejum", "Colesterol Total", "TSH", "T4 Livre",
  "Urina Tipo 1", "Ultrassonografia Abdominal", "Rai-X de Tórax", "Eletrocardiograma",
  "Tomografia Computadorizada", "Ressonância Magnética", "Endoscopia", "Colonoscopia",
  "Mamografia", "Papanicolau", "PSA", "Hemocultura", "Ecocardiograma"
];

const nomeUsuario = localStorage.getItem("nomeUsuario") || "";
const pacienteExame = document.getElementById("pacienteExame");
const filtroPacienteResultado = document.getElementById("filtroPacienteResultado");
const pacienteHistorico = document.getElementById("pacienteHistorico");
const filtroTipoExame = document.getElementById("BtnFiltrarResultado");
const perfil = (localStorage.getItem("perfil") || "comum");

function verificarPermissoes() {
  const ehAdministrador = perfil === "Administrador";
  const ehMedico = perfil === "Médico";
  const ehEnfermeiro = perfil === "Tec. Enfermagem";

  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {

    if (pacienteExame) {
      substituirPorInput(pacienteExame, nomeUsuario);
    }

    if (filtroPacienteResultado) {
      substituirPorInput(filtroPacienteResultado, nomeUsuario);
    }

    if (pacienteHistorico) {
      substituirPorInput(pacienteHistorico, nomeUsuario);
    }

    filtrarResultados();

  }
}

function substituirPorInput(elemento, valor) {
  if (!elemento) return;

  const input = document.createElement("input");
  input.type = "text";
  input.className = elemento.className;
  input.id = elemento.id;
  input.name = elemento.name || elemento.id;
  input.value = valor;
  input.readOnly = true;

  elemento.parentNode.replaceChild(input, elemento);
}

function valorMonetarioAleatorio() {
  const valor = Math.floor(Math.random() * (2000 - 100 + 1)) + 50;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

document.addEventListener("DOMContentLoaded", () => {
  popularPacientes();
 
  document.getElementById("tipoExame")?.addEventListener("change", toggleOutroExame);
  document.getElementById("dataExame")?.addEventListener("change", validarDataExame);
  
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("dataExame")?.setAttribute("min", hoje);
});

function popularPacientes() {
  const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
  
  if (pacienteExame) {
    pacienteExame.innerHTML = '<option value="">Selecione o paciente</option>';
    pacientes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      pacienteExame.appendChild(option);
    });
  }
  
  const filtroPacienteResultado = document.getElementById("filtroPacienteResultado");
  if (filtroPacienteResultado) {
    filtroPacienteResultado.innerHTML = '<option value="">Todos os pacientes</option>';
    pacientes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      filtroPacienteResultado.appendChild(option);
    });
  }
  
  // Select de histórico
  const pacienteHistorico = document.getElementById("pacienteHistorico");
  if (pacienteHistorico) {
    pacienteHistorico.innerHTML = '<option value="">Selecione o paciente</option>';
    pacientes.forEach(p => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      pacienteHistorico.appendChild(option);
    });
  }
}

function preencherTiposExame(tipoExame) {
  const select = document.getElementById(tipoExame);
  if (!select) return;

  select.innerHTML = '<option value="">Selecione o tipo</option>';

  tiposExames.forEach(tipo => {
    const option = document.createElement("option");
    option.value = tipo;
    option.textContent = tipo;
    select.appendChild(option);
  });
}

function toggleOutroExame() {
  const tipoExame = document.getElementById("tipoExame").value;
  const outroExameDiv = document.getElementById("outroExameDiv");
  
  if (tipoExame === "Outro") {
    outroExameDiv.style.display = "block";
    document.getElementById("outroExame").required = true;
  } else {
    outroExameDiv.style.display = "none";
    document.getElementById("outroExame").required = false;
    document.getElementById("outroExame").value = "";
  }
}

function validarDataExame() {
  const dataExame = document.getElementById("dataExame").value;
  const dataAtual = new Date().toISOString().split("T")[0];
  
  if (dataExame < dataAtual) {
    alert("A data do exame não pode ser anterior à data atual.");
    document.getElementById("dataExame").value = dataAtual;
  }
}

function agendarExame() {
    const paciente = document.getElementById("pacienteExame").value;
    const tipoExame = document.getElementById("tipoExame").value;
    const outroExame = document.getElementById("outroExame").value;
    const dataExame = document.getElementById("dataExame").value;
    const horarioExame = document.getElementById("horarioExame").value;
    const localExame = document.getElementById("localExame").value;
    const observacoesExame = document.getElementById("observacoesExame").value;
    
    // Validação
    if (!paciente || !tipoExame || !dataExame || !horarioExame || !localExame) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
 
    if (tipoExame === "Outro" && !outroExame) {
      alert("Por favor, especifique o tipo de exame.");
      return;
    }
  
    const novoExame = {
      id: Date.now(),
      paciente: paciente,
      tipo: tipoExame === "Outro" ? outroExame : tipoExame,
      data: dataExame,
      horario: horarioExame,
      local: localExame,
      observacoes: observacoesExame,
      status: "Aguardando",
      resultado: "",
      medicoResponsavel: "",
      dataResultado: "",
      dataCadastro: new Date().toISOString()
    };

    exames.push(novoExame);
    localStorage.setItem("exames", JSON.stringify(exames));
    
    const NovaCobranca = {
    id: financeiro.length + 1,
    paciente: paciente,
    tipo: "Exame",
    data: dataExame,
    valor: valorMonetarioAleatorio()
    };
  
    financeiro.push(NovaCobranca);
    localStorage.setItem("financeiro", JSON.stringify(financeiro));
  
    // Mostrar mensagem de sucesso
    const alerta = document.createElement("div");
    alerta.className = "alert alert-success alert-dismissible fade show";
    alerta.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Exame marcado com sucesso!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector("#agendar .container");
    container.insertBefore(alerta, container.firstChild);
  
    // Limpar formulário
    document.getElementById("pacienteExame").value = "";
    document.getElementById("tipoExame").value = "";
    document.getElementById("outroExame").value = "";
    document.getElementById("dataExame").value = "";
    document.getElementById("horarioExame").value = "";
    document.getElementById("localExame").value = "";
    document.getElementById("observacoesExame").value = "";
    toggleOutroExame();
    
    // Remover alerta após 3 segundos
    setTimeout(() => {
      alerta.remove();
    }, 3000);
}

function filtrarResultados() {
  const filtroPaciente = document.getElementById("filtroPacienteResultado").value;
  const filtroTipo = document.getElementById("filtroTipoExame").value;
  const filtroStatus = document.getElementById("filtroStatus").value;
  
  const examesFiltrados = exames.filter(exame => {
    const matchPaciente = !filtroPaciente || exame.paciente === filtroPaciente;
    const matchTipo = !filtroTipo || exame.tipo === filtroTipo;
    const matchStatus = !filtroStatus || exame.status === filtroStatus;
    return matchPaciente && matchTipo && matchStatus;
  });
  
  renderizarResultados(examesFiltrados);
}

function renderizarResultados(examesParaRenderizar) {
  const listaResultados = document.getElementById("listaResultados");
  
  if (!listaResultados) return;
  
  listaResultados.innerHTML = "";
  
  if (examesParaRenderizar.length === 0) {
    listaResultados.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-search fa-2x mb-2"></i><p>Nenhum exame encontrado</p></div>';
    return;
  }
  
  examesParaRenderizar.forEach(exame => {
    const card = document.createElement("div");
    card.className = "card mb-3";
    
    const statusClass = {
      "Aguardando": "bg-warning",
      "Realizado": "bg-info",
      "Resultado Disponível": "bg-success"
    }[exame.status] || "bg-secondary";
    
    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="mb-1">${exame.paciente}</h6>
            <p class="mb-1"><strong>${exame.tipo}</strong></p>
            <p class="mb-1 text-muted">
              <i class="fas fa-calendar me-1"></i>${exame.data} às ${exame.hora}
            </p>
            <p class="mb-1 text-muted">
              <i class="fas fa-map-marker-alt me-1"></i>${exame.local}
            </p>
            <span class="badge ${statusClass}">${exame.status}</span>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-ellipsis-v"></i>
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#" onclick="verDetalhesExame(${exame.id})">
                <i class="fas fa-eye me-1"></i>Ver Detalhes
              </a></li>
              ${exame.status === "Realizado" ? `<li><a class="dropdown-item" href="#" onclick="adicionarResultado(${exame.id})">
                <i class="fas fa-plus me-1"></i>Adicionar Resultado
              </a></li>` : ""}
              ${perfil === "Administrador" ? `<li><a class="dropdown-item text-danger" href="#" onclick="cancelarExame(${exame.id})">
                <i class="fas fa-trash me-1"></i>Cancelar
              </a></li>` : ""}
            </ul>
          </div>
        </div>
      </div>
    `;
    
    listaResultados.appendChild(card);
  });
}


function verDetalhesExame(idExame) {
  const exame = exames.find(e => e.id === idExame);
  if (!exame) return;
  
  const modal = new bootstrap.Modal(document.getElementById("modalResultado"));
  const conteudoModal = document.getElementById("conteudoModalResultado");
  
  conteudoModal.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <h6><i class="fas fa-user me-2"></i>Paciente</h6>
        <p>${exame.paciente}</p>
        
        <h6><i class="fas fa-vial me-2"></i>Tipo de Exame</h6>
        <p>${exame.tipo}</p>
        
        <h6><i class="fas fa-calendar me-2"></i>Data e Horário</h6>
        <p>${exame.data} às ${exame.horario}</p>
        
        <h6><i class="fas fa-map-marker-alt me-2"></i>Local</h6>
        <p>${exame.local}</p>
      </div>
      <div class="col-md-6">
        <h6><i class="fas fa-info-circle me-2"></i>Status</h6>
        <p><span class="badge ${getStatusClass(exame.status)}">${exame.status}</span></p>
        
        ${exame.medicoResponsavel ? `
          <h6><i class="fas fa-user-md me-2"></i>Médico Responsável</h6>
          <p>${exame.medicoResponsavel}</p>
        ` : ""}
        
        ${exame.dataResultado ? `
          <h6><i class="fas fa-clock me-2"></i>Data do Resultado</h6>
          <p>${exame.dataResultado}</p>
        ` : ""}
      </div>
    </div>
    
    ${exame.observacoes ? `
      <div class="mt-3">
        <h6><i class="fas fa-sticky-note me-2"></i>Observações</h6>
        <p>${exame.observacoes}</p>
      </div>
    ` : ""}
    
    ${exame.resultado ? `
      <div class="mt-3">
        <h6><i class="fas fa-file-medical-alt me-2"></i>Resultado</h6>
        <div class="border rounded p-3 bg-light">
          <pre>${exame.resultado}</pre>
        </div>
      </div>
    ` : ""}
  `;
  
  modal.show();
}

function adicionarResultado(idExame) {
  const exame = exames.find(e => e.id === idExame);
  if (!exame) return;
  
  const resultado = prompt(`Digite o resultado do exame para ${exame.paciente}:`);
  if (resultado && resultado.trim()) {
    exame.resultado = resultado.trim();
    exame.status = "Resultado Disponível";
    exame.dataResultado = new Date().toLocaleDateString("pt-BR");
    
    localStorage.setItem("exames", JSON.stringify(exames));
    
    alert("Resultado adicionado com sucesso!");
    filtrarResultados();
  }
}

function cancelarExame(idExame) {
  if (!confirm("Tem certeza que deseja cancelar este exame?")) return;
  
  const index = exames.findIndex(e => e.id === idExame);
  if (index !== -1) {
    exames.splice(index, 1);
    localStorage.setItem("exames", JSON.stringify(exames));
    filtrarResultados();
  }
}

function carregarHistoricoExames() {
  const paciente = document.getElementById("pacienteHistorico").value;
  const periodo = document.getElementById("periodoHistorico").value;
  
  if (!paciente) {
    document.getElementById("historicoExames").innerHTML = '<div class="text-center text-muted">Selecione um paciente para ver o histórico</div>';
    return;
  }
  
  let examesFiltrados = exames.filter(e => e.paciente === paciente);
  
  // Filtrar por período
  if (periodo !== "todos") {
    const dias = parseInt(periodo);
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    
    examesFiltrados = examesFiltrados.filter(e => {
      const dataExame = new Date(e.data);
      return dataExame >= dataLimite;
    });
  }
  
  // Ordenar por data (mais recente primeiro)
  examesFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  const historicoExames = document.getElementById("historicoExames");
  
  if (examesFiltrados.length === 0) {
    historicoExames.innerHTML = '<div class="text-center text-muted">Nenhum exame encontrado para este período</div>';
    return;
  }
  
  historicoExames.innerHTML = examesFiltrados.map(exame => `
    <div class="card mb-2">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h6 class="mb-1">${exame.tipo}</h6>
            <p class="mb-0 text-muted">${exame.data} às ${exame.horario}</p>
            <span class="badge ${getStatusClass(exame.status)}">${exame.status}</span>
          </div>
          <button class="btn btn-sm btn-outline-primary" onclick="verDetalhesExame(${exame.id})">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    </div>
  `).join("");
}


function getStatusClass(status) {
  const classes = {
    "Aguardando": "bg-warning",
    "Realizado": "bg-info",
    "Resultado Disponível": "bg-success"
  };
  return classes[status] || "bg-secondary";
}

function imprimirResultado() {
  window.print();
}

document.addEventListener("DOMContentLoaded", () => {
  renderizarResultados(exames);
  verificarPermissoes();
  preencherTiposExame("tipoExame");
  preencherTiposExame("filtroTipoExame");
});