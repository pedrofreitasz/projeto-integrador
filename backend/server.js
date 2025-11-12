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

app.use(express.json());

app.get('/', (req, res) => {
  res.send('olá mundo');
});

app.get('/data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bancopidosguri');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('deu erro');
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
