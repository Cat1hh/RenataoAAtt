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
    const cabecalho = linhas[0].split(",");
    const corpo = document.getElementById("corpoTabela");
    corpo.innerHTML = "";

    // Guarda todas as linhas em um array para filtro depois
    const dados = linhas.slice(1).map(l => l.split(","));

    // Cria lista única de disciplinas
    const disciplinas = [...new Set(dados.map(c => c[1].trim()))];
    const filtro = document.getElementById("filtroMateria");
    filtro.innerHTML = `<option value="">Todas as matérias</option>`;
    disciplinas.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      filtro.appendChild(opt);
    });

    // Função de exibir tabela filtrada
    function exibirTabela(materiaSelecionada = "") {
      corpo.innerHTML = "";
      dados.forEach(colunas => {
        const materia = colunas[1].trim();
        if (!materiaSelecionada || materia === materiaSelecionada) {
          const linha = document.createElement("tr");
          colunas.forEach(valor => {
            const td = document.createElement("td");
            td.textContent = valor.trim();
            linha.appendChild(td);
          });
          corpo.appendChild(linha);
        }
      });
    }

    // Mostra tudo no início
    exibirTabela();

    // Quando muda o filtro
    filtro.addEventListener("change", e => {
      exibirTabela(e.target.value);
    });

  } catch (erro) {
    console.error("Erro ao carregar CSV:", erro);
    const corpo = document.getElementById("corpoTabela");
    corpo.innerHTML = `<tr><td colspan="5">Erro ao carregar o arquivo de professores.</td></tr>`;
  }
}
