// ===== Carregar professores do CSV =====
async function carregarProfessores() {
  const tabela = document.querySelector("#tabelaProfessores tbody");
  try {
    const resp = await fetch("horarios/professores.csv");
    const texto = await resp.text();
    const linhas = texto.trim().split("\n").slice(1);
    tabela.innerHTML = "";
    linhas.forEach(linha => {
      const [nome, email] = linha.split(",").map(v => v.trim());
      tabela.innerHTML += `<tr><td>${nome}</td><td>${email}</td></tr>`;
    });
  } catch (err) {
    tabela.innerHTML = `<tr><td colspan="2">Erro ao carregar professores.</td></tr>`;
  }

  // Carregar também os salvos localmente
  const locais = JSON.parse(localStorage.getItem("professoresAdicionados") || "[]");
  locais.forEach(p => {
    tabela.innerHTML += `<tr><td>${p.nome}</td><td>${p.email}</td></tr>`;
  });
}

// ===== Adicionar novo professor (localmente) =====
document.getElementById("formProfessor").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!nome || !email) return;

  const tabela = document.querySelector("#tabelaProfessores tbody");
  tabela.innerHTML += `<tr><td>${nome}</td><td>${email}</td></tr>`;

  const lista = JSON.parse(localStorage.getItem("professoresAdicionados") || "[]");
  lista.push({ nome, email });
  localStorage.setItem("professoresAdicionados", JSON.stringify(lista));

  document.getElementById("formProfessor").reset();
});

// ===== Mostrar modal do Pachequinho =====
const modal = document.getElementById("modalPachequinho");
document.getElementById("abrirPachequinho").addEventListener("click", () => {
  modal.style.display = "flex";
});
document.getElementById("fecharModal").addEventListener("click", () => {
  modal.style.display = "none";
});

// ===== Inicialização =====
window.addEventListener("DOMContentLoaded", carregarProfessores);
