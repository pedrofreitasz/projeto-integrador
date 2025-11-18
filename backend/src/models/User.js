import { pool } from "../config/db.js";

const baseColumns = `
  id,
  nome AS "name",
  email,
  senha AS "password",
  created_at AS "createdAt"
`;

export const User = {
  async create({ name, email, password }) {
    const { rows } = await pool.query(
      `
        INSERT INTO usuarios (nome, email, senha)
        VALUES ($1, $2, $3)
        RETURNING id, nome AS "name", email, created_at AS "createdAt"
      `,
      [name, email, password]
    );

    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      `
        SELECT ${baseColumns}
        FROM usuarios
        WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `
        SELECT id, nome AS "name", email, created_at AS "createdAt"
        FROM usuarios
        WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  }
};

