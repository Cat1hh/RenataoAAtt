// =======================
// BACKEND ESCOLA - Node + Express + MySQL
// =======================
import nodemailer from "nodemailer";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// =======================
// CONFIGURAÇÃO BÁSICA
// =======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =======================
// BANCO DE DADOS
// =======================
const db = await mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // coloque a senha do MySQL se houver
  database: "renato",
  connectionLimit: 10,
});

try {
  await db.query("SELECT 1");
  console.log("✅ Conectado ao banco de dados MySQL!");
} catch (err) {
  console.error("❌ Erro ao conectar ao banco:", err);
  process.exit(1);
}

// ======================================================
// 🔹 TURMAS
// ======================================================
app.get("/api/turmas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM turmas ORDER BY nome ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar turmas:", err);
    res.status(500).json({ error: "Erro ao buscar turmas." });
  }
});

// ======================================================
// 👨‍🎓 CADASTRO DE ALUNO + ENVIO DE EMAIL
// ======================================================
app.post("/api/alunos", async (req, res) => {
  const {
    turma_id,
    nome_aluno,
    nome_responsavel,
    email_responsavel,
    telefone_responsavel,
    telefone_aluno,
    termo_aceito
  } = req.body;

  if (!turma_id || !nome_aluno || !nome_responsavel || !email_responsavel) {
    return res.status(400).json({ error: "Preencha todos os campos obrigatórios." });
  }

  try {
    // Gerar número do aluno (senha também será esse número)
    const numero_aluno = Math.floor(1000 + Math.random() * 9000);

    // ✅ Correção da ordem dos campos no INSERT
    await db.query(
      `INSERT INTO alunos 
       (turma_id, nome_aluno, nome_responsavel, email_responsavel, telefone_responsavel, telefone_aluno, termo_aceito, numero_aluno, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        turma_id,
        nome_aluno,
        nome_responsavel,
        email_responsavel,
        telefone_responsavel,
        telefone_aluno,
        termo_aceito ? 1 : 0,
        numero_aluno,
        "Aguardando"
      ]
    );

    // =====================================
    // ✉️ Enviar email automático ao responsável
    // =====================================
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // usa SSL
      auth: {
        user: "pachequinhobot@gmail.com", // seu email Gmail
        pass: "mzqwmwxmbpprvvrg", // senha de app (não a senha normal)
      },
      tls: {
        rejectUnauthorized: false, // evita erro de certificado no localhost
      },
    });

    const mailOptions = {
      from: '"Pachequinho" <pachequinhobot@gmail.com>',
      to: email_responsavel, // ✅ envia para o responsável
      subject: "Cadastro do aluno realizado com sucesso!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 16px; background-color: #f8f9fa; border-radius: 8px;">
          <h2 style="color: #2d6cdf;">📚 Olá, ${nome_aluno}!</h2>
          <p>O aluno <strong>${nome_aluno}</strong> foi cadastrado com sucesso na turma.</p>
          <p>O número do aluno é: <strong style="font-size: 18px;">${numero_aluno}</strong></p>
          <p>Guarde esse número — ele será necessário para o login do aluno.</p>
          <hr />
          <p style="font-size: 12px; color: #555;">Mensagem automática - não responda este e-mail.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`📧 Email enviado para ${email_responsavel}`);
    } catch (emailErr) {
      console.error("❌ Erro ao enviar email:", emailErr);
    }

    res.json({
      message: "Aluno cadastrado com sucesso! Email enviado ao responsável.",
      numero_aluno,
    });
  } catch (err) {
    console.error("Erro ao cadastrar aluno:", err);
    res.status(500).json({ error: "Erro ao cadastrar aluno." });
  }
});

// ======================================================
// 🔹 AULAS (HORÁRIOS)
// ======================================================
app.post("/api/horarios", async (req, res) => {
  const { dia, horario, disciplina, sala, turma_id } = req.body;

  if (!dia || !horario || !disciplina || !turma_id) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  try {
    await db.query(
      "INSERT INTO aulas (dia, horario, disciplina, sala, turma_id) VALUES (?, ?, ?, ?, ?)",
      [dia, horario, disciplina, sala || null, turma_id]
    );
    res.json({ message: "Aula adicionada com sucesso!" });
  } catch (err) {
    console.error("Erro ao adicionar aula:", err);
    res.status(500).json({ error: "Erro ao adicionar aula." });
  }
});

app.get("/api/horarios", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT aulas.*, turmas.nome AS turma_nome
      FROM aulas
      JOIN turmas ON aulas.turma_id = turmas.id
      ORDER BY FIELD(dia, 'Segunda','Terça','Quarta','Quinta','Sexta'), horario
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar aulas:", err);
    res.status(500).json({ error: "Erro ao buscar aulas." });
  }
});

app.delete("/api/horarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM aulas WHERE id = ?", [id]);
    res.json({ message: "Aula removida com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir aula:", err);
    res.status(500).json({ error: "Erro ao excluir aula." });
  }
});

// ======================================================
// 👨‍🎓 LOGIN DO ALUNO (nome + número do aluno)
// ======================================================
app.post("/api/loginAluno", async (req, res) => {
  const { nome_completo, numero_aluno } = req.body;

  if (!nome_completo || !numero_aluno) {
    return res.status(400).json({ error: "Nome completo e número do aluno são obrigatórios." });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM alunos WHERE nome_aluno = ? AND numero_aluno = ?",
      [nome_completo, numero_aluno]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Nome ou número incorreto." });
    }

    const aluno = rows[0];
    res.json({
      id: aluno.id,
      nome_aluno: aluno.nome_aluno,
      turma_id: aluno.turma_id,
      email_responsavel: aluno.email_responsavel,
      telefone_responsavel: aluno.telefone_responsavel,
      status: aluno.status
    });
  } catch (err) {
    console.error("Erro no login do aluno:", err);
    res.status(500).json({ error: "Erro no login do aluno." });
  }
});

// ======================================================
// 👩‍🏫 PROFESSORES
// ======================================================
app.post("/api/professores", async (req, res) => {
  const { nome, email, senha, disciplina } = req.body;

  if (!nome || !email || !senha || !disciplina) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  try {
    const [exists] = await db.query("SELECT id FROM professores WHERE email = ?", [email]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.query(
      "INSERT INTO professores (nome, email, senha, disciplina) VALUES (?, ?, ?, ?)",
      [nome, email, senhaHash, disciplina]
    );

    res.json({ message: "Professor adicionado com sucesso!" });
  } catch (err) {
    console.error("Erro ao adicionar professor:", err);
    res.status(500).json({ error: "Erro ao adicionar professor." });
  }
});

app.get("/api/professores", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, nome, email, disciplina FROM professores ORDER BY nome ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar professores:", err);
    res.status(500).json({ error: "Erro ao buscar professores." });
  }
});

// ======================================================
// 👩‍🏫 LOGIN PROFESSOR
// ======================================================
app.post("/api/loginProfessor", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM professores WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Professor não encontrado." });
    }

    const professor = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, professor.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    res.json({
      id: professor.id,
      nome: professor.nome,
      disciplina: professor.disciplina,
      email: professor.email,
    });
  } catch (err) {
    console.error("Erro no login do professor:", err);
    res.status(500).json({ error: "Erro no login do professor." });
  }
});

// ======================================================
// 🔍 ALUNOS POR DISCIPLINA
// ======================================================
app.get("/api/alunosPorDisciplina", async (req, res) => {
  const { disciplina } = req.query;
  if (!disciplina) {
    return res.status(400).json({ error: "Disciplina não informada." });
  }

  try {
    const [rows] = await db.query(`
      SELECT DISTINCT a.*, t.nome AS turma_nome
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
      JOIN aulas au ON au.turma_id = t.id
      WHERE au.disciplina = ?
      ORDER BY turma_nome, nome_aluno
    `, [disciplina]);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar alunos por disciplina:", err);
    res.status(500).json({ error: "Erro ao buscar alunos da disciplina." });
  }
});

// ======================================================
// 👨‍💼 ADMIN LOGIN
// ======================================================
app.post("/api/loginAdmin", (req, res) => {
  const { email, senha } = req.body;

  const admin = {
    email: "admin@escola.com",
    senha: "1234",
    nome: "Administrador",
  };

  if (email === admin.email && senha === admin.senha) {
    res.json({ nome: admin.nome });
  } else {
    res.status(401).json({ error: "E-mail ou senha incorretos." });
  }
});

// ======================================================
// 👩‍🏫 PROFESSOR - ADICIONAR NOTA E GERAR RECUPERAÇÃO
// ======================================================
app.post("/api/professor/adicionarNota", async (req, res) => {
  const { aluno_id, disciplina, nota } = req.body;

  if (!aluno_id || !disciplina || nota === undefined) {
    return res.status(400).json({ error: "Dados incompletos." });
  }

  try {
    await db.query("UPDATE alunos SET nota = ?, status = ? WHERE id = ?", [
      nota,
      nota < 6 ? "Recuperação" : "Aprovado",
      aluno_id,
    ]);

    if (nota < 6) {
      await db.query(
        "INSERT INTO recuperacoes (aluno_id, disciplina, nota) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nota = VALUES(nota)",
        [aluno_id, disciplina, nota]
      );
    } else {
      await db.query("DELETE FROM recuperacoes WHERE aluno_id = ? AND disciplina = ?", [
        aluno_id,
        disciplina,
      ]);
    }

    res.json({ message: "Nota registrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar nota:", err);
    res.status(500).json({ error: "Erro ao registrar nota." });
  }
});

// ======================================================
// 👨‍💼 ADMIN - LISTAR ALUNOS EM RECUPERAÇÃO
// ======================================================
app.get("/api/recuperacoes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.id, a.nome_aluno, t.nome AS turma_nome, r.disciplina, r.nota, r.data_registro
      FROM recuperacoes r
      JOIN alunos a ON r.aluno_id = a.id
      JOIN turmas t ON a.turma_id = t.id
      ORDER BY t.nome, a.nome_aluno
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar recuperações:", err);
    res.status(500).json({ error: "Erro ao buscar recuperações." });
  }
});

// ======================================================
// 🔹 LISTAR ALUNOS
// ======================================================
app.get("/api/alunos", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, t.nome AS turma_nome
      FROM alunos a
      JOIN turmas t ON a.turma_id = t.id
      ORDER BY t.nome, a.nome_aluno
    `);
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar alunos:", err);
    res.status(500).json({ error: "Erro ao buscar alunos." });
  }
});

// ======================================================
// 🗑️ EXCLUIR ALUNO
// ======================================================
app.delete("/api/alunos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM alunos WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Aluno não encontrado." });
    }
    res.json({ message: "Aluno excluído com sucesso!" });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(500).json({ error: "Erro ao excluir aluno." });
  }
});

// ======================================================
// FRONTEND DEFAULT
// ======================================================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ======================================================
// INICIAR SERVIDOR
// ======================================================
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
