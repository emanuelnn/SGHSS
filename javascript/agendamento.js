// Especialidades médicas
const especialidades = [
  "Clínico Geral", "Pediatria", "Dermatologia", "Cardiologia", "Oftalmologia",
  "Ginecologia e Obstetrícia", "Ortopedia e Traumatologia", "Neurologia", "Psiquiatria",
  "Endocrinologia e Metabologia", "Gastroenterologia", "Urologia", "Otorrinolaringologia",
  "Reumatologia", "Pneumologia", "Nefrologia", "Infectologia", "Oncologia"
];

const perfil = localStorage.getItem("perfil") || "comum";

const formAgendamento     = document.getElementById("formAgendamento");
const selectPaciente      = document.getElementById("nomePaciente");
const dataConsultaInput   = document.getElementById("dataConsulta");
const selectEspecialidade = document.getElementById("especialidade");
const msg                 = document.getElementById("mensagemAgendamento");

if (formAgendamento && selectPaciente && dataConsultaInput && selectEspecialidade) {
  // Popula especialidades
  especialidades.forEach(e => selectEspecialidade.add(new Option(e, e)));

  // Data mínima = hoje
  dataConsultaInput.min = new Date().toISOString().split("T")[0];

  // Popula pacientes
  (JSON.parse(localStorage.getItem("usuarios")) || [])
    .filter(p => p.tipoUsuario === "Paciente")
    .forEach(p => selectPaciente.add(new Option(p.nome, p.nome)));

  formAgendamento.addEventListener("submit", e => {
    e.preventDefault();

    const novaConsulta = {
      paciente: selectPaciente.value,
      especialidade: selectEspecialidade.value,
      data: dataConsultaInput.value,
      hora: document.getElementById("horaConsulta").value,
    };

    const consultas = JSON.parse(localStorage.getItem("consultas")) || [];
    consultas.push(novaConsulta);
    localStorage.setItem("consultas", JSON.stringify(consultas));

    msg.textContent = "Consulta agendada com sucesso!";
    msg.className = "success";

    formAgendamento.reset();
    setTimeout(() => msg.textContent = "", 4000);
  });
}
