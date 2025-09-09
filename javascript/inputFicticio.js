// Arquivo para dados fictícios afim de alimentar o site e demonstrar alguns recursos.
// Dados são armazenados no localStorage do navegador para persistência simples.

// Especialidades médicas
const especialidades = [
  "Clínico Geral", "Pediatria", "Dermatologia", "Cardiologia", "Oftalmologia",
  "Ginecologia e Obstetrícia", "Ortopedia e Traumatologia", "Neurologia", "Psiquiatria",
  "Endocrinologia e Metabologia", "Gastroenterologia", "Urologia", "Otorrinolangingologia",
  "Reumatologia", "Pneumologia", "Nefrologia", "Infectologia", "Oncologia"
];

// Tipos de exames
const tiposExames = [
  "Hemograma Completo", "Glicemia de Jejum", "Colesterol Total", "TSH", "T4 Livre",
  "Urina Tipo 1", "Ultrassonografia Abdominal", "Rai-X de Tórax", "Eletrocardiograma",
  "Tomografia Computadorizada", "Ressonância Magnética", "Endoscopia", "Colonoscopia",
  "Mamografia", "Papanicolau", "PSA", "Hemocultura", "Ecocardiograma"
];

// Tipos de Suprimeiros
const tiposProdutos = [
  "Medicamentos", "Material Cirúrgico", "Material de Enfermagem", "Equipamentos",
  "Material de Limpeza", "Material de Escritório", "EPIs", "Vacinas", "Reagentes"
];

// Categorias de produtos
const categoriasProdutos = [
  "Material Médico", "Material de Enfermagem", "Material de Laboratório", "Material Administrativo"
];

// Unidades de medida
const unidadesMedida = [
  "Unidade", "Caixa", "Frasco", "Pote", "Kit", "Rolos", "Litros", "Mililitros", "Gramas",
  "Miligramas", "Comprimidos", "Ampolas", "Cartuchos", "Seringas", "Bandejas"
];

// Tipos de Ganho Financeiro
const tiposFinanceiro = [
  "Consulta", "Teleconsulta", "Exame","Internação"
];


// Nomes fictícios (pacientes)
const nomesPacientes = [
  "Ana Souza", "Bruno Lima", "Carla Menezes", "Daniel Rocha", "Eduarda Castro",
  "Felipe Martins", "Gabriela Santos", "Henrique Duarte", "Isabela Costa",
  "João Ribeiro", "Kátia Borges", "Leonardo Silva", "Mariana Nogueira",
  "Nicolas Pires", "Otávio Almeida", "Patrícia Ramos", "Quésia Oliveira",
  "Rafael Mendes", "Simone Carvalho", "Thiago Araújo", "Fernanda Costa",
  "Marcelo Oliveira", "Amanda Santos", "Roberto Almeida", "Juliana Ferreira",
  "Gustavo Pereira", "Camila Rodrigues", "Lucas Souza", "Priscila Lima"
];

// Nomes fictícios (médicos)
const nomesMedicos = [
  "Dr. Carlos Mendes", "Dra. Paula Santos", "Dr. Marcos Oliveira", "Dra. Fernanda Costa",
  "Dr. Roberto Almeida", "Dra. Juliana Ferreira", "Dr. Gustavo Pereira", "Dra. Camila Rodrigues",
  "Dr. Lucas Souza", "Dra. Priscila Lima", "Dr. Ricardo Silva", "Dra. Patricia Santos",
  "Dr. Anderson Oliveira", "Dra. Michele Costa", "Dr. Fernando Pereira", "Dra. Carolina Lima"
];

// Nomes (fictícios)
const nomesEnfermeiros = [
  "Enf. Maria Santos", "Enf. João Silva", "Enf. Ana Costa", "Enf. Pedro Oliveira",
  "Enf. Carla Lima", "Enf. Marcos Pereira", "Enf. Fernanda Almeida", "Enf. Roberto Ferreira",
  "Enf. Juliana Souza", "Enf. Gustavo Rodrigues"
];

// Funções
function gerarCPF() {
  return String(10000000000 + Math.floor(Math.random() * 9000000000)).padStart(11, "0");
}

function gerarDataNascimento() {
  const ano = 1960 + Math.floor(Math.random() * 40);
  const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function gerarTelefone() {
  const ddd = String(Math.floor(Math.random() * 90) + 11).padStart(2, "0");
  const parte1 = String(Math.floor(Math.random() * 9000) + 1000);
  const parte2 = String(Math.floor(Math.random() * 9000) + 1000);
  return `(${ddd}) ${parte1}-${parte2}`;
}

function gerarDataFutura() {
  const hoje = new Date();
  const diasFuturos = Math.floor(Math.random() * 30) + 1;
  const dataFutura = new Date(hoje);
  dataFutura.setDate(hoje.getDate() + diasFuturos);
  return dataFutura.toISOString().split("T")[0];
}

function gerarDataAleatoriaAnoAtual() {
  const anoAtual = new Date().getFullYear();

  const mes = Math.floor(Math.random() * 12);

  const ultimoDiaMes = new Date(anoAtual, mes + 1, 0).getDate();
  const dia = Math.floor(Math.random() * ultimoDiaMes) + 1;

  const dataAleatoria = new Date(anoAtual, mes, dia);

  return dataAleatoria.toISOString().split("T")[0];
}

function formatarDataBR(dataISO) {
  return dataISO.split("-").reverse().join("/");
}

function gerarSenhaAleatoria(tamanho = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: tamanho }, () => 
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

function valorMonetarioAleatorio() {
  const valor = Math.floor(Math.random() * (2000 - 100 + 1)) + 50;
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// Geração de usuários (Pacientes, Médicos, Enfermeiros, Administradores)
function gerarUsuarios() {
  const usuarios = [];
  
  //pacientes
  nomesPacientes.forEach((nome, index) => {
    usuarios.push({
      id: Date.now() + index,
      nome: nome,
      cpf: gerarCPF(),
      nascimento: gerarDataNascimento(),
      email: nome.toLowerCase().replace(/\s+/g, ".") + "@paciente.com",
      telefone: gerarTelefone(),
      senha: gerarSenhaAleatoria(),
      tipoUsuario: "Paciente",
      ativo: true,
      dataCadastro: new Date().toISOString()
    });
  });
  
  //médicos
  nomesMedicos.forEach((nome, index) => {
    usuarios.push({
      id: Date.now() + nomesPacientes.length + index,
      nome: nome,
      cpf: gerarCPF(),
      nascimento: gerarDataNascimento(),
      email: nome.toLowerCase().replace(/\s+/g, ".") + "@medico.com",
      telefone: gerarTelefone(),
      senha: gerarSenhaAleatoria(),
      tipoUsuario: "Médico",
      crm: String(Math.floor(Math.random() * 90000) + 10000),
      especialidade: especialidades[Math.floor(Math.random() * especialidades.length)],
      ativo: true,
      dataCadastro: new Date().toISOString()
    });
  });
  
  //enfermeiros
  nomesEnfermeiros.forEach((nome, index) => {
    usuarios.push({
      id: Date.now() + nomesPacientes.length + nomesMedicos.length + index,
      nome: nome,
      cpf: gerarCPF(),
      nascimento: gerarDataNascimento(),
      email: nome.toLowerCase().replace(/\s+/g, ".") + "@enfermeiro.com",
      telefone: gerarTelefone(),
      senha: gerarSenhaAleatoria(),
      tipoUsuario: "Tec. Enfermagem",
      coren: String(Math.floor(Math.random() * 900000) + 100000),
      ativo: true,
      dataCadastro: new Date().toISOString()
    });
  });
  
  //Usuários pré-Definidos para testes e validações
  usuarios.push(
    {
      id: Date.now() + nomesPacientes.length + nomesMedicos.length + nomesEnfermeiros.length + 1,
      nome: "Administrador Principal",
      cpf: "00000000000",
      nascimento: "1980-01-01",
      email: "admin@hospital.com",
      telefone: "(11) 99999-0000",
      senha: "admin123",
      tipoUsuario: "Administrador",
      ativo: true,
      dataCadastro: new Date().toISOString()
    },
    {
      id: Date.now() + nomesPacientes.length + nomesMedicos.length + nomesEnfermeiros.length + 2,
      nome: "Coordenador de Enfermagem",
      cpf: "11111111111",
      nascimento: "1985-03-15",
      email: "coordenador@hospital.com",
      telefone: "(11) 99999-1111",
      senha: "enfermeiro123",
      tipoUsuario: "Tec. Enfermagem",
      coren: "123456",
      ativo: true,
      dataCadastro: new Date().toISOString()
    },
    {
      id: Date.now() + nomesPacientes.length + nomesMedicos.length + nomesEnfermeiros.length + 2,
      nome: "Paciente Teste",
      cpf: "22222222222",
      nascimento: "1985-03-15",
      email: "N/A",
      telefone: "(11) 99999-2222",
      senha: "paciente123",
      tipoUsuario: "Paciente",
      coren: "N/A",
      ativo: true,
      dataCadastro: new Date().toISOString()
    },
    {
      id: Date.now() + nomesPacientes.length + nomesMedicos.length + nomesEnfermeiros.length + 2,
      nome: "Médico Teste",
      cpf: "33333333333",
      nascimento: "1981-08-02",
      email: "N/A",
      telefone: "(11) 99999-3333",
      senha: "medico123",
      tipoUsuario: "Médico",
      coren: "N/A",
      ativo: true,
      dataCadastro: new Date().toISOString()
    }
  );

  return usuarios;
}

function gerarFinanceiro() {
  const financeiro = [];
  const hoje = new Date();
  const inicio = new Date("2025-01-01");
  
  nomesPacientes.forEach((paciente) => {
    const numConsultas = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numConsultas; i++) {
      const diff = hoje.getTime() - inicio.getTime();
      
      const randomTime = inicio.getTime() + Math.random() * diff;
      const data = new Date(randomTime);
      
      financeiro.push({
        id: financeiro.length + 1,
        paciente: paciente,
        tipo: tiposFinanceiro[Math.floor(Math.random() * tiposFinanceiro.length)],
        data: data.toISOString().split("T")[0],
        valor: valorMonetarioAleatorio()
      });
    }
  });

  return financeiro;
}

function gerarConsultas() {
  const consultas = [];
  const hoje = new Date();
  
  nomesPacientes.forEach((paciente, index) => {
    const numConsultas = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numConsultas; i++) {
      const dataConsulta = new Date(hoje);
      dataConsulta.setDate(hoje.getDate() + Math.floor(Math.random() * 60) + 1);
      
      const medico = nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)];
      
      consultas.push({
        id: Date.now() + index * 1000 + i,
        paciente: paciente,
        medico: medico,
        especialidade: especialidades[Math.floor(Math.random() * especialidades.length)],
        data: dataConsulta.toISOString().split("T")[0],
        hora: ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"][Math.floor(Math.random() * 7)],
        status: ["Futuras", "Futuras", "Futuras", "Hoje", "Passadas"][Math.floor(Math.random() * 5)],
        prioridade: ["Normal", "Normal", "Normal", "Urgente", "Emergência"][Math.floor(Math.random() * 5)],
        motivo: "Consulta de rotina" + (Math.random() > 0.7 ? " - " + ["Dor de cabeça", "Febre", "Exames", "Revisão", "Queixa geral"][Math.floor(Math.random() * 5)] : ""),
        observacoes: "",
        dataCadastro: new Date().toISOString()
      });
    }
  });
  
  return consultas;
}

