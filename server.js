const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Middleware para ler JSON
app.use(express.json());

// Config do banco (use as mesmas do docker-compose)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost', // nome do serviço do banco no docker-compose
  database: 'postgres',
  password: 'NovaSenha',
  port: 5432,
});

// GET ALL - Buscar todos os usuários
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// GET BY ID - Buscar usuário por ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// POST - Criar novo usuário
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// PUT - Atualizar usuário por ID
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// DELETE - Remover usuário por ID
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Health check
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.send(`PostgreSQL conectado com sucesso! Hora atual: ${result.rows[0].now}`);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
