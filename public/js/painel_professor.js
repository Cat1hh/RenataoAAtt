// ===============================
// 📘 PAINEL DO PROFESSOR
// ===============================

// Ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  verificarLogin();
  carregarAlunos();
  document.getElementById("logout").addEventListener("click", logout);
});

// ===============================
// 🔐 Verificar login
// ===============================
function verificarLogin() {
  const professor = JSON.parse(localStorage.getItem("professorLogado"));
  if (!professor) {
    alert("Sessão expirada. Faça login novamente.");
    window.location.href = "login_professor.html";
  }
}

// ===============================
// 🚪 Logout
// ===============================
function logout() {
  localStorage.removeItem("professorLogado");
  window.location.href = "login_professor.html";
}

// ===============================
// 👨‍🎓 Carregar alunos cadastrados
// ===============================
async function carregarAlunos() {
  try {
    const res = await fetch("/api/alunos");
    if (!res.ok) throw new Error("Erro ao buscar alunos");

    const alunos = await res.json();
    const tabela = document.getElementById("tabelaAlunos");
    tabela.innerHTML = "";

    if (!alunos.length) {
      tabela.innerHTML = `
        <tr><td colspan="4" class="py-4 text-gray-500 text-center">
          Nenhum aluno cadastrado.
        </td></tr>`;
      return;
    }

    alunos.forEach(a => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="border-b py-2">${a.nome_aluno}</td>
        <td class="border-b py-2">${a.turma_nome || "-"}</td>

        <!-- SOMENTE NOTA DO TRIMESTRE -->
        <td class="border-b py-2">
          <input 
            type="number"
            id="trimestre-${a.id}"
            min="0" 
            max="30"
            step="0.1"
            value="${a.trimestre ?? ""}"
            class="border px-2 py-1 rounded w-20 text-center">
        </td>

        <td class="border-b py-2">
          <button onclick="salvarNotas(${a.id})"
            class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">
            Salvar
          </button>
        </td>
      `;

      tabela.appendChild(tr);
    });

  } catch (err) {
    console.error("❌ Erro ao carregar alunos:", err);
    alert("Erro ao carregar alunos.");
  }
}

// ===============================
// 💾 Salvar APENAS nota do trimestre
// ===============================
async function salvarNotas(id) {
  const trimestre = parseFloat(document.getElementById(`trimestre-${id}`).value);

  if (isNaN(trimestre) || trimestre < 0 || trimestre > 30) {
    alert("A nota do trimestre deve estar entre 0 e 30.");
    return;
  }

  try {
    const res = await fetch(`/api/alunos/${id}/notas`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trimestre })   // <- APENAS TRIMESTRE
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao salvar nota.");

    alert("Nota do trimestre salva com sucesso!");

  } catch (err) {
    console.error("❌ Erro ao salvar notas:", err);
    alert("Erro ao atualizar nota do trimestre.");
  }
}
