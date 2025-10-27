document.getElementById("btn-turmas").addEventListener("click", () => {
  window.location.href = "turmas.html"; // Redireciona para a página de horários
});

document.getElementById("btn-boletim").addEventListener("click", () => {
  alert("📄 O boletim ainda está em desenvolvimento!");
});

document.getElementById("btn-sair").addEventListener("click", () => {
  window.location.href = "login.html"; // Volta para o login
});
