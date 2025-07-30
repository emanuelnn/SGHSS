// Especialidades médicas disponíveis
const especialidades = [
  "Clínico Geral",
  "Pediatria",
  "Dermatologia",
  "Cardiologia",
  "Oftalmologia",
  "Ginecologia e Obstetrícia",
  "Ortopedia e Traumatologia",
  "Neurologia",
  "Psiquiatria",
  "Endocrinologia e Metabologia",
  "Gastroenterologia",
  "Urologia",
  "Otorrinolaringologia",
  "Reumatologia",
  "Pneumologia",
  "Nefrologia",
  "Infectologia",
  "Oncologia"
];

const formAgendamento = document.getElementById("formAgendamento");
  const selectPaciente = document.getElementById("nomePaciente");
  const dataConsultaInput = document.getElementById("dataConsulta");
  const selectEspecialidade = document.getElementById("especialidade");

  if (formAgendamento && selectPaciente && dataConsultaInput && selectEspecialidade) {
    especialidades.forEach((especialidade) => {
      const option = document.createElement("option");
      option.value = especialidade;
      option.textContent = especialidade;
      selectEspecialidade.appendChild(option);
    });

    const today = new Date().toISOString().split("T")[0];
    dataConsultaInput.setAttribute("min", today);

    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];
    pacientesSalvos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      selectPaciente.appendChild(option);
    });

    formAgendamento.addEventListener("submit", function (e) {
      e.preventDefault();

      const novaConsulta = {
        paciente: document.getElementById("nomePaciente").value,
        especialidade: document.getElementById("especialidade").value,
        data: document.getElementById("dataConsulta").value,
        hora: document.getElementById("horaConsulta").value,
      };

      const consultas = JSON.parse(localStorage.getItem("consultas")) || [];
      consultas.push(novaConsulta);
      localStorage.setItem("consultas", JSON.stringify(consultas));

      const msg = document.getElementById("mensagemAgendamento");
      msg.textContent = "Consulta agendada com sucesso!";
      msg.classList.add("success");

      this.reset();

      setTimeout(() => {
        msg.textContent = "";
      }, 4000);
    });
  }
