CREATE DATABASE bancopidosguri;
\c bancopidosguri;

CREATE TABLE etc (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100)
);

INSERT INTO etc (nome) VALUES ('Pedro'), ('Luan'), ('Maria');

-- Tabela de usuários
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir alguns usuários de exemplo (senha: 123456)
INSERT INTO usuarios (nome, email, senha) VALUES
('Pedro Silva', 'pedro@email.com', '123456'),
('Maria Santos', 'maria@email.com', '123456'),
('João Oliveira', 'joao@email.com', '123456');
