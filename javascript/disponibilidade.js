// JavaScript para página de Disponibilidade Médica - SGHSS
// Autor: Sistema de Gestão Hospitalar e de Serviços de Saúde
// Data: 2024

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let disponibilidade = JSON.parse(localStorage.getItem("disponibilidade")) || [];
let qualificacoes = JSON.parse(localStorage.getItem("qualificacoes")) || [];
let profissionalSelecionado = null;
let dataSelecionada = null;
let mesAtual = new Date();
let anoAtual = new Date();

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  carregarProfissionais();
  renderizarCalendario();
  carregarQualificacoes();
 
  // Verificar permissões
  const perfil = localStorage.getItem("perfil") || "comum";
  if (perfil === "Paciente") {
    alert("Acesso negado! Apenas administradores, médicos e enfermeiros podem acessar esta página.");
    window.location.href = "dashboard.html";
  }
});

// Carregar profissionais
function carregarProfissionais() {
  const select = document.getElementById('profissionalSelect');
  const listaProfissionais = document.getElementById('listaProfissionais');
  
  // Filtrar apenas médicos e enfermeiros
  const profissionais = usuarios.filter(u => u.tipoUsuario === "Médico" || u.tipoUsuario === "Enfermeiro");
  
  // Popular select
  select.innerHTML = '<option value="">Selecione o profissional</option>';
  profissionais.forEach(profissional => {
    const option = document.createElement('option');
    option.value = profissional.nome;
    option.textContent = profissional.nome;
    select.appendChild(option);
  });
  
  // Popular lista
  listaProfissionais.innerHTML = '';
  profissionais.forEach(profissional => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${profissional.nome}</strong>
          <br>
          <small class="text-muted">${profissional.tipoUsuario}</small>
        </div>
        <i class="fas fa-chevron-right"></i>
      </div>
    `;
    li.onclick = () => selecionarProfissional(profissional);
    listaProfissionais.appendChild(li);
  });
}

// Filtrar profissionais
function filtrarProfissionais() {
  const filtro = document.getElementById('filtroProfissional').value.toLowerCase();
  const profissionais = usuarios.filter(u => u.tipoUsuario === "Médico" || u.tipoUsuario === "Enfermeiro");
  const listaProfissionais = document.getElementById('listaProfissionais');
  
  listaProfissionais.innerHTML = '';
  profissionais.filter(p => p.nome.toLowerCase().includes(filtro)).forEach(profissional => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <strong>${profissional.nome}</strong>
          <br>
          <small class="text-muted">${profissional.tipoUsuario}</small>
        </div>
        <i class="fas fa-chevron-right"></i>
      </div>
    `;
    li.onclick = () => selecionarProfissional(profissional);
    listaProfissionais.appendChild(li);
  });
}

