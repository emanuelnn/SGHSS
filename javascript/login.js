// Gera senha aleatória
const gerarSenhaAleatoria = (tamanho = 6) =>
  Array.from({ length: tamanho }, () =>
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      .charAt(Math.floor(Math.random() * 62))
  ).join("");

// Formata data para dd/mm/yyyy
const formatarDataBR = (dataISO) =>
  dataISO.split("-").reverse().join("/");

// Popula dados fictícios
function popularDadosFicticios() {
  const nomesFake = [
    "Ana Souza", "Bruno Lima", "Carla Menezes", "Daniel Rocha", "Eduarda Castro",
    "Felipe Martins", "Gabriela Santos", "Henrique Duarte", "Isabela Costa",
    "João Ribeiro", "Kátia Borges", "Leonardo Silva", "Mariana Nogueira",
    "Nicolas Pires", "Otávio Almeida", "Patrícia Ramos", "Quésia Oliveira",
    "Rafael Mendes", "Simone Carvalho", "Thiago Araújo",
  ];

  const hoje = new Date();
  const usuarios = nomesFake.map((nome, i) => {
    const nascimentoISO = `199${i % 10}-0${(i % 9) + 1}-15`;
    return {
      nome,
      cpf: String(10000000000 + i).padStart(11, "0"),
      nascimento: nascimentoISO,
      email: nome.toLowerCase().replace(/\s+/g, ".") + "@fic-email.com",
      telefone: `2199${i.toString().padStart(6, "0")}`,
      senha: gerarSenhaAleatoria(),
      tipoUsuario: "Paciente"
    };
  });

  const consultas = nomesFake.map((nome, i) => {
    const dataConsulta = new Date(hoje);
    dataConsulta.setDate(hoje.getDate() + i + 1);
    return {
      paciente: nome,
      especialidade: especialidades[i % especialidades.length],
      data: formatarDataBR(dataConsulta.toISOString().split("T")[0]),
      hora: "10:00"
    };
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  localStorage.setItem("consultas", JSON.stringify(consultas));
  console.log("✅ Dados fictícios populados no localStorage.");
}

// Início
document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cpf = document.getElementById("username").value;
      const senha = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
      const user = usuarios.find((u) => u.cpf === cpf && u.senha === senha);

      if (user) {
        errorMsg.textContent = "";
        localStorage.setItem("perfil", user.tipoUsuario);
        localStorage.setItem("nomeUsuario", user.nome);
        window.location.href = "dashboard.html";
      } else {
        errorMsg.textContent = "CPF ou senha inválidos.";
      }
    });
  }

  // Popula caso ainda não exista
  if (!localStorage.getItem("usuarios")) popularDadosFicticios();
});
