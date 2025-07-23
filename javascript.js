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
  }];

    const especialidades = [
    "Clínico Geral",
    "Pediatria",
    "Dermatologia",
    "Cardiologia",
    "Oftalmologia",
    "Ginecologia e Obstetrícia",
    "Ortopedia e Traumatologia",
    "Neurologia",
    "Psiquiatria",
    "Endocrinologia e Metabologia",
    "Gastroenterologia",
    "Urologia",
    "Otorrinolaringologia",
    "Reumatologia",
    "Pneumologia",
    "Nefrologia",
    "Infectologia",
    "Oncologia"
  ];

function formatarDataBR(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

document.addEventListener("DOMContentLoaded", () => {
  //Login
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
      } else {
        errorMsg.textContent = "Usuário ou senha inválidos.";
      }
    });

    popularDadosFicticios();
  }

  //Validação de CPF
  function validarCPF(cpf) {
    return /^\d{11}$/.test(cpf);
  }

  //Cadastro de Pacientes
  const formCadastro = document.getElementById("formCadastro");
  if (formCadastro) {
    formCadastro.addEventListener("submit", function (e) {
      e.preventDefault();

      const novoPaciente = {
        nome: document.getElementById("nome").value.trim(),
        cpf: document.getElementById("cpf").value.trim(),
        nascimento: document.getElementById("nascimento").value,
        email: document.getElementById("email").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
      };

      if (!validarCPF(novoPaciente.cpf)) {
        alert("CPF inválido. Digite exatamente 11 números.");
        return;
      }

      const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
      pacientes.push(novoPaciente);
      localStorage.setItem("pacientes", JSON.stringify(pacientes));

      const msg = document.getElementById("mensagemCadastro");
      msg.textContent = "Paciente cadastrado com sucesso!";
      msg.classList.add("success");

      this.reset();

      setTimeout(() => {
        msg.textContent = "";
      }, 4000);
    });
  }

  //Agendamento de Consultas
  const formAgendamento = document.getElementById("formAgendamento");
  const selectPaciente = document.getElementById("nomePaciente");
  const dataConsultaInput = document.getElementById("dataConsulta");

  const selectEspecialidade = document.getElementById("especialidade");

  // Adiciona as opções ao <select>
    especialidades.forEach((especialidade) => {
    const option = document.createElement("option");
    option.value = especialidade;
    option.textContent = especialidade;
    selectEspecialidade.appendChild(option);
  });

  if (formAgendamento && selectPaciente && dataConsultaInput) {
    const today = new Date().toISOString().split("T")[0];
    dataConsultaInput.setAttribute("min", today);

    const pacientesSalvos = JSON.parse(localStorage.getItem("pacientes")) || [];

    pacientesSalvos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.nome;
      option.textContent = p.nome;
      selectPaciente.appendChild(option);
    });

    formAgendamento.addEventListener("submit", function (e) {
      e.preventDefault();

      const novaConsulta = {
        paciente: document.getElementById("nomePaciente").value,
        especialidade: document.getElementById("especialidade").value,
        data: document.getElementById("dataConsulta").value,
        hora: document.getElementById("horaConsulta").value,
      };

      const consultas = JSON.parse(localStorage.getItem("consultas")) || [];
      consultas.push(novaConsulta);
      localStorage.setItem("consultas", JSON.stringify(consultas));

      const msg = document.getElementById("mensagemAgendamento");
      msg.textContent = "Consulta agendada com sucesso!";
      msg.classList.add("success");

      this.reset();

      setTimeout(() => {
        msg.textContent = "";
      }, 4000);
    });
  }

  //Listagem de pacientes e consultas
  const pacienteList = document.getElementById("pacienteList");
  const consultaList = document.getElementById("consultaList");

  if (pacienteList && consultaList) {
    const pacientes = JSON.parse(localStorage.getItem("pacientes")) || [];
    let consultas = JSON.parse(localStorage.getItem("consultas")) || [];
    const perfil = localStorage.getItem("perfil") || "comum";

    // Pacientes
    function renderPacientes() {
      if (pacientes.length === 0) {
        pacienteList.innerHTML =
          '<li class="list-group-item">Nenhum paciente cadastrado.</li>';
        return;
      }

      pacienteList.innerHTML = "";
      pacientes.forEach((c, index) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
          <div>
            <strong>${c.nome}</strong><br>
            CPF: ${c.cpf} | Nasc.: ${formatarDataBR(c.nascimento)}<br>
            Email: ${c.email} | Tel: ${c.telefone}
          </div>
        `;

        if (perfil === "admin") {
          const btn = document.createElement("button");
          btn.textContent = "Excluir";
          btn.className = "btn btn-sm btn-danger";
          btn.onclick = () => {
            if (confirm(`Deseja excluir o paciente ${c.nome}?`)) {
              // Remover paciente da lista
              pacientes.splice(index, 1);
              localStorage.setItem("pacientes", JSON.stringify(pacientes));
              // Remover consultas associadas ao paciente
              consultas = consultas.filter(
                (consulta) => consulta.paciente !== c.nome
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

    // Consultas
    function renderConsultas() {
      if (consultas.length === 0) {
        consultaList.innerHTML =
          '<li class="list-group-item">Nenhuma consulta agendada.</li>';
        return;
      }

      consultaList.innerHTML = "";
      const hoje = new Date();

      consultas.forEach((c, index) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center";

        const [dia, mes, ano] = c.data.split("/");
        const dataConsulta = new Date(`${ano}-${mes}-${dia}`);

        const diffEmMs = dataConsulta - hoje;
        const diasRestantes = Math.ceil(diffEmMs / (1000 * 60 * 60 * 24));

        const statusConsulta =
          diasRestantes > 0
            ? `Dias até a Consulta: ${diasRestantes} Dia(s)`
            : diasRestantes === 0
            ? `É hoje!`
            : `Já passou`;

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

        consultaList.appendChild(li);
      });
    }

    renderPacientes();
    renderConsultas();
  }
});

//POPULAR DADOS FAKE
function popularDadosFicticios() {
  const nomesFake = [
    "Ana Souza",
    "Bruno Lima",
    "Carla Menezes",
    "Daniel Rocha",
    "Eduarda Castro",
    "Felipe Martins",
    "Gabriela Santos",
    "Henrique Duarte",
    "Isabela Costa",
    "João Ribeiro",
    "Kátia Borges",
    "Leonardo Silva",
    "Mariana Nogueira",
    "Nicolas Pires",
    "Otávio Almeida",
    "Patrícia Ramos",
    "Quésia Oliveira",
    "Rafael Mendes",
    "Simone Carvalho",
    "Thiago Araújo",
  ];

  const pacientes = [];
  const consultas = [];

  const hoje = new Date();

  nomesFake.forEach((nome, index) => {
    const nascimentoISO = `199${index % 10}-0${(index % 9) + 1}-15`;

    const paciente = {
      nome: nome,
      cpf: String(10000000000 + index),
      nascimento: nascimentoISO,
      email: nome.toLowerCase().replace(" ", ".") + "@fic-email.com",
      telefone: `2199${index.toString().padStart(6, "0")}`,
    };

    pacientes.push(paciente);

    const dataConsulta = new Date(hoje);
    dataConsulta.setDate(hoje.getDate() + index + 1);
    const dataFormatada = formatarDataBR(
      dataConsulta.toISOString().split("T")[0]
    );

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
}

  //Gráfico de Distribuição das consultas
  const consultaList = JSON.parse(localStorage.getItem("consultas")) || [];  
  const hoje = new Date();
  const especialidadesContagem = {};
    
    consultaList.forEach(c => {
      const [dia, mes, ano] = c.data.split('/');
      const dataConsulta = new Date(`${ano}-${mes}-${dia}`);

      if (dataConsulta >= hoje) {
        if (especialidadesContagem[c.especialidade]) {
          especialidadesContagem[c.especialidade]++;
        } else {
          especialidadesContagem[c.especialidade] = 1;
        }
      }
      console.log(c.especialidade, dataConsulta, hoje);
    });

      const labels = Object.keys(especialidadesContagem);
      const data  = Object.values(especialidadesContagem);
      const ctx = document.getElementById('graficoPizza').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels.length ? labels : ['Nenhuma consulta futura'],
          datasets: [{
                      label: 'Consultas Futuras',
                      data: data.length ? data : [1],
                      backgroundColor: ['#0d6efd', '#ffc107', '#198754', '#dc3545', '#6f42c1', '#20c997'],
                      borderColor: ['#fff'],
                      borderWidth: 2
                    }]
        },
        options: {
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });