  const canvasGraficoPizza = document.getElementById('graficoPizza');

  const dashboard_tab = document.getElementById('dashboard_tab');
  const acessoRestrito = document.getElementById('acessoRestrito');
  const perfil = (localStorage.getItem("perfil") || "comum");
  const cadastro_tab = document.getElementById("cadastro_tab");
  const prescricoes_tab = document.getElementById("prescricoes_tab");
  const prontuarios_tab = document.getElementById("prontuarios_tab");
  const disponibilidade_tab = document.getElementById("disponibilidade_tab");
  const leitos_tab = document.getElementById("leitos_tab");
  const relatorios_tab = document.getElementById("relatorios_tab");
  const suprimentos_tab = document.getElementById("suprimentos_tab");

function verificarPermissoes() {
  const ehAdministrador = perfil === "Administrador";
  const ehMedico = perfil === "Médico";
  const ehEnfermeiro = perfil === "Tec. Enfermagem";
console.log(ehEnfermeiro);
  if (!(ehAdministrador || ehMedico || ehEnfermeiro)) {

    if (dashboard_tab) {
      dashboard_tab.style.display = 'none';
    }
    if (acessoRestrito) {
      acessoRestrito.style.display = 'block';
    }
    if(cadastro_tab){
      cadastro_tab.style.display = 'none';
    }
    if(prescricoes_tab){
      prescricoes_tab.style.display = "none";
    }
    if(prontuarios_tab){
      prontuarios_tab.style.display = "none";
    }
    if(disponibilidade_tab){
      disponibilidade_tab.style.display = "none";
    }
    if(leitos_tab){
      leitos_tab.style.display = "none";
    }
    if(relatorios_tab){
      relatorios_tab.style.display = "none";
    }
    if(suprimentos_tab){
      suprimentos_tab.style.display = "none";
    }
  }
}

  if (canvasGraficoPizza) {

    if (!localStorage.getItem("consultas") || JSON.parse(localStorage.getItem("consultas")).length === 0) {
      popularDadosFicticios();
    }

    const consultasParaGrafico = JSON.parse(localStorage.getItem("consultas")) || [];
    const hojeParaGrafico = new Date();
    const hojeSemTempo = new Date(hojeParaGrafico.getFullYear(), hojeParaGrafico.getMonth(), hojeParaGrafico.getDate());
    const especialidadesContagem = {};

    consultasParaGrafico.forEach(c => {
      const dataConsulta = new Date(c.data);

      if (dataConsulta >= hojeSemTempo) {
        if (especialidadesContagem[c.especialidade]) {
          especialidadesContagem[c.especialidade]++;
        } else {
          especialidadesContagem[c.especialidade] = 1;
        }
      }
    });

    const labels = Object.keys(especialidadesContagem);
    const data = Object.values(especialidadesContagem);
    const ctx = canvasGraficoPizza.getContext('2d');

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels.length ? labels : ['Nenhuma consulta futura'],
        datasets: [{
          label: 'Consultas Futuras',
          data: data.length ? data : [1],
          backgroundColor: [
            '#0d6efd', '#ffc107', '#198754', '#dc3545', '#6f42c1', '#20c997',
            '#fd7e14', '#e83e8c', '#6610f2', '#0dcaf0', '#f8f9fa', '#6c757d',
            '#007bff', '#6610f2', '#fd7e14', '#e83e8c', '#28a745', '#ffc107'
          ],
          borderColor: ['#fff'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += context.parsed;
                }
                return label;
              }
            }
          }
        }
      }
    });
  }


    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('show');
    }
    
    document.addEventListener('DOMContentLoaded', function() {
      updateMetrics();
      updateRecentActivities();
      verificarPermissoes();
    });
    
    function updateMetrics() {
  const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
  const consultas = JSON.parse(localStorage.getItem('consultas')) || [];
  const leitos = JSON.parse(localStorage.getItem('leitos')) || [];

  const pacientes = usuarios.filter(u => u.tipoUsuario === 'Paciente').length;
  const medicos = usuarios.filter(u => u.tipoUsuario === 'Médico').length;

  const hoje = new Date();
  const hojeSemTempo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  const consultasFuturas = consultas.filter(c => {
    const dataConsulta = new Date(c.data);
    return dataConsulta >= hojeSemTempo;
  }).length;

  const leitosOcupados = leitos.filter(l => l.status === 'ocupado').length;

  document.getElementById('totalPacientes').textContent = pacientes;
  document.getElementById('totalMedicos').textContent = medicos;
  document.getElementById('consultasFuturas').textContent = consultasFuturas;
  document.getElementById('leitosOcupados').textContent = leitosOcupados;
}

    
    function updateRecentActivities() {
      const activities = [];
      
      const consultas = JSON.parse(localStorage.getItem('consultas')) || [];
      const prescricoes = JSON.parse(localStorage.getItem('prescricoes')) || [];
      const leitos = JSON.parse(localStorage.getItem('leitos')) || [];
      
      consultas.slice(-3).forEach(c => {
        activities.push({
          title: `Consulta agendada: ${c.paciente} - ${c.especialidade}`,
          time: c.data,
          type: 'primary',
          icon: 'fas fa-calendar-check'
        });
      });
      
      prescricoes.slice(-2).forEach(p => {
        activities.push({
          title: `Nova prescrição para: ${p.paciente}`,
          time: 'Hoje',
          type: 'success',
          icon: 'fas fa-prescription-bottle-alt'
        });
      });
      
      leitos.filter(l => l.status === 'ocupado').slice(-2).forEach(l => {
        activities.push({
          title: `Leito ocupado: ${l.numero} - ${l.paciente}`,
          time: 'Hoje',
          type: 'warning',
          icon: 'fas fa-bed'
        });
      });
      
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      const recentActivities = activities.slice(0, 5);
      
      const container = document.getElementById('recentActivities');
      container.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon ${activity.type}">
            <i class="${activity.icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-time">${activity.time}</div>
          </div>
        </div>
      `).join('');
      
      if (recentActivities.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Nenhuma atividade recente</p>';
      }
    }