//exames
function gerarExames() {
  const exames = [];
  
  nomesPacientes.forEach((paciente, index) => {
    if (Math.random() > 0.6) {
      const tipoExame = tiposExames[Math.floor(Math.random() * tiposExames.length)];
      const dataExame = gerarDataAleatoriaAnoAtual();
      
      exames.push({
        id: Date.now() + index * 1000,
        paciente: paciente,
        tipo: tipoExame,
        data: dataExame,
        hora: ["07:00", "08:00", "09:00", "10:00", "14:00"][Math.floor(Math.random() * 5)],
        local: ["Laboratório Central", "Unidade Móvel", "Posto de Saúde","Hospital"][Math.floor(Math.random() * 3)],
        status: ["Aguardando", "Realizado", "Resultado Disponível"][Math.floor(Math.random() * 4)],
        resultado: Math.random() > 0.5 ? "Normal" : "Alterado",
        medicoSolicitante: nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)],
        valor: valorMonetarioAleatorio(),
        observacoes: "",
        dataCadastro: new Date().toISOString()
      });
    }
  });
  
  return exames;
}

//leitos hospitalares
function gerarLeitos() {
  const leitos = [];
  const andares = [1, 2, 3, 4, 5];
  const setores = ["clinico", "cirurgico", "pediatria", "uti", "enfermaria"];
  const tipos = ["individual", "duplo", "enfermaria"];
  
  let id = 1;
  andares.forEach(andar => {
    setores.forEach(setor => {
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const capacidade = tipo === "individual" ? 1 : tipo === "duplo" ? 2 : 4;
      
      for (let i = 0; i < capacidade; i++) {
        const status = ["Livre", "Ocupado", "Manutenção"][Math.floor(Math.random() * 3)];
        const paciente = status === "Ocupado" ? nomesPacientes[Math.floor(Math.random() * nomesPacientes.length)] : null;
        
        leitos.push({
          id: id++, // use id único
          numero: `${andar}${String(i + 1).padStart(2, '0')}`,
          andar: andar,
          setor: setor,
          tipo: tipo,
          status: status,
          paciente: paciente,
          dataInternacao: status === "Ocupado" ? gerarDataAleatoriaAnoAtual() : null,
          previsaoAlta: status === "Ocupado" ? gerarDataFutura() : null,
          observacoes: status === "Manutenção" ? "Em manutenção preventiva" : "",
          dataCadastro: new Date().toISOString()
        });
      }
    });
  });
 
  return leitos;
}

