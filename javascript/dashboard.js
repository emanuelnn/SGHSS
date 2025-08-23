const canvasGraficoPizza = document.getElementById('graficoPizza');

  if (canvasGraficoPizza) {

    if (!localStorage.getItem("consultas") || JSON.parse(localStorage.getItem("consultas")).length === 0) {
      popularDadosFicticios();
    }

    const consultasParaGrafico = JSON.parse(localStorage.getItem("consultas")) || [];
    const hojeParaGrafico = new Date();
    const especialidadesContagem = {};

    consultasParaGrafico.forEach(c => {
      const [diaStr, mesStr, anoStr] = c.data.split('/');

      const dataConsulta = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));

      const hojeSemTempo = new Date(hojeParaGrafico.getFullYear(), hojeParaGrafico.getMonth(), hojeParaGrafico.getDate());

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
  };

  // Toggle sidebar for mobile
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('show');
    }
    
    // Initialize dashboard
    document.addEventListener('DOMContentLoaded', function() {
      updateMetrics();
      updateRecentActivities();
    });
    
    // Update metrics
    function updateMetrics() {
      // Get data from localStorage
      const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
      const consultas = JSON.parse(localStorage.getItem('consultas')) || [];
      const leitos = JSON.parse(localStorage.getItem('leitos')) || [];
      
      // Calculate metrics
      const pacientes = usuarios.filter(u => u.tipoUsuario === 'Paciente').length;
      const medicos = usuarios.filter(u => u.tipoUsuario === 'Médico').length;
      
      const hoje = new Date();
      const hojeSemTempo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const consultasFuturas = consultas.filter(c => {
        const [dia, mes, ano] = c.data.split('/');
        const dataConsulta = new Date(ano, mes - 1, dia);
        return dataConsulta >= hojeSemTempo;
      }).length;
      
      const leitosOcupados = leitos.filter(l => l.status === 'ocupado').length;
      
      // Update DOM
      document.getElementById('totalPacientes').textContent = pacientes;
      document.getElementById('totalMedicos').textContent = medicos;
      document.getElementById('consultasFuturas').textContent = consultasFuturas;
      document.getElementById('leitosOcupados').textContent = leitosOcupados;
    }
    
    // Update recent activities
    function updateRecentActivities() {
      const activities = [];
      
      // Get recent data
      const consultas = JSON.parse(localStorage.getItem('consultas')) || [];
      const prescricoes = JSON.parse(localStorage.getItem('prescricoes')) || [];
      const leitos = JSON.parse(localStorage.getItem('leitos')) || [];
      
      // Add recent consultations
      consultas.slice(-3).forEach(c => {
        activities.push({
          title: `Consulta agendada: ${c.paciente} - ${c.especialidade}`,
          time: c.data,
          type: 'primary',
          icon: 'fas fa-calendar-check'
        });
      });
      
      // Add recent prescriptions
      prescricoes.slice(-2).forEach(p => {
        activities.push({
          title: `Nova prescrição para: ${p.paciente}`,
          time: 'Hoje',
          type: 'success',
          icon: 'fas fa-prescription-bottle-alt'
        });
      });
      
      // Add recent bed changes
      leitos.filter(l => l.status === 'ocupado').slice(-2).forEach(l => {
        activities.push({
          title: `Leito ocupado: ${l.numero} - ${l.paciente}`,
          time: 'Hoje',
          type: 'warning',
          icon: 'fas fa-bed'
        });
      });
      
      // Sort activities by time (most recent first)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      // Limit to 5 activities
      const recentActivities = activities.slice(0, 5);
      
      // Populate DOM
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