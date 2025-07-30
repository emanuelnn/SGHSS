const form = document.getElementById("formProfissional");
  const lista = document.getElementById("listaProfissionais");
  const profissionais = JSON.parse(localStorage.getItem("profissionais")) || [];

    function renderProfissionais() {
      lista.innerHTML = "";
      profissionais.forEach((p, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between";
        li.innerHTML = `<span><strong>${p.tipo}</strong> - ${p.nome}</span>
          <button class="btn btn-sm btn-danger" onclick="remover(${i})">Remover</button>`;
        lista.appendChild(li);
      });
    }

    function remover(index) {
      profissionais.splice(index, 1);
      localStorage.setItem("profissionais", JSON.stringify(profissionais));
      renderProfissionais();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const tipo = document.getElementById("tipo").value;
      const nome = document.getElementById("nome").value;
      profissionais.push({ tipo, nome });
      localStorage.setItem("profissionais", JSON.stringify(profissionais));
      form.reset();
      renderProfissionais();
    });

    renderProfissionais();