//Agendamentos de telemedicina
function gerarTeleconsultas() {
  const teleconsultas = [];
  
  nomesPacientes.forEach((paciente, index) => {
    if (Math.random() > 0.7) {
      const dataConsulta = gerarDataAleatoriaAnoAtual();
      const medico = nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)];
      
      teleconsultas.push({
        id: Date.now() + index * 1000,
        paciente: paciente,
        medico: medico,
        especialidade: especialidades[Math.floor(Math.random() * especialidades.length)],
        data: dataConsulta,
        hora: ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"][Math.floor(Math.random() * 6)],
        status: ["Agendado", "Agendado", "Realizado", "Cancelado"][Math.floor(Math.random() * 4)],
        plataforma: ["Zoom", "Google Meet", "Microsoft Teams", "WhatsApp"][Math.floor(Math.random() * 4)],
        linkAcesso: Math.random() > 0.5 ? "https://meet.example.com/room/" + Math.random().toString(36).substr(2, 9) : null,
        valor: valorMonetarioAleatorio(),
        observacoes: "",
        dataCadastro: new Date().toISOString()
      });
    }
  });
  
  return teleconsultas;
}

//produtos/suprimentos
function gerarProdutos() {
  const produtos = [];
  
  for (let i = 0; i < 100; i++) {
    const tipo = tiposProdutos[Math.floor(Math.random() * tiposProdutos.length)];
    const categoria = categoriasProdutos[Math.floor(Math.random() * categoriasProdutos.length)];
    const unidade = unidadesMedida[Math.floor(Math.random() * unidadesMedida.length)];
    
    produtos.push({
      id: Date.now() + i,
      nome: `${categoria} ${tipo} ${Math.floor(Math.random() * 1000) + 1}`,
      descricao: `Produto de ${tipo} para uso hospitalar`,
      tipo: tipo,
      categoria: categoria,
      unidade: unidade,
      quantidade: Math.floor(Math.random() * 1000) + 10,
      estoqueMinimo: Math.floor(Math.random() * 100) + 5,
      estoqueMaximo: Math.floor(Math.random() * 500) + 100,
      fornecedor: ["Fornecedor A", "Fornecedor B", "Fornecedor C", "Fornecedor D"][Math.floor(Math.random() * 4)],
      precoUnitario: (Math.random() * 100 + 1).toFixed(2),
      localArmazenamento: ["Almoxarifado Principal", "Almoxarifado Secundário", "UTI", "Enfermaria", "Farmácia"][Math.floor(Math.random() * 5)],
      status: ["Ativo", "Ativo", "Ativo", "Inativo"][Math.floor(Math.random() * 4)],
      dataCadastro: new Date().toISOString()
    });
  }
  
  return produtos;
}

