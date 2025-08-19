const usuarios   = JSON.parse(localStorage.getItem("usuarios"))   || [];
let consultas    = JSON.parse(localStorage.getItem("consultas"))  || [];
let agendas      = JSON.parse(localStorage.getItem("agendas"))    || [];

const perfil     = localStorage.getItem("perfil") || "comum";

const medicoSelect   = document.getElementById("medico");
const pacienteSelect = document.getElementById("paciente");
const consultaSelect = document.getElementById("consultaPaciente");
const dataInput      = document.getElementById("dataAgenda");
const horaInput      = document.getElementById("horaAgenda");
const lista          = document.getElementById("listaAgendas");
const filtroMedicoInput = document.getElementById("filtroMedico");

// Função utilitária para popular <select>
const popularSelect = (select, lista, filtroFn) => {
  lista.filter(filtroFn).forEach(u => {
    select.add(new Option(u.nome, u.nome));
  });
};

// Carrega médicos e pacientes
popularSelect(medicoSelect, usuarios, u => u.tipoUsuario === "Médico");
popularSelect(pacienteSelect, usuarios, u => u.tipoUsuario === "Paciente");

// Seleção de paciente -> carrega consultas
pacienteSelect.addEventListener("change", () => {
  consultaSelect.innerHTML = '<option value="">Selecione a consulta</option>';
  const consultasDoPaciente = consultas.filter(c => c.paciente === pacienteSelect.value);

  if (!consultasDoPaciente.length) return alert("Este paciente não possui consultas cadastradas.");

  consultasDoPaciente.forEach((c, i) =>
    consultaSelect.add(new Option(`${c.data} às ${c.hora} - ${c.especialidade}`, i))
  );
});

// Seleção de consulta -> preenche data/hora
consultaSelect.addEventListener("change", () => {
  const consulta = consultas.filter(c => c.paciente === pacienteSelect.value)[consultaSelect.value];
  if (consulta) {
    const [d, m, a] = consulta.data.split("/");
    dataInput.value = `${a}-${m}-${d}`;
    horaInput.value = consulta.hora;
  } else {
    dataInput.value = horaInput.value = "";
  }
});

// Renderização das agendas
function renderAgendas() {
  const filtro = (filtroMedicoInput?.value || "").toLowerCase();
  const agendasFiltradas = filtro ? agendas.filter(a => a.medico.toLowerCase().includes(filtro)) : agendas;

  lista.innerHTML = agendasFiltradas.length
    ? agendasFiltradas.map((a, i) => `
        <li class="list-group-item d-flex justify-content-between">
          <span><strong>${a.paciente}</strong> com <strong>${a.medico}</strong><br>${a.data} às ${a.hora}</span>
          <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>
        </li>
      `).join("")
    : '<li class="list-group-item">Nenhuma consulta agendada.</li>';
}

filtroMedicoInput?.addEventListener("input", renderAgendas);

function remover(i) {
  agendas.splice(i, 1);
  localStorage.setItem("agendas", JSON.stringify(agendas));
  renderAgendas();
}

// Submissão do formulário
document.getElementById("formAgenda").addEventListener("submit", e => {
  e.preventDefault();
  if (!dataInput.value || !horaInput.value) return alert("Você precisa selecionar uma consulta válida.");

  agendas.push({
    medico: medicoSelect.value,
    paciente: pacienteSelect.value,
    data: dataInput.value,
    hora: horaInput.value,
  });

  localStorage.setItem("agendas", JSON.stringify(agendas));
  e.target.reset();
  consultaSelect.innerHTML = '<option value="">Selecione a consulta</option>';
  renderAgendas();
});

renderAgendas();
