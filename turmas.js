function voltarPortal() {
  window.location.href = "portal.html";
}

const selectTurma = document.querySelector("#turma");
const tabela = document.querySelector("#tabela-horarios tbody");
let intervaloAtualizacao = null;

// ==== Quando o usuário muda de turma ====
selectTurma.addEventListener("change", (e) => {
  const turma = e.target.value;
  if (!turma) return;

  // Salva no localStorage
  localStorage.setItem("turmaSelecionada", turma);
  carregarHorarios(turma);
});

// ==== Quando a página carrega ====
window.addEventListener("DOMContentLoaded", () => {
  const turmaSalva = localStorage.getItem("turmaSelecionada");
  if (turmaSalva) {
    selectTurma.value = turmaSalva;
    carregarHorarios(turmaSalva);
  }
});

async function carregarHorarios(turma) {
  tabela.innerHTML = `<tr><td colspan="4">Carregando horários de ${turma}...</td></tr>`;

  try {
    const resposta = await fetch(`horarios/${turma}.csv`);
    if (!resposta.ok) throw new Error("Arquivo não encontrado");

    const texto = await resposta.text();
    const linhas = texto.trim().split("\n").slice(1); // Ignora cabeçalho

    const aulas = linhas.map(linha => {
      const [dia, horario, disciplina, sala] = linha.split(",").map(v => v.trim());
      return { dia, horario, disciplina, sala };
    });

    atualizarTabela(aulas);

    // Evita múltiplos intervalos duplicados
    if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = setInterval(() => atualizarTabela(aulas), 60 * 1000);

  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="4">❌ Erro ao carregar o horário da turma ${turma}.</td></tr>`;
  }
}

function atualizarTabela(aulas) {
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const hoje = diasSemana[new Date().getDay()];

  const aulasHoje = aulas.filter(a => a.dia.toLowerCase() === hoje.toLowerCase());

  if (aulasHoje.length === 0) {
    tabela.innerHTML = `<tr><td colspan="4">Hoje (${hoje}) não há aulas.</td></tr>`;
    return;
  }

  tabela.innerHTML = "";
  const agora = new Date();
  const minutosTotais = agora.getHours() * 60 + agora.getMinutes();

  aulasHoje.forEach(aula => {
    const [inicio, fim] = aula.horario.split(" - ");
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    const inicioMin = h1 * 60 + m1;
    const fimMin = h2 * 60 + m2;

    const emAndamento = minutosTotais >= inicioMin && minutosTotais < fimMin;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${aula.dia}</td>
      <td>${aula.horario}</td>
      <td>${aula.disciplina}</td>
      <td>${aula.sala || "-"}</td>
    `;
    if (emAndamento) tr.classList.add("aula-atual");
    tabela.appendChild(tr);
  });
}
// ===== ANIMAÇÃO DE ENTRADA =====
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ===== TRANSIÇÃO AO SAIR =====
function voltarPortal() {
  document.body.classList.remove("loaded");
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = "portal.html";
  }, 600);
}
