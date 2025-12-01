import { pool } from "../config/db.js";

const baseColumns = `
  id,
  nome AS "name",
  cpf,
  email,
  senha AS "password",
  cargo AS "position",
  imagem_url AS "imagemUrl",
  created_at AS "createdAt"
`;

export const Employee = {
  async create({ name, cpf, email, password, position }) {
    const { rows } = await pool.query(
      `
        INSERT INTO funcionarios (nome, cpf, email, senha, cargo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, nome AS "name", cpf, email, cargo AS "position", imagem_url AS "imagemUrl", created_at AS "createdAt"
      `,
      [name, cpf, email, password, position]
    );

    return rows[0];
  },

  async findByCpf(cpf) {
    const { rows } = await pool.query(
      `
        SELECT ${baseColumns}
        FROM funcionarios
        WHERE cpf = $1
      `,
      [cpf]
    );

    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await pool.query(
      `
        SELECT ${baseColumns}
        FROM funcionarios
        WHERE LOWER(email) = LOWER($1)
      `,
      [email]
    );

    return rows[0];
  },

  async findById(id) {
    const { rows } = await pool.query(
      `
        SELECT id, nome AS "name", cpf, email, cargo AS "position", imagem_url AS "imagemUrl", created_at AS "createdAt"
        FROM funcionarios
        WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  },

  async update(id, { name, email, password, position, imagemUrl }) {
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
    if (position !== undefined) {
      updates.push(`cargo = $${paramCount++}`);
      values.push(position);
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
        UPDATE funcionarios
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING id, nome AS "name", cpf, email, cargo AS "position", imagem_url AS "imagemUrl", created_at AS "createdAt"
      `,
      values
    );

    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT id, nome AS "name", cpf, email, cargo AS "position", imagem_url AS "imagemUrl", created_at AS "createdAt" FROM funcionarios ORDER BY nome`
    );
    return rows;
  },

  async findByPosition(position) {
    const { rows } = await pool.query(
      `SELECT id, nome AS "name", cpf, email, cargo AS "position", imagem_url AS "imagemUrl", created_at AS "createdAt" FROM funcionarios WHERE cargo = $1 ORDER BY nome`,
      [position]
    );
    return rows;
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM funcionarios WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