//Disponibilidade de médicos
function gerarDisponibilidade() {
  const disponibilidade = [];
  
  nomesMedicos.forEach((medico, index) => {
    for (let dia = 0; dia < 30; dia++) {
      const data = new Date();
      data.setDate(data.getDate() + dia);
      
      const diaSemana = data.getDay();
      
      if (diaSemana !== 0) {
        const horarios = [];
       
        if (Math.random() > 0.3) {
          horarios.push({
            dia: "Segunda",
            periodo: "Manhã",
            inicio: "08:00",
            fim: "12:00",
            disponivel: true
          });
        }
        
        if (Math.random() > 0.3) {
          horarios.push({
            dia: "Segunda",
            periodo: "Tarde",
            inicio: "14:00",
            fim: "18:00",
            disponivel: true
          });
        }
        
        const diasUteis = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
        const diaUtil = diasUteis[diaSemana - 1];
        
        if (diaUtil) {
          horarios.forEach(horario => {
            disponibilidade.push({
              id: Date.now() + index * 1000 + dia * 100,
              medico: medico,
              data: data.toISOString().split("T")[0],
              dia: diaUtil,
              periodo: horario.periodo,
              inicio: horario.inicio,
              fim: horario.fim,
              disponivel: horario.disponivel,
              observacoes: "",
              dataCadastro: new Date().toISOString()
            });
          });
        }
      }
    }
  });
  
  return disponibilidade;
}

function gerarProntuarios() {
  const prontuarios = [];
  const historicos = [
    "Hipertensão arterial controlada com medicação",
    "Diabetes mellitus tipo 2 em tratamento",
    "Asma brônquica",
    "Doença renal crônica estágio 2",
    "Doença hepática gordurosa não alcoólica",
    "Osteoartrose de joelhos",
    "Depressão ansiosa",
    "Enxaquecas freqüentes",
    "Refluxo gastroesofágico",
    "Insônia crônica"
  ];
  
  const alergias = [
    "Alergia a penicilina",
    "Alergia a sulfonamidas",
    "Alergia a iodos",
    "Alergia a látex",
    "Alergia a alimentos (mariscos)",
    "Sem alergias conhecidas"
  ];
  
  const medicamentos = [
    "Enalapril 10mg 1x ao dia",
    "Metformina 850mg 2x ao dia",
    "Salbutamol spray conforme necessário",
    "Omeprazol 20mg 1x ao dia",
    "Sertralina 50mg 1x ao dia",
    "Ibuprofeno 400mg conforme necessário",
    "Losartan 50mg 1x ao dia",
    "Atorvastatina 20mg 1x ao dia"
  ];
  
  nomesPacientes.forEach((paciente, index) => {
    prontuarios.push({
      id: Date.now() + index,
      paciente: paciente,
      historicoPregressos: historicos[Math.floor(Math.random() * historicos.length)],
      alergias: alergias[Math.floor(Math.random() * alergias.length)],
      medicamentos: medicamentos[Math.floor(Math.random() * medicamentos.length)],
      historicoFamiliar: "Pai com diabetes tipo 2, mãe com hipertensão",
      observacoes: "Paciente segue tratamento regular, sem intercorrências recentes",
      dataUltimaAtualizacao: new Date().toISOString(),
      medicoResponsavel: nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)]
    });
  });
  
  return prontuarios;
}

//Prescrições médicas
function gerarPrescricoes() {
  const prescricoes = [];
  const medicamentos = [
    "Paracetamol 500mg 1 comprimido a cada 6 horas",
    "Ibuprofeno 400mg 1 comprimido a cada 8 horas",
    "Amoxicilina 500mg 1 comprimido a cada 8 horas por 7 dias",
    "Omeprazol 20mg 1 comprimido 1x ao dia antes do café",
    "Losartan 50mg 1 comprimido 1x ao dia",
    "Metformina 850mg 1 comprimido 2x ao dia",
    "Atorvastatina 20mg 1 comprimido 1x ao dia",
    "Sertralina 50mg 1 comprimido 1x ao dia",
    "Salbutamol spray 2 inalações conforme necessário",
    "Enalapril 10mg 1 comprimido 1x ao dia"
  ];
  
  nomesPacientes.forEach((paciente, index) => {
    const numPrescricoes = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numPrescricoes; i++) {
      prescricoes.push({
        id: Date.now() + index * 1000 + i,
        paciente: paciente,
        medico: nomesMedicos[Math.floor(Math.random() * nomesMedicos.length)],
        data: gerarDataAleatoriaAnoAtual(),
        medicamentos: medicamentos[Math.floor(Math.random() * medicamentos.length)],
        diagnostico: ["Gripe", "Infecção urinária", "Hipertensão", "Diabetes", "Dor lombar", "Enxaqueca", "Refluxo", "Asma"][Math.floor(Math.random() * 8)],
        observacoes: "Paciente deve retornar em 15 dias para avaliação",
        dataCadastro: new Date().toISOString()
      });
    }
  });
  
  return prescricoes;
}

