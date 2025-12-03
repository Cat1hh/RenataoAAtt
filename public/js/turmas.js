const selectTurma = document.querySelector("#turma");
const tabela = document.querySelector("#tabela-horarios tbody");

// 🔹 Carregar lista de turmas do servidor
async function carregarTurmas() {
  try {
    const res = await fetch("/api/turmas");
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const turmas = await res.json();

    // Limpa e adiciona opções
    selectTurma.innerHTML = `<option value="">Selecione...</option>`;
    turmas.forEach(t => {
      const option = document.createElement("option");
      option.value = t.nome;
      option.textContent = t.nome;
      selectTurma.appendChild(option);
    });

    // Se havia uma turma salva, carrega automaticamente
    const turmaSalva = localStorage.getItem("turmaSelecionada");
    if (turmaSalva) {
      selectTurma.value = turmaSalva;
      carregarAulas(turmaSalva);
    }
  } catch (err) {
    console.error("❌ Erro ao carregar turmas:", err);
    alert(`Falha ao carregar turmas. Verifique o servidor.\nDetalhe: ${err.message}`);
  }
}

// 🔹 Ao trocar a turma
selectTurma.addEventListener("change", e => {
  const turma = e.target.value;
  if (!turma) return;
  localStorage.setItem("turmaSelecionada", turma);
  carregarAulas(turma);
});

// 🔹 Carregar aulas de uma turma
async function carregarAulas(turma) {
  tabela.innerHTML = `<tr><td colspan="4">⏳ Carregando horários de ${turma}...</td></tr>`;

  try {
    const res = await fetch(`/api/aulas/${turma}`); // ✅ rota corrigida
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const aulas = await res.json();

    if (!aulas.length) {
      tabela.innerHTML = `<tr><td colspan="4">📅 Nenhum horário encontrado para ${turma}.</td></tr>`;
      return;
    }

    atualizarTabela(aulas);
  } catch (err) {
    console.error(`❌ Erro ao carregar horários da turma ${turma}:`, err);
    tabela.innerHTML = `<tr><td colspan="4">❌ Erro ao carregar o horário da turma ${turma}.</td></tr>`;
  }
}

// 🔹 Atualizar tabela
function atualizarTabela(aulas) {
  tabela.innerHTML = "";
  aulas.forEach(aula => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${aula.dia}</td>
      <td>${aula.horario}</td>
      <td>${aula.disciplina}</td>
      <td>${aula.sala || "-"}</td>
    `;
    tabela.appendChild(tr);
  });
}

// 🔹 Voltar ao portal
function voltarPortal() {
  window.location.href = "portal.html";
}

// 🔹 Inicialização automática
window.addEventListener("DOMContentLoaded", carregarTurmas);
