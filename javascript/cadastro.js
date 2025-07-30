function validarCPF(cpf) {
    return /^\d{11}$/.test(cpf);
  }

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