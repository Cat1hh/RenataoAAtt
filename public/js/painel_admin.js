// ==========================
// MODAL DO PACHEQUINHO
// ==========================
const modal = document.getElementById("modalPachequinho");
const abrirModal = document.getElementById("abrirPachequinho");
const fecharModal = document.getElementById("fecharModal");

abrirModal.addEventListener("click", () => modal.classList.remove("hidden"));
fecharModal.addEventListener("click", () => modal.classList.add("hidden"));


// ===============================
// PAINEL ADMIN - Conexão com API
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  carregarTurmas();
  carregarProfessores();
  carregarAulas();
  carregarTurmasAlunos();
  carregarAlunos();

  document.getElementById("formProfessor").addEventListener("submit", adicionarProfessor);
  document.getElementById("formAula").addEventListener("submit", adicionarAula);
  document.getElementById("formAluno").addEventListener("submit", adicionarAluno);

  // Modal do Pachequinho
  const abrir = document.getElementById("abrirPachequinho");
  const fechar = document.getElementById("fecharModal");
  if (abrir && fechar) {
    abrir.addEventListener("click", () => {
      document.getElementById("modalPachequinho").classList.remove("hidden");
    });
    fechar.addEventListener("click", () => {
      document.getElementById("modalPachequinho").classList.add("hidden");
    });
  }
});

