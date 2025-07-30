  function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
  
  const pacienteList = document.getElementById("pacienteList");
  const consultaListElement = document.getElementById("consultaList");

  if (pacienteList && consultaListElement) {
    if (!localStorage.getItem("pacientes") || !localStorage.getItem("consultas") || JSON.parse(localStorage.getItem("pacientes")).length === 0) {
      popularDadosFicticios();
    }

    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
    const perfil = localStorage.getItem("perfil") || "comum";

    function renderPacientes() {
      if (pacientes.length === 0) {
        pacienteList.innerHTML =
          '<li class="list-group-item">Nenhum paciente cadastrado.</li>';
        return;
      }

      pacienteList.innerHTML = "";
      pacientes.forEach((p, index) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
                    <div>
                        <strong>${p.nome}</strong><br>
                        CPF: ${p.cpf} | Nasc.: ${formatarDataBR(p.nascimento)}<br>
                        Email: ${p.email} | Tel: ${p.telefone}
                    </div>
                `;

        if (perfil === "admin") {
          const btn = document.createElement("button");
          btn.textContent = "Excluir";
          btn.className = "btn btn-sm btn-danger";
          btn.onclick = () => {
            if (confirm(`Deseja excluir o paciente ${p.nome}?`)) {
              pacientes.splice(index, 1);
              localStorage.setItem("pacientes", JSON.stringify(pacientes));
              consultas = consultas.filter(
                (consulta) => consulta.paciente !== p.nome
              );
              localStorage.setItem("consultas", JSON.stringify(consultas));

              renderPacientes();
              renderConsultas();
            }
          };
          li.appendChild(btn);
        }
        pacienteList.appendChild(li);
      });
    }

    function renderConsultas() {
      if (consultas.length === 0) {
        consultaListElement.innerHTML =
          '<li class="list-group-item">Nenhuma consulta agendada.</li>';
        return;
      }

      consultaListElement.innerHTML = "";
      const hoje = new Date();

      consultas.forEach((c, index) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";

        const [dia, mes, ano] = c.data.split("/");
        const dataConsulta = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

        const hojeSemTempo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        let statusConsulta;
        if (dataConsulta > hojeSemTempo) {
          const diffEmMs = dataConsulta - hojeSemTempo;
          const diasRestantes = Math.ceil(diffEmMs / (1000 * 60 * 60 * 24));
          statusConsulta = `Faltam: ${diasRestantes} Dia(s)`;
        } else if (dataConsulta.getTime() === hojeSemTempo.getTime()) {
          statusConsulta = `É hoje!`;
        } else {
          statusConsulta = `Já passou`;
        }


        li.innerHTML = `
                    <div>
                        <strong>${c.paciente}</strong> - ${c.especialidade}<br>
                        ${c.data} às ${c.hora} <br>
                        <small class="text-muted">${statusConsulta}</small>
                    </div>
                `;

        if (perfil === "admin") {
          const btn = document.createElement("button");
          btn.textContent = "Cancelar";
          btn.className = "btn btn-sm btn-danger";
          btn.onclick = () => {
            if (confirm(`Deseja cancelar a consulta de ${c.paciente}?`)) {
              consultas.splice(index, 1);
              localStorage.setItem("consultas", JSON.stringify(consultas));
              renderConsultas();
            }
          };
          li.appendChild(btn);
        }
        consultaListElement.appendChild(li);
      });
    }

    renderPacientes();
    renderConsultas();
  }