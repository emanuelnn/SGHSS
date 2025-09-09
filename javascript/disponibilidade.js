let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let disponibilidade = JSON.parse(localStorage.getItem("disponibilidade")) || [];
let qualificacoes = JSON.parse(localStorage.getItem("qualificacoes")) || [];
let profissionalSelecionado = null;
let dataSelecionada = null;
let mesAtual = new Date();
let anoAtual = new Date();
const acessoRestrito = document.getElementById("acessoRestrito");
const disponibilidade_tab = document.getElementById("disponibilidade_tab");
const perfil = (localStorage.getItem("perfil") || "comum");

function verificarPermissoes() {
  const ehAdministrador = perfil === "Administrador";
  const ehMedico = perfil === "Médico";
  const ehEnfermeiro = perfil === "Tec. Enfermagem";

  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {
      if (disponibilidade_tab) {
        disponibilidade_tab.style.display = "none";
      }
      if (acessoRestrito) {
        acessoRestrito.style.display = "block";
      }
  }
  return true;
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  verificarPermissoes();
  carregarProfissionais();
  renderizarCalendario();
  carregarQualificacoes();
});

function carregarProfissionais() {
  const select = document.getElementById('profissionalSelect');
  const listaProfissionais = document.getElementById('listaProfissionais');
  
  const profissionais = usuarios.filter(u => u.tipoUsuario === "Médico" || u.tipoUsuario === "Enfermeiro");
  
  select.innerHTML = '<option value="">Selecione o profissional</option>';
  profissionais.forEach(profissional => {
    const option = document.createElement('option');
    option.value = profissional.nome;
    option.textContent = profissional.nome;
    select.appendChild(option);
  });
  
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

function selecionarProfissional(profissional) {
  profissionalSelecionado = profissional;
  
  document.getElementById('profissionalSelect').value = profissional.nome;
  
  document.querySelectorAll('#listaProfissionais .list-group-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  carregarQualificacoesProfissional(profissional);
  
  carregarDisponibilidade();
}

function carregarDisponibilidade() {
  const profissionalSelect = document.getElementById('profissionalSelect');
  const profissional = profissionalSelect.value;
  
  if (!profissional) {
    document.getElementById('dataSelecionada').value = '';
    document.getElementById('timeSlots').innerHTML = '';
    return;
  }
  
  profissionalSelecionado = usuarios.find(u => u.nome === profissional);
  
  if (dataSelecionada) {
    carregarHorariosDisponiveis();
  }
}

function renderizarCalendario() {
  const calendarGrid = document.getElementById('calendarGrid');
  const currentMonth = document.getElementById('currentMonth');
  
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  currentMonth.textContent = `${meses[mesAtual.getMonth()]} ${anoAtual.getFullYear()}`;
  
  calendarGrid.innerHTML = '';
  
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  diasSemana.forEach(dia => {
    const header = document.createElement('div');
    header.className = 'calendar-day-header';
    header.textContent = dia;
    calendarGrid.appendChild(header);
  });
  
  const primeiroDia = new Date(anoAtual.getFullYear(), mesAtual.getMonth(), 1);
  const ultimoDia = new Date(anoAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaInicio = primeiroDia.getDay();

  const mesAnterior = new Date(anoAtual.getFullYear(), mesAtual.getMonth() - 1, 0);
  for (let i = diaInicio - 1; i >= 0; i--) {
    const dia = document.createElement('div');
    dia.className = 'calendar-day other-month';
    dia.textContent = mesAnterior.getDate() - i;
    calendarGrid.appendChild(dia);
  }
  
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day';
    diaElement.textContent = dia;
    
    const hoje = new Date();
    if (anoAtual.getFullYear() === hoje.getFullYear() && 
        mesAtual.getMonth() === hoje.getMonth() && 
        dia === hoje.getDate()) {
      diaElement.classList.add('today');
    }
    
    const dataAtual = new Date(anoAtual.getFullYear(), mesAtual.getMonth(), dia);
    const dataStr = dataAtual.toISOString().split('T')[0];
    const temDisponibilidade = disponibilidade.some(d => 
      d.medico === profissionalSelecionado?.nome && d.data === dataStr
    );
    
    if (temDisponibilidade) {
      diaElement.classList.add('has-disponibility');
    }
    
    diaElement.onclick = () => selecionarData(dataStr);
    
    calendarGrid.appendChild(diaElement);
  }
  
  const proximoMes = new Date(anoAtual.getFullYear(), mesAtual.getMonth() + 1, 1);
  const diasRestantes = 42 - (diaInicio + diasNoMes);
  for (let dia = 1; dia <= diasRestantes; dia++) {
    const diaElement = document.createElement('div');
    diaElement.className = 'calendar-day other-month';
    diaElement.textContent = dia;
    calendarGrid.appendChild(diaElement);
  }
}

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

function selecionarData(data) {
  dataSelecionada = data;
  document.getElementById('dataSelecionada').value = formatarDataBR(data);
  
  document.querySelectorAll('.calendar-day').forEach(dia => {
    dia.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
  
  carregarHorariosDisponiveis();
}

function carregarHorariosDisponiveis() {
  const timeSlots = document.getElementById('timeSlots');
  timeSlots.innerHTML = '';
  
  if (!profissionalSelecionado || !dataSelecionada) return;
  
  const horarios = [
    { inicio: "08:00", fim: "12:00", periodo: "Manhã" },
    { inicio: "14:00", fim: "18:00", periodo: "Tarde" }
  ];
  
  horarios.forEach(horario => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    
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

function toggleHorario(periodo) {
  if (!profissionalSelecionado || !dataSelecionada) return;
  
  const index = disponibilidade.findIndex(d => 
    d.medico === profissionalSelecionado.nome && 
    d.data === dataSelecionada &&
    d.periodo === periodo
  );
  
  if (index >= 0) {
    disponibilidade.splice(index, 1);
  } else {
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

function salvarDisponibilidade() {
  if (!profissionalSelecionado || !dataSelecionada) {
    alert("Selecione um profissional e uma data!");
    return;
  }
  
  localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
  
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

function limparDisponibilidade() {
  if (!profissionalSelecionado || !dataSelecionada) {
    alert("Selecione um profissional e uma data!");
    return;
  }
  
  if (confirm("Deseja remover toda a disponibilidade deste dia?")) {
    disponibilidade = disponibilidade.filter(d => 
      !(d.medico === profissionalSelecionado.nome && d.data === dataSelecionada)
    );
    
    localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
    carregarHorariosDisponiveis();
    renderizarCalendario();
  }
}

function carregarQualificacoes() {
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

function carregarQualificacoesProfissional(profissional) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissional.nome);
  
  if (qualificacao) {
    document.getElementById('infoProfissional').style.display = 'none';
    document.getElementById('formQualificacoes').style.display = 'block';
    
    document.getElementById('formacao').value = qualificacao.formacao || "";
    document.getElementById('experiencia').value = qualificacao.experiencia || "";
    document.getElementById('observacoesQualificacoes').value = qualificacao.observacoes || "";
    
    const listaEspecialidades = document.getElementById('listaEspecialidades');
    listaEspecialidades.innerHTML = '';
    qualificacao.especialidades.forEach(especialidade => {
      const tag = criarTagEspecialidade(especialidade);
      listaEspecialidades.appendChild(tag);
    });
    
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

function removerEspecialidade(especialidade) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
  if (qualificacao) {
    qualificacao.especialidades = qualificacao.especialidades.filter(e => e !== especialidade);
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
    carregarQualificacoesProfissional(profissionalSelecionado);
  }
}

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

function removerCertificacao(certificacao) {
  const qualificacao = qualificacoes.find(q => q.profissional === profissionalSelecionado.nome);
  if (qualificacao) {
    qualificacao.certificacoes = qualificacao.certificacoes.filter(c => c !== certificacao);
    localStorage.setItem("qualificacoes", JSON.stringify(qualificacoes));
    carregarQualificacoesProfissional(profissionalSelecionado);
  }
}

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

function cancelarEdicao() {
  document.getElementById('infoProfissional').style.display = 'block';
  document.getElementById('formQualificacoes').style.display = 'none';
}

function formatarDataBR(dataISO) {
  return dataISO.split('-').reverse().join('/');
}