// ===============================
// 🔹 Carregar Turmas
// ===============================
async function carregarTurmas() {
  try {
    const res = await fetch("/api/turmas");
    if (!res.ok) throw new Error("Erro ao buscar turmas");
    const turmas = await res.json();

    const selectTurma = document.getElementById("turma");
    const filtroTurma = document.getElementById("filtroTurma");

    if (selectTurma) {
      selectTurma.innerHTML = '<option value="">Selecione a turma</option>';
      turmas.forEach(t => {
        selectTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
      });
    }

    if (filtroTurma) {
      filtroTurma.innerHTML = '<option value="">Filtrar por turma</option>';
      turmas.forEach(t => {
        filtroTurma.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
      });
      filtroTurma.addEventListener("change", carregarAulas);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar turmas do servidor.");
  }
}

// ===============================
// 👩‍🏫 Carregar Professores
// ===============================
async function carregarProfessores() {
  try {
    const res = await fetch("/api/professores");
    if (!res.ok) throw new Error("Erro ao buscar professores");
    const professores = await res.json();

    const tbody = document.getElementById("tabelaProfessores");
    if (!tbody) return;
    tbody.innerHTML = "";

    professores.forEach(p => {
      tbody.innerHTML += `
        <tr>
          <td class="border-b py-2 px-3">${p.nome}</td>
          <td class="border-b py-2 px-3">${p.email}</td>
          <td class="border-b py-2 px-3">${p.disciplina || "-"}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar professores.");
  }
}

// ===============================
// ➕ Adicionar Professor
// ===============================
async function adicionarProfessor(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const disciplina = document.getElementById("disciplinaProfessor").value.trim();
  const senha = "1234"; // senha padrão, se quiser

  if (!nome || !email || !disciplina) {
    alert("Preencha todos os campos.");
    return;
  }

  try {
    const res = await fetch("/api/professores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, disciplina, senha }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao adicionar professor");
    }

    alert("Professor adicionado com sucesso!");
    e.target.reset();
    carregarProfessores();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// ===============================
// 📚 Carregar Aulas
// ===============================
async function carregarAulas() {
  const filtroTurma = document.getElementById("filtroTurma")?.value;

  try {
    const url = filtroTurma ? `/api/horarios/${filtroTurma}` : "/api/horarios";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar aulas");

    const aulas = await res.json();
    const tbody = document.getElementById("tabelaAulas");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (!aulas.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-3">Nenhuma aula cadastrada.</td></tr>`;
      return;
    }

    aulas.forEach(aula => {
      tbody.innerHTML += `
        <tr>
          <td class="border-b py-2 px-3">${aula.dia}</td>
          <td class="border-b py-2 px-3">${aula.horario}</td>
          <td class="border-b py-2 px-3">${aula.disciplina}</td>
          <td class="border-b py-2 px-3">${aula.sala || "-"}</td>
          <td class="border-b py-2 px-3">${aula.turma_nome || aula.turma_id}</td>
          <td class="border-b py-2 px-3">${aula.status || "Ativo"}</td>
          <td class="border-b py-2 px-3 text-right">
            <button onclick="removerAula(${aula.id})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Excluir</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar aulas do servidor.");
  }
}

// ===============================
// ➕ Adicionar Aula
// ===============================
async function adicionarAula(e) {
  e.preventDefault();

  const dia = document.getElementById("dia").value.trim();
  const horario = document.getElementById("horario").value.trim();
  const disciplina = document.getElementById("disciplina").value.trim();
  const sala = document.getElementById("sala").value.trim();
  const turma_id = document.getElementById("turma").value;

  if (!dia || !horario || !disciplina || !turma_id)
    return alert("Preencha todos os campos obrigatórios!");

  try {
    const res = await fetch("/api/horarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dia, horario, disciplina, sala, turma_id }),
    });

    if (!res.ok) throw new Error("Erro ao adicionar aula");
    alert("Aula adicionada com sucesso!");
    e.target.reset();
    carregarAulas();
  } catch (err) {
    console.error(err);
    alert("Falha ao adicionar aula.");
  }
}

// ===============================
// ❌ Remover Aula
// ===============================
async function removerAula(id) {
  if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
  try {
    const res = await fetch(`/api/horarios/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir aula");

    alert("Aula removida com sucesso!");
    carregarAulas();
  } catch (err) {
    console.error(err);
    alert("Falha ao remover aula.");
  }
}

// ===============================
// 👨‍🎓 ALUNOS
// ===============================
async function carregarTurmasAlunos() {
  try {
    const res = await fetch("/api/turmas");
    const turmas = await res.json();
    const select = document.getElementById("turmaAluno");
    if (!select) return;
    select.innerHTML = '<option value="">Selecione a turma</option>';
    turmas.forEach(t => {
      select.innerHTML += `<option value="${t.id}">${t.nome}</option>`;
    });
  } catch (err) {
    alert("Erro ao carregar turmas dos alunos.");
  }
}

async function carregarAlunos() {
  try {
    const res = await fetch("/api/alunos");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const alunos = await res.json();

    const tbody = document.getElementById("tabelaAlunos");
    if (!tbody) return;
    tbody.innerHTML = "";

    alunos.forEach(a => {
      tbody.innerHTML += `
        <tr class="border-b">
          <td class="py-2 px-3">${a.turma_nome}</td>
          <td class="py-2 px-3">${a.numero_aluno || "-"}</td>
          <td class="py-2 px-3">${a.nome_aluno}</td>
          <td class="py-2 px-3">${a.nome_responsavel}</td>
          <td class="py-2 px-3">${a.email_responsavel}</td>
          <td class="py-2 px-3">${a.telefone_responsavel || "-"}</td>
          <td class="py-2 px-3">${a.status || "Aguardando"}</td>
          <td class="py-2 px-3 text-right">
            <button onclick="removerAluno(${a.id})" class="text-red-600 hover:underline">Excluir</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error("Erro ao carregar alunos:", err);
    alert("Erro ao carregar alunos do servidor.");
  }
}

async function carregarAlunos() {
  try {
    const res = await fetch("/api/alunos");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const alunos = await res.json();

    const tbody = document.getElementById("tabelaAlunos");
    if (!tbody) return;
    tbody.innerHTML = "";

    alunos.forEach(a => {
      tbody.innerHTML += `
        <tr class="border-b">
          <td class="py-2 px-3">${a.turma_nome}</td>
          <td class="py-2 px-3">${a.nome_aluno}</td>
          <td class="py-2 px-3">${a.nome_responsavel}</td>
          <td class="py-2 px-3">${a.email_responsavel}</td>
          <td class="py-2 px-3">${a.telefone_responsavel || "-"}</td>
          <td class="py-2 px-3">${a.status || "Aguardando"}</td>
          <td class="py-2 px-3 text-right">
            <button onclick="removerAluno(${a.id})" class="text-red-600 hover:underline">Excluir</button>
          </td>
        </tr>`;
    });
  } catch (err) {
    console.error("Erro ao carregar alunos:", err);
    alert("Erro ao carregar alunos do servidor.");
  }
}

async function removerAluno(id) {
  if (!confirm("Deseja realmente excluir este aluno?")) return;
  try {
    const res = await fetch(`/api/alunos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao excluir aluno");
    alert("Aluno removido com sucesso!");
    carregarAlunos();
  } catch (err) {
    alert("Erro ao excluir aluno.");
  }
}
