CREATE DATABASE bancopi;
\c bancopi;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recargas (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  local VARCHAR(200) NOT NULL,
  endereco VARCHAR(300) NOT NULL,
  data_hora TIMESTAMP NOT NULL,
  duracao VARCHAR(20) NOT NULL,
  energia DECIMAL(10, 2) NOT NULL,
  custo DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  cargo VARCHAR(100) NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pontos_recarga (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  endereco VARCHAR(300) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  tipo_conector VARCHAR(50) NOT NULL,
  velocidade VARCHAR(50) NOT NULL,
  potencia VARCHAR(20) NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  funcionario_id INTEGER REFERENCES funcionarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE solicitacoes_instalacao (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_instalacao VARCHAR(50) NOT NULL, 
  endereco VARCHAR(300) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2),
  cep VARCHAR(10),
  distancia_quadro DECIMAL(10, 2),
  tipo_residencia VARCHAR(50),
  tipo_carregador VARCHAR(50),
  preco_total DECIMAL(10, 2) NOT NULL,
  custo_total DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pendente',
  responsavel_id INTEGER REFERENCES funcionarios(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profissionais_instalacao (
  id SERIAL PRIMARY KEY,
  solicitacao_id INTEGER NOT NULL REFERENCES solicitacoes_instalacao(id) ON DELETE CASCADE,
  funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
  cargo VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(solicitacao_id, funcionario_id)
);
