// ===============================
// LOGIN DO PROFESSOR (FUNCIONAL)
// ===============================

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const res = await fetch("/api/loginProfessor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Usuário ou senha incorretos!");
      return;
    }

    // Salva os dados do professor logado
    localStorage.setItem("professorLogado", JSON.stringify(data));

    // Redireciona para o painel do professor
    window.location.href = "painel_professor.html";

  } catch (err) {
    console.error("❌ Erro no login:", err);
    alert("Erro ao conectar ao servidor. Tente novamente.");
  }
});
