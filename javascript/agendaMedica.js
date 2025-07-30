const agendas = JSON.parse(localStorage.getItem("agendas")) || [];
    const select = document.getElementById("profissional");
    const listaAgendas = document.getElementById("listaAgendas");

    profissionais.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nome;
      opt.textContent = `${p.tipo} - ${p.nome}`;
      select.appendChild(opt);
    });

    function renderAgendas() {
      listaAgendas.innerHTML = "";
      agendas.forEach((a, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerHTML = `<span><strong>${a.profissional}</strong>: ${a.data} às ${a.hora}</span>
          <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>`;
        listaAgendas.appendChild(li);
      });
    }

    function remover(i) {
      agendas.splice(i, 1);
      localStorage.setItem("agendas", JSON.stringify(agendas));
      renderAgendas();
    }

    document.getElementById("formAgenda").addEventListener("submit", e => {
      e.preventDefault();
      const agenda = {
        profissional: select.value,
        data: document.getElementById("dataAgenda").value,
        hora: document.getElementById("horaAgenda").value,
      };
      agendas.push(agenda);
      localStorage.setItem("agendas", JSON.stringify(agendas));
      e.target.reset();
      renderAgendas();
    });

    renderAgendas();