function popularTodosDadosFicticios() {
  console.log("🚀 Iniciando população de dados fictícios...");
 
  const usuarios = gerarUsuarios();
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  console.log(`✅ ${usuarios.length} usuários gerados`);
  
  const consultas = gerarConsultas();
  localStorage.setItem("consultas", JSON.stringify(consultas));
  console.log(`✅ ${consultas.length} consultas agendadas geradas`);
  
  const financeiro = gerarFinanceiro();
  localStorage.setItem("financeiro", JSON.stringify(financeiro));
  console.log(`✅ ${financeiro.length} registros financeiros gerados`);

  const exames = gerarExames();
  localStorage.setItem("exames", JSON.stringify(exames));
  console.log(`✅ ${exames.length} exames agendados gerados`);
  
  const leitos = gerarLeitos();
  localStorage.setItem("leitos", JSON.stringify(leitos));
  console.log(`✅ ${leitos.length} leitos hospitalares gerados`);
  
  const teleconsultas = gerarTeleconsultas();
  localStorage.setItem("teleconsultas", JSON.stringify(teleconsultas));
  console.log(`✅ ${teleconsultas.length} teleconsultas agendadas geradas`);
  
  const produtos = gerarProdutos();
  localStorage.setItem("produtos", JSON.stringify(produtos));
  console.log(`✅ ${produtos.length} produtos/suprimentos gerados`);
  
  const disponibilidade = gerarDisponibilidade();
  localStorage.setItem("disponibilidade", JSON.stringify(disponibilidade));
  console.log(`✅ ${disponibilidade.length} horários de disponibilidade gerados`);
  
  const prontuarios = gerarProntuarios();
  localStorage.setItem("prontuarios", JSON.stringify(prontuarios));
  console.log(`✅ ${prontuarios.length} prontuários médicos gerados`);
  
  const prescricoes = gerarPrescricoes();
  localStorage.setItem("prescricoes", JSON.stringify(prescricoes));
  console.log(`✅ ${prescricoes.length} prescrições médicas geradas`);

  console.log("Todos os dados fictícios foram populados com sucesso!");
  
  return {
    usuarios,
    consultas,
    exames,
    leitos,
    teleconsultas,
    produtos,
    disponibilidade,
    prontuarios,
    prescricoes
  };
}

// Verificar se dados já existem e popular se necessário
function verificarEPopularDados() {
  if (!localStorage.getItem("usuarios")) {
    return popularTodosDadosFicticios();
  }
  
  // Verificar se algum dado importante está faltando
  const dadosFaltantes = [];
  
  if (!localStorage.getItem("consultas")) dadosFaltantes.push("consultas");
  if (!localStorage.getItem("exames")) dadosFaltantes.push("exames");
  if (!localStorage.getItem("leitos")) dadosFaltantes.push("leitos");
  if (!localStorage.getItem("teleconsultas")) dadosFaltantes.push("teleconsultas");
  if (!localStorage.getItem("produtos")) dadosFaltantes.push("produtos");
  if (!localStorage.getItem("disponibilidade")) dadosFaltantes.push("disponibilidade");
  if (!localStorage.getItem("prontuarios")) dadosFaltantes.push("prontuarios");
  if (!localStorage.getItem("prescricoes")) dadosFaltantes.push("prescrições");
  
  if (dadosFaltantes.length > 0) {
    console.log(`Dados faltantes detectados: ${dadosFaltantes.join(", ")}`);
    console.log("Repopulando todos os dados...");
    return popularTodosDadosFicticios();
  }
  
  console.log("Todos os dados já estão populados");
  return null;
}

// Exportar funções para uso global
window.inputFicticio = {
  popularTodosDadosFicticios,
  verificarEPopularDados,
  gerarUsuarios,
  gerarConsultas,
  gerarFinanceiro,
  gerarExames,
  gerarLeitos,
  gerarTeleconsultas,
  gerarProdutos,
  gerarDisponibilidade,
  gerarProntuarios,
  gerarPrescricoes,
  especialidades,
  tiposExames,
  tiposProdutos,
  categoriasProdutos,
  unidadesMedida
};

// Executar verificação ao carregar o script
document.addEventListener("DOMContentLoaded", () => {
    verificarEPopularDados();
  });
