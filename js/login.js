document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();

  // Login experimental (sem banco)
  if (usuario === "aluno" && senha === "1234") {
    alert("Login realizado com sucesso!");
    window.location.href = "portal.html"; // Redireciona para o portal do aluno
  } else {
    alert("Usuário ou senha incorretos!");
  }
});
