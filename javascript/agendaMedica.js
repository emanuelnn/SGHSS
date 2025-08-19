  const profissionais = JSON.parse(localStorage.getItem("profissionais")) || [];
  const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
  const consultas = JSON.parse(localStorage.getItem("consultas")) || [];
  const agendas = JSON.parse(localStorage.getItem("agendas")) || [];

  const medicoSelect = document.getElementById("medico");
  const pacienteSelect = document.getElementById("paciente");
  const consultaSelect = document.getElementById("consultaPaciente");
  const dataInput = document.getElementById("dataAgenda");
  const horaInput = document.getElementById("horaAgenda");
  const lista = document.getElementById("listaAgendas");

  // Carrega médicos
  profissionais
    .filter(p => p.tipo === "Médico")
    .forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nome;
      opt.textContent = p.nome;
      medicoSelect.appendChild(opt);
    });

  // Carrega pacientes
  pacientes.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.nome;
    opt.textContent = p.nome;
    pacienteSelect.appendChild(opt);
  });

  // Ao selecionar paciente, carrega todas as consultas dele
  pacienteSelect.addEventListener("change", () => {
    consultaSelect.innerHTML = '<option value="">Selecione a consulta</option>';
    const nomePaciente = pacienteSelect.value;

    const consultasDoPaciente = consultas.filter(c => c.paciente === nomePaciente);

    if (consultasDoPaciente.length === 0) {
      alert("Este paciente não possui consultas cadastradas.");
      return;
    }

    consultasDoPaciente.forEach((c, index) => {
      const opt = document.createElement("option");
      opt.value = index; // salvamos o índice para depois recuperar os dados
      opt.textContent = `${c.data} às ${c.hora} - ${c.especialidade}`;
      consultaSelect.appendChild(opt);
    });
  });

  // Ao selecionar a consulta, preenche data e hora escondidos
  consultaSelect.addEventListener("change", () => {
    const nomePaciente = pacienteSelect.value;
    const consultasDoPaciente = consultas.filter(c => c.paciente === nomePaciente);
    const index = consultaSelect.value;

    if (index !== "") {
      const consultaSelecionada = consultasDoPaciente[index];
      const [dia, mes, ano] = consultaSelecionada.data.split("/");
      dataInput.value = `${ano}-${mes}-${dia}`; // formato AAAA-MM-DD
      horaInput.value = consultaSelecionada.hora;
    } else {
      dataInput.value = "";
      horaInput.value = "";
    }
  });

  const filtroMedicoInput = document.getElementById("filtroMedico");

  function renderAgendas() {
    let agendasFiltradas = agendas;

    if (filtroMedicoInput && filtroMedicoInput.value.trim() !== "") {
      const filtro = filtroMedicoInput.value.trim().toLowerCase();
      agendasFiltradas = agendas.filter(a =>
        a.medico.toLowerCase().includes(filtro)
      );
    }

    lista.innerHTML = "";

    if (agendasFiltradas.length === 0) {
      lista.innerHTML = '<li class="list-group-item">Nenhuma consulta agendada.</li>';
      return;
    }

    agendasFiltradas.forEach((a, i) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between";
      li.innerHTML = `<span><strong>${a.paciente}</strong> com <strong>${a.medico}</strong><br>${a.data} às ${a.hora}</span>
        <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>`;
      lista.appendChild(li);
    });
  }

  // Atualiza a lista ao digitar no filtro
  if (filtroMedicoInput) {
    filtroMedicoInput.addEventListener("input", renderAgendas);
  }

  function remover(i) {
    agendas.splice(i, 1);
    localStorage.setItem("agendas", JSON.stringify(agendas));
    renderAgendas();
  }

  document.getElementById("formAgenda").addEventListener("submit", e => {
    e.preventDefault();

    if (!dataInput.value || !horaInput.value) {
      alert("Você precisa selecionar uma consulta válida.");
      return;
    }

    const novaAgenda = {
      medico: medicoSelect.value,
      paciente: pacienteSelect.value,
      data: dataInput.value,
      hora: horaInput.value,
    };

    agendas.push(novaAgenda);
    localStorage.setItem("agendas", JSON.stringify(agendas));
    e.target.reset();
    consultaSelect.innerHTML = '<option value="">Selecione a consulta</option>';
    renderAgendas();
  });

  renderAgendas();
