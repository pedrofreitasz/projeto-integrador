import { pool } from "../config/db.js";

const baseColumns = `
  id,
  nome AS "name",
  email,
  senha AS "password",
  imagem_url AS "imagemUrl",
  created_at AS "createdAt"
`;

export const User = {
  async create({ name, email, password }) {
    const { rows } = await pool.query(
      `
        INSERT INTO usuarios (nome, email, senha)
        VALUES ($1, $2, $3)
        RETURNING id, nome AS "name", email, imagem_url AS "imagemUrl", created_at AS "createdAt"
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
        SELECT id, nome AS "name", email, imagem_url AS "imagemUrl", created_at AS "createdAt"
        FROM usuarios
        WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  },

  async update(id, { name, email, password, imagemUrl }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`nome = $${paramCount++}`);
      values.push(name);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (password !== undefined) {
      updates.push(`senha = $${paramCount++}`);
      values.push(password);
    }
    if (imagemUrl !== undefined) {
      updates.push(`imagem_url = $${paramCount++}`);
      values.push(imagemUrl);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await pool.query(
      `
        UPDATE usuarios
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING id, nome AS "name", email, imagem_url AS "imagemUrl", created_at AS "createdAt"
      `,
      values
    );

    return rows[0];
  }
};