// Selecionar profissional
function selecionarProfissional(profissional) {
  profissionalSelecionado = profissional;
  
  // Atualizar select
  document.getElementById('profissionalSelect').value = profissional.nome;
  
  // Atualizar lista
  document.querySelectorAll('#listaProfissionais .list-group-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  // Carregar qualificações
  carregarQualificacoesProfissional(profissional);
  
  // Carregar disponibilidade
  carregarDisponibilidade();
}

// Renderizar calendário
function renderizarCalendario() {
  const calendarGrid = document.getElementById('calendarGrid');
  const currentMonth = document.getElementById('currentMonth');
  
  // Atualizar título do mês
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  currentMonth.textContent = `${meses[mesAtual.getMonth()]} ${anoAtual.getFullYear()}`;
  
  // Limpar calendário
  calendarGrid.innerHTML = '';
  
  // Adicionar headers dos dias
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  diasSemana.forEach(dia => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = dia;
    calendarGrid.appendChild(header);
  });
  
  // Obter primeiro dia do mês
  const primeiroDia = new Date(anoAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(anoAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaInicio = primeiroDia.getDay();
  
  // Adicionar dias do mês anterior
  const mesAnterior = new Date(anoAtual.getFullYear(), mesAtual.getMonth() - 1, 0);
  for (let i = diaInicio - 1; i >= 0; i--) {
    const dia = document.createElement('div');
    dia.className = 'calendar-day other-month';
    dia.textContent = mesAnterior.getDate() - i;
    calendarGrid.appendChild(dia);
  }
  
  // Adicionar dias do mês atual
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day';
    diaElement.textContent = dia;
    
    // Verificar se é hoje
    const hoje = new Date();
    if (anoAtual.getFullYear() === hoje.getFullYear() && 
        mesAtual.getMonth() === hoje.getMonth() && 
        dia === hoje.getDate()) {
      diaElement.classList.add('today');
    }
    
    // Verificar se tem disponibilidade
    const dataAtual = new Date(anoAtual.getFullYear(), mesAtual.getMonth(), dia);
    const dataStr = dataAtual.toISOString().split('T')[0];
    const temDisponibilidade = disponibilidade.some(d => 
      d.medico === profissionalSelecionado?.nome && d.data === dataStr
    );
    
    if (temDisponibilidade) {
      diaElement.classList.add('has-disponibility');
    }
    
    // Adicionar evento de clique
    diaElement.onclick = () => selecionarData(dataStr);
    
    calendarGrid.appendChild(diaElement);
  }
  
  // Adicionar dias do próximo mês
  const proximoMes = new Date(anoAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
  const diasRestantes = 42 - (diaInicio + diasNoMes);
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day other-month';
    diaElement.textContent = dia;
    calendarGrid.appendChild(diaElement);
  }
}

// Navegar entre meses
function previousMonth() {
  mesAtual.setMonth(mesAtual.getMonth() - 1);
  if (mesAtual.getMonth() === 11) {
    anoAtual.setFullYear(anoAtual.getFullYear() - 1);
    mesAtual.setMonth(0);
  }
  renderizarCalendario();
}

function nextMonth() {
  mesAtual.setMonth(mesAtual.getMonth() + 1);
  if (mesAtual.getMonth() === 0) {
    anoAtual.setFullYear(anoAtual.getFullYear() + 1);
    mesAtual.setMonth(11);
  }
  renderizarCalendario();
}

// Selecionar data
function selecionarData(data) {
  dataSelecionada = data;
  document.getElementById('dataSelecionada').value = formatarDataBR(data);
  
  // Atualizar visualização dos dias
  document.querySelectorAll('.calendar-day').forEach(dia => {
    dia.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  // Carregar horários disponíveis
  carregarHorariosDisponiveis();
}

// Carregar horários disponíveis
function carregarHorariosDisponiveis() {
  const timeSlots = document.getElementById('timeSlots');
  timeSlots.innerHTML = '';
  
  if (!profissionalSelecionado || !dataSelecionada) return;
  
  // Horários padrão
  const horarios = [
    { inicio: "08:00", fim: "12:00", periodo: "Manhã" },
    { inicio: "14:00", fim: "18:00", periodo: "Tarde" }
  ];
  
  horarios.forEach(horario => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    
    // Verificar se já existe disponibilidade para este horário
    const existeDisponibilidade = disponibilidade.some(d => 
      d.medico === profissionalSelecionado.nome && 
      d.data === dataSelecionada &&
      d.periodo === horario.periodo
    );
    
    if (existeDisponibilidade) {
      slot.classList.add('selected');
    }
    
    slot.innerHTML = `
      <input type="checkbox" id="slot-${horario.periodo}" ${existeDisponibilidade ? 'checked' : ''}>
      <label for="slot-${horario.periodo}">${horario.periodo} (${horario.inicio} - ${horario.fim})</label>
    `;
    
    slot.onclick = () => toggleHorario(horario.periodo);
    timeSlots.appendChild(slot);
  });
}

// Alternar horário
function toggleHorario(periodo) {
  if (!profissionalSelecionado || !dataSelecionada) return;
  
  const index = disponibilidade.findIndex(d => 
    d.medico === profissionalSelecionado.nome && 
    d.data === dataSelecionada &&
    d.periodo === periodo
  );
  
  if (index >= 0) {
    // Remover disponibilidade
    disponibilidade.splice(index, 1);
  } else {
    // Adicionar disponibilidade
    disponibilidade.push({
      id: Date.now(),
      medico: profissionalSelecionado.nome,
      data: dataSelecionada,
      periodo: periodo,
      inicio: periodo === "Manhã" ? "08:00" : "14:00",
      fim: periodo === "Manhã" ? "12:00" : "18:00",
      disponivel: true,
      observacoes: "",
      dataCadastro: new Date().toISOString()
    });
  }
  
  localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
  carregarHorariosDisponiveis();
  renderizarCalendario();
}

// Salvar disponibilidade
function salvarDisponibilidade() {
  if (!profissionalSelecionado || !dataSelecionada) {
    alert("Selecione um profissional e uma data!");
    return;
  }
  
  localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
  
  // Mostrar sucesso
  const alerta = document.createElement('div');
  alerta.className = 'alert alert-success';
  alerta.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    Disponibilidade salva com sucesso!
  `;
  
  const form = document.querySelector('.card-body');
  form.insertBefore(alerta, form.firstChild);
  
  setTimeout(() => {
    alerta.remove();
  }, 3000);
}

// Limpar disponibilidade
function limparDisponibilidade() {
  if (!profissionalSelecionado || !dataSelecionada) {
    alert("Selecione um profissional e uma data!");
    return;
  }
  
  if (confirm("Deseja remover toda a disponibilidade deste dia?")) {
    // Remover disponibilidade para este dia
    disponibilidade = disponibilidade.filter(d => 
      !(d.medico === profissionalSelecionado.nome && d.data === dataSelecionada)
    );
    
    localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
    carregarHorariosDisponiveis();
    renderizarCalendario();
  }
}

// Carregar qualificações
function carregarQualificacoes() {
  // Inicializar qualificações se não existirem
  if (qualificacoes.length === 0) {
    usuarios.filter(u => u.tipoUsuario === "Médico" || u.tipoUsuario === "Enfermeiro").forEach(profissional => {
      qualificacoes.push({
        id: profissional.id,
        profissional: profissional.nome,
        formacao: "",
        experiencia: "",
        especialidades: [],
        certificacoes: [],
        observacoes: "",
        dataUltimaAtualizacao: new Date().toISOString()
      });
    });
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
  }
}

// Carregar qualificações do profissional
function carregarQualificacoesProfissional(profissional) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissional.nome);
  
  if (qualificacao) {
    document.getElementById('infoProfissional').style.display = 'none';
    document.getElementById('formQualificacoes').style.display = 'block';
    
    // Preencher formulário
    document.getElementById('formacao').value = qualificacao.formacao || "";
    document.getElementById('experiencia').value = qualificacao.experiencia || "";
    document.getElementById('observacoesQualificacoes').value = qualificacao.observacoes || "";
    
    // Preencher especialidades
    const listaEspecialidades = document.getElementById('listaEspecialidades');
    listaEspecialidades.innerHTML = '';
    qualificacao.especialidades.forEach(especialidade => {
      const tag = criarTagEspecialidade(especialidade);
      listaEspecialidades.appendChild(tag);
    });
    
    // Preencher certificações
    const listaCertificacoes = document.getElementById('listaCertificacoes');
    listaCertificacoes.innerHTML = '';
    qualificacao.certificacoes.forEach(certificacao => {
      const tag = criarTagCertificacao(certificacao);
      listaCertificacoes.appendChild(tag);
    });
  } else {
    document.getElementById('infoProfissional').style.display = 'block';
    document.getElementById('formQualificacoes').style.display = 'none';
  }
}

// Criar tag de especialidade
function criarTagEspecialidade(especialidade) {
  const tag = document.createElement('div');
  tag.className = 'especialidade-tag';
  tag.innerHTML = `
    ${especialidade}
    <button class="remove-btn" onclick="removerEspecialidade('${especialidade}')">
      <i class="fas fa-times"></i>
    </button>
  `;
  return tag;
}

// Criar tag de certificação
function criarTagCertificacao(certificacao) {
  const tag = document.createElement('div');
  tag.className = 'certificacao-tag';
  tag.innerHTML = `
    ${certificacao}
    <button class="remove-btn" onclick="removerCertificacao('${certificacao}')">
      <i class="fas fa-times"></i>
    </button>
  `;
  return tag;
}

// Adicionar especialidade
function adicionarEspecialidade() {
  const input = document.getElementById('novaEspecialidade');
  const especialidade = input.value.trim();
  
  if (especialidade) {
    const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
    if (qualificacao && !qualificacao.especialidades.includes(especialidade)) {
      qualificacao.especialidades.push(especialidade);
      localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
      
      const lista = document.getElementById('listaEspecialidades');
      const tag = criarTagEspecialidade(especialidade);
      lista.appendChild(tag);
      
      input.value = '';
    }
  }
}

// Remover especialidade
function removerEspecialidade(especialidade) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
  if (qualificacao) {
    qualificacao.especialidades = qualificacao.especialidades.filter(e => e !== especialidade);
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
    carregarQualificacoesProfissional(profissionalSelecionado);
  }
}

// Adicionar certificação
function adicionarCertificacao() {
  const input = document.getElementById('novaCertificacao');
  const certificacao = input.value.trim();
  
  if (certificacao) {
    const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
    if (qualificacao && !qualificacao.certificacoes.includes(certificacao)) {
      qualificacao.certificacoes.push(certificacao);
      localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
      
      const lista = document.getElementById('listaCertificacoes');
      const tag = criarTagCertificacao(certificacao);
      lista.appendChild(tag);
      
      input.value = '';
    }
  }
}

// Remover certificação
function removerCertificacao(certificacao) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
  if (qualificacao) {
    qualificacao.certificacoes = qualificacao.certificacoes.filter(c => c !== certificacao);
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
    carregarQualificacoesProfissional(profissionalSelecionado);
  }
}

// Salvar qualificações
function salvarQualificacoes() {
  if (!profissionalSelecionado) {
    alert("Selecione um profissional!");
    return;
  }
  
  const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
  if (qualificacao) {
    qualificacao.formacao = document.getElementById('formacao').value;
    qualificacao.experiencia = document.getElementById('experiencia').value;
    qualificacao.observacoes = document.getElementById('observacoesQualificacoes').value;
    qualificacao.dataUltimaAtualizacao = new Date().toISOString();
    
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
    
    // Mostrar sucesso
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-success';
    alerta.innerHTML = `
      <i class="fas fa-check-circle me-2"></i>
      Qualificações salvas com sucesso!
    `;
    
    const form = document.querySelector('.card-body');
    form.insertBefore(alerta, form.firstChild);
    
    setTimeout(() => {
      alerta.remove();
    }, 3000);
  }
}

// Cancelar edição
function cancelarEdicao() {
  document.getElementById('infoProfissional').style.display = 'block';
  document.getElementById('formQualificacoes').style.display = 'none';
}

// Formatar data brasileira
function formatarDataBR(dataISO) {
  return dataISO.split('-').reverse().join('/');
}

// Exportar funções globais
window.disponibilidade = {
  carregarProfissionais,
  filtrarProfissionais,
  selecionarProfissional,
  renderizarCalendario,
  previousMonth,
  nextMonth,
  selecionarData,
  carregarHorariosDisponiveis,
  toggleHorario,
  salvarDisponibilidade,
  limparDisponibilidade,
  carregarQualificacoes,
  carregarQualificacoesProfissional,
  adicionarEspecialidade,
  removerEspecialidade,
  adicionarCertificacao,
  removerCertificacao,
  salvarQualificacoes,
  cancelarEdicao
};