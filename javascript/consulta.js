function formatarDataBR(dataISO) {
  return dataISO.split("-").reverse().join("/");
}

const perfil = localStorage.getItem("perfil") || "comum";
const pacienteList = document.getElementById("pacienteList");
const consultaListElement = document.getElementById("consultaList");
const filtroPacienteInput = document.getElementById("filtroPaciente");

let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
const pacientes = usuarios.filter(u => u.tipoUsuario === "Paciente");

function salvar(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function renderPacientes() {
  const filtro = (filtroPacienteInput?.value || "").trim().toLowerCase();
  const pacientesFiltrados = pacientes.filter(p => p.nome.toLowerCase().includes(filtro));

  pacienteList.innerHTML = pacientesFiltrados.length
    ? ""
    : `<li class="list-group-item">Nenhum paciente cadastrado.</li>`;

  pacientesFiltrados.forEach((p, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${p.nome}</strong><br>
        CPF: ${p.cpf} | Nasc.: ${formatarDataBR(p.nascimento)}<br>
        Email: ${p.email} | Tel: ${p.telefone}
      </div>
    `;

    if (perfil === "Administrador") {
      const btn = Object.assign(document.createElement("button"), {
        textContent: "Excluir",
        className: "btn btn-sm btn-danger",
        onclick: () => {
          if (!confirm(`Deseja excluir o paciente ${p.nome}?`)) return;
          pacientes.splice(index, 1);
          usuarios = usuarios.filter(u => !(u.tipoUsuario === "Paciente" && u.nome === p.nome));
          consultas = consultas.filter(c => c.paciente !== p.nome);
          salvar("usuarios", usuarios);
          salvar("consultas", consultas);
          renderPacientes();
          renderConsultas();
        }
      });
      li.appendChild(btn);
    }

    pacienteList.appendChild(li);
  });
}

function renderConsultas() {
  consultaListElement.innerHTML = consultas.length
    ? ""
    : `<li class="list-group-item">Nenhuma consulta agendada.</li>`;

  const hoje = new Date();
  const hojeSemTempo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  consultas.forEach((c, index) => {
    const [dia, mes, ano] = c.data.split("/");
    const dataConsulta = new Date(ano, mes - 1, dia);

    const diffDias = Math.ceil((dataConsulta - hojeSemTempo) / (1000 * 60 * 60 * 24));
    const status = dataConsulta > hojeSemTempo
      ? `Faltam: ${diffDias} Dia(s)`
      : dataConsulta.getTime() === hojeSemTempo.getTime()
        ? "É hoje!"
        : "Já passou";

    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${c.paciente}</strong> - ${c.especialidade}<br>
        ${c.data} às ${c.hora}<br>
        <small class="text-muted">${status}</small>
      </div>
    `;

    if (perfil === "Administrador" && status !== "Já passou") {
      const btn = Object.assign(document.createElement("button"), {
        textContent: "Cancelar",
        className: "btn btn-sm btn-danger",
        onclick: () => {
          if (!confirm(`Deseja cancelar a consulta de ${c.paciente}?`)) return;
          consultas.splice(index, 1);
          salvar("consultas", consultas);
          renderConsultas();
        }
      });
      li.appendChild(btn);
    }

    consultaListElement.appendChild(li);
  });
}

filtroPacienteInput?.addEventListener("input", renderPacientes);

// Render inicial
renderPacientes();
renderConsultas();
