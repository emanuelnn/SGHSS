function validarCPF(cpf) {
  return /^\d{11}$/.test(cpf);
}

const perfil = localStorage.getItem("perfil") || "comum";
const formCadastro = document.getElementById("formCadastro");
const acessoRestrito = document.getElementById("acessoRestrito");
const btnSalvar = document.getElementById("btnSalvar");

// Verificar permissões de acesso
function verificarPermissoes() {
  const ehAdministrador = perfil === "Administrador";
 
  // Restringir acesso ao formulário de cadastro
  if (!ehAdministrador) {
    if (formCadastro) {
      formCadastro.style.display = "none";
    }
    if (acessoRestrito) {
      acessoRestrito.style.display = "block";
    }
    if (btnSalvar) {
      btnSalvar.style.display = "none";
    }
  }
  
  // Permitir visualização da lista para todos
  return true;
}

function renderUsuarios() {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const filtroNome = (document.getElementById("filtroUsuario").value || "").trim().toLowerCase();
  const filtroCredencial = document.getElementById("filtroCredencial").value;

  let filtrados = usuarios.filter(u => u.nome.toLowerCase().includes(filtroNome));
  if (filtroCredencial) {
    filtrados = filtrados.filter(u => u.tipoUsuario === filtroCredencial);
  }

  const lista = document.getElementById("listaUsuarios");
  if (!lista) return;
  
  lista.innerHTML = "";

  if (filtrados.length === 0) {
    lista.innerHTML = '<div class="text-center text-muted py-4"><i class="fas fa-users fa-2x mb-2"></i><p>Nenhum usuário encontrado.</p></div>';
    return;
  }

  filtrados.forEach((u, i) => {
    const ehAdministrador = perfil === "Administrador";
    const li = document.createElement("li");
    
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    
    const botoesAcao = ehAdministrador ? `
      <button class="btn btn-sm btn-danger" onclick="removerUsuario(${i})">
        <i class="fas fa-trash"></i>
      </button>
    ` : '';

    li.innerHTML = `
      <div>
        <strong>${u.nome}</strong> (${u.tipoUsuario})<br>
        <small class="text-muted">
          CPF: ${u.cpf} | Nasc.: ${u.nascimento}<br>
          Email: ${u.email}
        </small>
      </div>
      ${botoesAcao}
    `;
    lista.appendChild(li);
  });
}

window.removerUsuario = function(index) {
  if (perfil !== "Administrador") {
    alert("Acesso negado: apenas administradores podem remover usuários.");
    return;
  }
  
  if (!confirm("Tem certeza que deseja remover este usuário?")) return;
  
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  usuarios.splice(index, 1);
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  renderUsuarios();
  
  // Mostrar mensagem de sucesso
  const msg = document.getElementById("mensagemCadastro");
  if (msg) {
    msg.className = "alert alert-success";
    msg.innerHTML = '<i class="fas fa-check-circle me-2"></i>Usuário removido com sucesso!';
    setTimeout(() => {
      msg.className = "";
      msg.innerHTML = "";
    }, 3000);
  }
};

document.getElementById("filtroUsuario")?.addEventListener("input", renderUsuarios);
document.getElementById("filtroCredencial")?.addEventListener("change", renderUsuarios);

document.getElementById('usuarios-tab')?.addEventListener('shown.bs.tab', renderUsuarios);

if (document.getElementById('usuarios')?.classList.contains('show')) {
  renderUsuarios();
}

if (formCadastro) {
  formCadastro.addEventListener("submit", function (e) {
    e.preventDefault();

    // Verificar se é administrador
    if (perfil !== "Administrador") {
      alert("Acesso negado: apenas administradores podem cadastrar novos usuários.");
      return;
    }

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
    
    // Verificar se CPF já existe
    if (usuarios.some(u => u.cpf === novoUsuario.cpf)) {
      alert("CPF já cadastrado!");
      return;
    }

    usuarios.push(novoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    const msg = document.getElementById("mensagemCadastro");
    if (msg) {
      msg.className = "alert alert-success";
      msg.innerHTML = '<i class="fas fa-check-circle me-2"></i>Cadastro realizado com sucesso!';
      setTimeout(() => {
        msg.className = "";
        msg.innerHTML = "";
      }, 3000);
    }

    this.reset();
    renderUsuarios();
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  verificarPermissoes();
  renderUsuarios();
});