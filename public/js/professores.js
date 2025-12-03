window.addEventListener("load", () => {
  document.body.classList.add("loaded");
  carregarCSV();
});

async function carregarCSV() {
  try {
    const resposta = await fetch("horarios/professores.csv");
    if (!resposta.ok) throw new Error("Arquivo não encontrado.");
    const texto = await resposta.text();

    const linhas = texto.split("\n").map(l => l.trim()).filter(l => l);
    const corpo = document.getElementById("corpoTabela");
    corpo.innerHTML = "";

    // Processa CSV
    const dados = linhas.slice(1).map(l => l.split(",").map(x => x.trim()));

    // === 🔹 Descobre o dia a mostrar ===
    const diasSemana = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
    const agora = new Date();
    let diaIndex = agora.getDay(); // 0 = Domingo, 6 = Sábado

    // Se já passou das 13:00, pula para o próximo dia útil
    if (agora.getHours() >= 13) diaIndex++;

    // Se for sábado ou domingo, pula para segunda
    if (diaIndex >= 6) diaIndex = 1;

    const diaAtual = diasSemana[diaIndex];

    // === 🔹 Prepara o seletor de matérias ===
    const disciplinasHoje = [...new Set(
      dados.filter(l => l[0] === diaAtual).map(l => l[1])
    )];

    const filtro = document.getElementById("filtroMateria");
    filtro.innerHTML = `<option value="">Todas as matérias (${diaAtual})</option>`;
    disciplinasHoje.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      filtro.appendChild(opt);
    });

    // === 🔹 Exibe a tabela filtrada ===
    function exibirTabela(materiaSelecionada = "") {
      corpo.innerHTML = "";
      const aulasDoDia = dados.filter(l => l[0] === diaAtual);

      if (aulasDoDia.length === 0) {
        corpo.innerHTML = `<tr><td colspan="5">Sem aulas neste dia (${diaAtual}).</td></tr>`;
        return;
      }

      aulasDoDia.forEach(colunas => {
        const materia = colunas[1];
        if (!materiaSelecionada || materia === materiaSelecionada) {
          const linha = document.createElement("tr");
          colunas.forEach(valor => {
            const td = document.createElement("td");
            td.textContent = valor;
            linha.appendChild(td);
          });
          corpo.appendChild(linha);
        }
      });
    }

    // Mostra apenas o dia (ou próximo dia) ao carregar
    exibirTabela();

    // Atualiza ao mudar o filtro
    filtro.addEventListener("change", e => {
      exibirTabela(e.target.value);
    });

  } catch (erro) {
    console.error("Erro ao carregar CSV:", erro);
    const corpo = document.getElementById("corpoTabela");
    corpo.innerHTML = `<tr><td colspan="5">Erro ao carregar o arquivo de professores.</td></tr>`;
  }
}
