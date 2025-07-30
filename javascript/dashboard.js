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