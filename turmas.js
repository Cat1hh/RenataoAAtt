function voltarPortal() {
  window.location.href = "portal.html";
}

document.querySelector("#turma").addEventListener("change", (e) => {
  carregarHorarios(e.target.value);
});

async function carregarHorarios(turma) {
  const tabela = document.querySelector("#tabela-horarios tbody");
  if (!turma) return;
  
  tabela.innerHTML = `<tr><td colspan="4">Carregando horários de ${turma}...</td></tr>`;

  try {
    const resposta = await fetch(`horarios/${turma}.csv`);
    if (!resposta.ok) throw new Error("Arquivo não encontrado");
    
    const texto = await resposta.text();
    const linhas = texto.trim().split("\n").slice(1); // Ignora cabeçalho

    const aulas = linhas.map(linha => {
      const [dia, horario, disciplina, sala] = linha.split(",");
      return { dia, horario, disciplina, sala };
    });

    atualizarTabela(aulas);
    // Atualiza o destaque de hora a cada minuto
    setInterval(() => atualizarTabela(aulas), 60 * 1000);

  } catch (erro) {
    tabela.innerHTML = `<tr><td colspan="4">❌ Erro ao carregar o horário da turma ${turma}.</td></tr>`;
  }
}

function atualizarTabela(aulas) {
  const tabela = document.querySelector("#tabela-horarios tbody");
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const hoje = diasSemana[new Date().getDay()];

  const aulasHoje = aulas.filter(a => a.dia.toLowerCase() === hoje.toLowerCase());

  if (aulasHoje.length === 0) {
    tabela.innerHTML = `<tr><td colspan="4">Hoje (${hoje}) não há aulas.</td></tr>`;
    return;
  }

  tabela.innerHTML = "";
  const agora = new Date();
  const horaAtual = agora.getHours();
  const minutoAtual = agora.getMinutes();
  const minutosTotais = horaAtual * 60 + minutoAtual;

  aulasHoje.forEach(aula => {
    const [inicio, fim] = aula.horario.split(" - ");
    const [h1, m1] = inicio.split(":").map(Number);
    const [h2, m2] = fim.split(":").map(Number);
    const inicioMin = h1 * 60 + m1;
    const fimMin = h2 * 60 + m2;

    // Verifica se está dentro do horário atual
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
