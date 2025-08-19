function validarCPF(cpf) {
  return /^\d{11}$/.test(cpf);
}

const formCadastro = document.getElementById("formCadastro");
const listaCadastros = document.getElementById("listaCadastros");

const perfil = localStorage.getItem("perfil") || "comum";

function renderCadastros() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  listaCadastros.innerHTML = "";
  usuarios.forEach((u, i) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <div>
        <strong>${u.nome}</strong> (${u.tipoUsuario})<br>
        CPF: ${u.cpf} | Nasc.: ${u.nascimento}<br>
        Email: ${u.email}
      </div>
      <button class="btn btn-sm btn-danger" onclick="removerUsuario(${i})">Remover</button>
    `;
    listaCadastros.appendChild(li);
  });
}

window.removerUsuario = function(index) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios.splice(index, 1);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  renderCadastros();
};

if (formCadastro) {
  formCadastro.addEventListener("submit", function (e) {
    e.preventDefault();

    const novoUsuario = {
      nome: document.getElementById("nome").value.trim(),
      cpf: document.getElementById("cpf").value.trim(),
      nascimento: document.getElementById("nascimento").value,
      email: document.getElementById("email").value.trim(),
      senha: document.getElementById("senha").value.trim(),
      tipoUsuario: document.getElementById("tipoUsuario").value
    };

    if (!validarCPF(novoUsuario.cpf)) {
      alert("CPF inválido. Digite exatamente 11 números.");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    const msg = document.getElementById("mensagemCadastro");
    if (msg) {
      msg.textContent = "Cadastro realizado com sucesso!";
      msg.classList.add("success");
      setTimeout(() => {
        msg.textContent = "";
      }, 4000);
    }

    this.reset();
    renderCadastros();
  });
}

renderCadastros();