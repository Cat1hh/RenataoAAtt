// ==========================
// MODAL DO PACHEQUINHO
// ==========================
const modal = document.getElementById("modalPachequinho");
const abrirModal = document.getElementById("abrirPachequinho");
const fecharModal = document.getElementById("fecharModal");

abrirModal.addEventListener("click", () => modal.classList.remove("hidden"));
fecharModal.addEventListener("click", () => modal.classList.add("hidden"));

// ==========================
// PROFESSORES
// ==========================
const formProfessor = document.getElementById("formProfessor");
const tabelaProfessores = document.getElementById("tabelaProfessores");

function carregarProfessores() {
  const professores = JSON.parse(localStorage.getItem("professores") || "[]");
  tabelaProfessores.innerHTML = professores
    .map(
      (p) => `
    <tr class="border-b border-gray-200 hover:bg-gray-50">
      <td class="py-2 px-3">${p.nome}</td>
      <td class="py-2 px-3">${p.email}</td>
    </tr>`
    )
    .join("");
}

formProfessor.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  if (!nome || !email) return;

  const professores = JSON.parse(localStorage.getItem("professores") || "[]");
  professores.push({ nome, email });
  localStorage.setItem("professores", JSON.stringify(professores));
  formProfessor.reset();
  carregarProfessores();
});

carregarProfessores();

// ==========================
// HORÁRIOS
// ==========================
const formAula = document.getElementById("formAula");
const tabelaAulas = document.getElementById("tabelaAulas");
const hoje = new Date().toISOString().split("T")[0];
const chaveAulas = `ajustes_${hoje}`;
const turmas = ["3M1", "3M2", "3M5", "3M6"];

// ==========================
// Função: limpar ajustes antigos
// ==========================
function limparAjustesAntigos() {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("ajustes_")) {
      const data = k.replace("ajustes_", "");
      if (new Date(data) < new Date().setDate(new Date().getDate() - 7)) {
        localStorage.removeItem(k);
      }
    }
  });
}
limparAjustesAntigos();

// ==========================
// Carregar CSVs das turmas
// ==========================
async function carregarHorariosBase() {
  const horarios = {};

  for (const turma of turmas) {
    try {
      const resp = await fetch(`horarios/${turma}.csv`);
      const texto = await resp.text();
      const linhas = texto.trim().split("\n").slice(1);

      horarios[turma] = linhas.map((linha) => {
        const [dia, disciplina, horario, sala] = linha.split(",");
        return { dia, disciplina, horario, sala };
      });
    } catch (err) {
      console.warn(`Erro ao carregar ${turma}.csv:`, err);
      horarios[turma] = [];
    }
  }

  localStorage.setItem("horarios_base", JSON.stringify(horarios));
  return horarios;
}

// ==========================
// Montar tabela (base + ajustes do dia)
// ==========================
async function carregarAulas() {
  let base = JSON.parse(localStorage.getItem("horarios_base") || "{}");
  if (Object.keys(base).length === 0) base = await carregarHorariosBase();

  const ajustes = JSON.parse(localStorage.getItem(chaveAulas) || "{}");
  let html = "";

  Object.keys(base).forEach((turma) => {
    const aulasBase = base[turma] || [];
    const alteracoes = ajustes[turma] || [];

    // aplicar remoções e edições
    const listaFinal = aulasBase
      .filter(
        (a) =>
          !alteracoes.some(
            (x) => x.remover && x.horario === a.horario && x.dia === a.dia
          )
      )
      .concat(alteracoes.filter((x) => !x.remover));

    listaFinal.forEach((aula, i) => {
      html += `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
          <td class="py-2 px-3">${aula.dia}</td>
          <td class="py-2 px-3">${aula.horario}</td>
          <td class="py-2 px-3">${aula.disciplina}</td>
          <td class="py-2 px-3">${aula.sala}</td>
          <td class="py-2 px-3 font-bold text-blue-700">${turma}</td>
          <td class="py-2 px-3 text-right">
            <button onclick="editarAula('${turma}', ${i})" class="text-blue-600 hover:underline mr-2">Editar</button>
            <button onclick="removerAula('${turma}', ${i})" class="text-red-600 hover:underline">Excluir</button>
          </td>
        </tr>
      `;
    });
  });

  tabelaAulas.innerHTML =
    html ||
    "<tr><td colspan='6' class='text-center py-2'>Nenhuma aula cadastrada hoje</td></tr>";
}

// ==========================
// Adicionar/Editar Aula Manualmente
// ==========================
formAula.addEventListener("submit", (e) => {
  e.preventDefault();
  const turma = document.getElementById("turma").value;
  const dia = document.getElementById("dia").value.trim();
  const horario = document.getElementById("horario").value.trim();
  const disciplina = document.getElementById("disciplina").value.trim();
  const sala = document.getElementById("sala").value.trim();

  if (!turma || !dia || !horario || !disciplina || !sala) return;

  const ajustes = JSON.parse(localStorage.getItem(chaveAulas) || "{}");
  if (!ajustes[turma]) ajustes[turma] = [];

  ajustes[turma].push({ dia, horario, disciplina, sala });
  localStorage.setItem(chaveAulas, JSON.stringify(ajustes));

  formAula.reset();
  carregarAulas();
});

// ==========================
// Editar e Remover Aula
// ==========================
window.removerAula = (turma, index) => {
  const ajustes = JSON.parse(localStorage.getItem(chaveAulas) || "{}");
  if (!ajustes[turma]) ajustes[turma] = [];

  // marcar como removida
  const base = JSON.parse(localStorage.getItem("horarios_base") || "{}");
  const aula = base[turma][index];
  ajustes[turma].push({ ...aula, remover: true });

  localStorage.setItem(chaveAulas, JSON.stringify(ajustes));
  carregarAulas();
};

window.editarAula = (turma, index) => {
  const base = JSON.parse(localStorage.getItem("horarios_base") || "{}");
  const aula = base[turma][index];

  document.getElementById("dia").value = aula.dia;
  document.getElementById("horario").value = aula.horario;
  document.getElementById("disciplina").value = aula.disciplina;
  document.getElementById("sala").value = aula.sala;
  document.getElementById("turma").value = turma;

  // marcar a original como removida
  const ajustes = JSON.parse(localStorage.getItem(chaveAulas) || "{}");
  if (!ajustes[turma]) ajustes[turma] = [];
  ajustes[turma].push({ ...aula, remover: true });

  localStorage.setItem(chaveAulas, JSON.stringify(ajustes));
  carregarAulas();
};

// ==========================
// Inicializar
// ==========================
(async () => {
  await carregarHorariosBase();
  carregarAulas();
})();
