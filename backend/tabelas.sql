CREATE DATABASE bancopidosguri;
\c bancopidosguri;

CREATE TABLE etc (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100)
);

INSERT INTO etc (nome) VALUES ('Pedro'), ('Luan'), ('Maria');