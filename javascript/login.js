
// Função de login
function realizarLogin(cpf, senha) {
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  const user = usuarios.find((u) => u.cpf === cpf && u.senha === senha);
  
  return user;
}

function realizarLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const cpf = document.getElementById("username").value.trim();
      const senha = document.getElementById("password").value.trim();
      const errorMsg = document.getElementById("errorMsg");
      
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const btnOriginal = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Entrando...';
      submitBtn.disabled = true;
      
      setTimeout(() => {
        const user = realizarLogin(cpf, senha);
        
        if (user) {
          errorMsg.style.display = "none";
          localStorage.setItem("perfil", user.tipoUsuario);
          localStorage.setItem("nomeUsuario", user.nome);
          localStorage.setItem("cpfUsuario", user.cpf);
          
          // Login realizado com sucesso
          window.location.href = "dashboard.html";
        } else {
          // Falha no login
          errorMsg.style.display = "block";
          errorMsg.textContent = "CPF ou senha inválidos.";
          errorMsg.className = "alert alert-danger alert-dismissible fade show";
          
          errorMsg.innerHTML += `
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
        }
        
        submitBtn.innerHTML = btnOriginal;
        submitBtn.disabled = false;
      }, 500);
    });
  }

  // Usuário logado?
  const perfil = localStorage.getItem("perfil");
  const nomeUsuario = localStorage.getItem("nomeUsuario");
  
  if (perfil && nomeUsuario && !loginForm) {
    window.location.href = "dashboard.html";
  }

  // LOGOUT
  const logoutBtn = document.getElementById("logoutLink");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      realizarLogout();
    });
  }
});