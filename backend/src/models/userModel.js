import { pool } from "../config/db.js";

export const User = {
  findByEmail: (email) =>
    pool.query("SELECT * FROM usuarios WHERE email = $1", [email]),

  create: (nome, email, senha) =>
    pool.query(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *",
      [nome, email, senha]
    ),

  findById: (id) =>
    pool.query("SELECT id, nome, email, created_at FROM usuarios WHERE id = $1", [id])
};