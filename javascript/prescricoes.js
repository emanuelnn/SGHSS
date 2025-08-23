let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");
const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];

const pacienteSelect = document.getElementById("paciente");
const lista = document.getElementById("listaPrescricoes");

const filtroPaciente = document.getElementById("filtroPaciente");
const filtroMedico = document.getElementById("filtroMedico");

const perfil = localStorage.getItem("perfil") || "comum";

document.getElementById('usuarios-tab')?.addEventListener('shown.bs.tab', renderPrescricoes);


const selectsMedicos = [
  document.getElementById("filtroMedico"),
  document.getElementById("textoMedico")
].filter(Boolean);

const medicos = usuarios.filter(u => u.tipoUsuario === "Médico");

selectsMedicos.forEach(select => {
  select.innerHTML = '<option value="">Selecione o médico</option>';
  medicos.forEach(m => {
    const option = document.createElement("option");
    option.value = m.nome;
    option.textContent = m.nome;
    select.appendChild(option);
  });
});

pacientes.forEach(p => {
  const opt = document.createElement("option");
  opt.value = p.nome;
  opt.textContent = p.nome;
  pacienteSelect.appendChild(opt);
});

function renderPrescricoes() {
  lista.innerHTML = "";
  const filtro = filtroPaciente?.value.toLowerCase() || "";
  const filtroMed = filtroMedico?.value.toLowerCase() || "";

  prescricoes
    .filter(p => {
      const batePaciente = filtro ? p.paciente.toLowerCase().includes(filtro) : true;
      const bateMedico  = filtroMed ? p.medico.toLowerCase().includes(filtroMed) : true;
      return batePaciente && bateMedico;
    })
    .forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <div>
          <strong>${p.paciente}</strong>
          <p>Médico: ${p.medico} | Diagnóstico: ${p.diagnostico}</p>
          <p>Observações: ${p.observacoes}</p>
        </div>
        <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>
      `;
      lista.appendChild(li);
    });
}

function remover(i) {
  prescricoes.splice(i, 1);
  localStorage.setItem("prescricoes", JSON.stringify(prescricoes));
  renderPrescricoes();
}

document.getElementById("formPrescricao").addEventListener("submit", e => {
  e.preventDefault();
  const nova = {
    paciente: pacienteSelect.value,
    dataCadastro: Date.now(),
    diagnostico: document.getElementById("textoDiagnostico").value.trim(),
    medicamentos: document.getElementById("textoMedicamentos").value.trim(),
    medico: document.getElementById("textoMedico").value.trim(),
    observacoes: document.getElementById("textoObservacoes").value.trim()
  };
  prescricoes.push(nova);
  localStorage.setItem("prescricoes", JSON.stringify(prescricoes));
  e.target.reset();
  renderPrescricoes();
});

filtroPaciente?.addEventListener("input", renderPrescricoes);
filtroMedico?.addEventListener("input", renderPrescricoes);

renderPrescricoes();
