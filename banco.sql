CREATE DATABASE IF NOT EXISTS renato 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_general_ci;
USE renato;

-- ===========================================
-- LIMPAR TABELAS EM ORDEM CORRETA
-- ===========================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS recuperacoes;
DROP TABLE IF EXISTS aulas;
DROP TABLE IF EXISTS alunos;
DROP TABLE IF EXISTS professores;
DROP TABLE IF EXISTS turmas;
DROP TABLE IF EXISTS admin;
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================
-- TABELA TURMAS
-- ===========================================
CREATE TABLE turmas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO turmas (nome) VALUES
('1M1'), ('1M2'), ('1M3'), ('1M4'),
('2M1'), ('2M2'), ('2M3'), ('2M4'), ('2M5'),
('3M1'), ('3M2'), ('3M3'), ('3M4'), ('3M5'), ('3M6');

-- ===========================================
-- TABELA PROFESSORES
-- ===========================================
CREATE TABLE professores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  turma_id INT NULL,
  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE SET NULL
);

-- ===========================================
-- TABELA ADMIN
-- ===========================================
CREATE TABLE admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL
);

-- ===========================================
-- TABELA ALUNOS
-- ===========================================
CREATE TABLE alunos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  turma_id INT NOT NULL,
  nome_aluno VARCHAR(100) NOT NULL,
  nome_responsavel VARCHAR(100) NOT NULL,
  email_responsavel VARCHAR(100) NOT NULL,
  email_aluno VARCHAR(100) NOT NULL,
  telefone_responsavel VARCHAR(20),
  telefone_aluno VARCHAR(20),
  termo_aceito TINYINT(1) DEFAULT 0,
  numero_aluno INT UNIQUE,
  senha VARCHAR(255),

  -- SISTEMA DE NOTAS
  trimestre DECIMAL(4,2),    -- nota de 0 a 30
  nota_final DECIMAL(4,2),   -- opcional

  status ENUM('Aprovado','Recuperação') DEFAULT 'Aprovado',

  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);

-- ===========================================
-- TABELA DE AULAS
-- ===========================================
CREATE TABLE aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  turma_id INT NOT NULL,
  dia ENUM('Segunda','Terça','Quarta','Quinta','Sexta') NOT NULL,
  horario VARCHAR(30) NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  sala VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Ativo',
  FOREIGN KEY (turma_id) REFERENCES turmas(id) ON DELETE CASCADE
);

-- ===========================================
-- TABELA DE RECUPERAÇÕES
-- ===========================================
CREATE TABLE recuperacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  aluno_id INT NOT NULL,
  disciplina VARCHAR(100) NOT NULL,
  nota DECIMAL(5,2) NOT NULL,
  data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);


