    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    const prescricoes = JSON.parse(localStorage.getItem("prescricoes")) || [];

    const pacienteSelect = document.getElementById("paciente");
    const lista = document.getElementById("listaPrescricoes");

    pacientes.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.nome;
      opt.textContent = p.nome;
      pacienteSelect.appendChild(opt);
    });

    function renderPrescricoes() {
      lista.innerHTML = "";
      prescricoes.forEach((p, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerHTML = `<div><strong>${p.paciente}</strong><br>${p.texto}</div>
          <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>`;
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
        texto: document.getElementById("textoPrescricao").value.trim(),
      };
      prescricoes.push(nova);
      localStorage.setItem("prescricoes", JSON.stringify(prescricoes));
      e.target.reset();
      renderPrescricoes();
    });

    renderPrescricoes();