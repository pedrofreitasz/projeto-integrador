const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const result = await pool.query(
      'SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2',
      [email, senha]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha incorretos' });
    }
    res.json({ usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const checkEmail = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senha]
    );
    res.status(201).json({ usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/usuario/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email FROM usuarios WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, email FROM usuarios ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/usuarios', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const checkEmail = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      [nome, email, senha]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    if (email) {
      const checkEmail = await pool.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, id]);
      if (checkEmail.rows.length > 0) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
    }
    let query = 'UPDATE usuarios SET';
    const values = [];
    let params = [];
    if (nome) { params.push('nome = $' + (values.length + 1)); values.push(nome); }
    if (email) { params.push('email = $' + (values.length + 1)); values.push(email); }
    if (senha) { params.push('senha = $' + (values.length + 1)); values.push(senha); }
    if (params.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    query += ' ' + params.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING id, nome, email';
    values.push(id);
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/usuarios/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
