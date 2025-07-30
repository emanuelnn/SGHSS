// Usuários fictícios para login
const fakeUsers = [
  {
    username: "admin",
    password: "123456",
    nome: "admin",
    funcao: "Administrador",
  },
  {
    username: "emanuel.nascimento",
    password: "1234",
    nome: "Emanuel Nogueira do Nascimento",
    funcao: "Administrador",
  },
  {
    username: "maria.silva",
    password: "maria2025",
    nome: "Maria da Silva",
    funcao: "Enfermeiro(a)",
  },
  {
    username: "jessica.silva",
    password: "jessica2025",
    nome: "Jessica da Silva",
    funcao: "Enfermeiro(a)",
  },
  {
    username: "claudia.gomes",
    password: "claudia2025",
    nome: "Claudia Gomes",
    funcao: "Enfermeiro(a)",
  },
  {
    username: "rodrigo.santos",
    password: "rodrigo2025",
    nome: "Rodrigo Santos",
    funcao: "Enfermeiro(a)",
  },
];


// Função para popular dados fictícios no localStorage
function popularDadosFicticios() {
  const nomesFake = [
    "Ana Souza", "Bruno Lima", "Carla Menezes", "Daniel Rocha", "Eduarda Castro",
    "Felipe Martins", "Gabriela Santos", "Henrique Duarte", "Isabela Costa",
    "João Ribeiro", "Kátia Borges", "Leonardo Silva", "Mariana Nogueira",
    "Nicolas Pires", "Otávio Almeida", "Patrícia Ramos", "Quésia Oliveira",
    "Rafael Mendes", "Simone Carvalho", "Thiago Araújo",
  ];

  const pacientes = [];
  const consultas = [];
  const hoje = new Date();

  nomesFake.forEach((nome, index) => {
    const nascimentoISO = `199${index % 10}-0${(index % 9) + 1}-15`;
    const paciente = {
      nome: nome,
      cpf: String(10000000000 + index).padStart(11, '0'),
      nascimento: nascimentoISO,
      email: nome.toLowerCase().replace(" ", ".") + "@fic-email.com",
      telefone: `2199${index.toString().padStart(6, "0")}`,
    };
    pacientes.push(paciente);

    const dataConsulta = new Date(hoje);
    dataConsulta.setDate(hoje.getDate() + index + 1);
    const dataFormatada = formatarDataBR(dataConsulta.toISOString().split("T")[0]);

    const consulta = {
      paciente: nome,
      especialidade: especialidades[index % especialidades.length],
      data: dataFormatada,
      hora: "10:00",
    };
    consultas.push(consulta);
  });

  localStorage.setItem("pacientes", JSON.stringify(pacientes));
  localStorage.setItem("consultas", JSON.stringify(consultas));
  console.log("Dados fictícios populados no localStorage.");
}

document.addEventListener("DOMContentLoaded", () => {
  // LOGIN
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const usernameInput = document.getElementById("username").value;
      const passwordInput = document.getElementById("password").value;
      const errorMsg = document.getElementById("errorMsg");

      const user = fakeUsers.find(
        (u) => u.username === usernameInput && u.password === passwordInput
      );

      if (user) {
        errorMsg.textContent = "";
        localStorage.setItem(
          "perfil",
          user.funcao === "Administrador" ||
            user.funcao === "Médico" ||
            user.funcao === "Enfermeiro(a)"
            ? "admin"
            : "comum"
        );
        localStorage.setItem("nomeUsuario", user.nome);
        window.location.href = "dashboard.html";
        
        popularDadosFicticios();
      } else {
        errorMsg.textContent = "Usuário ou senha inválidos.";
      }
    });
    }});