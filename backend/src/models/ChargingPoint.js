import { pool } from "../config/db.js";

const baseColumns = `
  id,
  nome,
  endereco,
  cidade,
  latitude,
  longitude,
  tipo_conector AS "tipoConector",
  velocidade,
  potencia,
  disponivel,
  funcionario_id AS "funcionarioId",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const ChargingPoint = {
  async create({ nome, endereco, cidade, latitude, longitude, tipoConector, velocidade, potencia, disponivel, funcionarioId }) {
    const { rows } = await pool.query(
      `
        INSERT INTO pontos_recarga (nome, endereco, cidade, latitude, longitude, tipo_conector, velocidade, potencia, disponivel, funcionario_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING ${baseColumns}
      `,
      [nome, endereco, cidade, latitude, longitude, tipoConector, velocidade, potencia, disponivel !== undefined ? disponivel : true, funcionarioId]
    );

    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT ${baseColumns} FROM pontos_recarga ORDER BY nome`
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${baseColumns} FROM pontos_recarga WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async update(id, { nome, endereco, cidade, latitude, longitude, tipoConector, velocidade, potencia, disponivel }) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramCount++}`);
      values.push(nome);
    }
    if (endereco !== undefined) {
      updates.push(`endereco = $${paramCount++}`);
      values.push(endereco);
    }
    if (cidade !== undefined) {
      updates.push(`cidade = $${paramCount++}`);
      values.push(cidade);
    }
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramCount++}`);
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramCount++}`);
      values.push(longitude);
    }
    if (tipoConector !== undefined) {
      updates.push(`tipo_conector = $${paramCount++}`);
      values.push(tipoConector);
    }
    if (velocidade !== undefined) {
      updates.push(`velocidade = $${paramCount++}`);
      values.push(velocidade);
    }
    if (potencia !== undefined) {
      updates.push(`potencia = $${paramCount++}`);
      values.push(potencia);
    }
    if (disponivel !== undefined) {
      updates.push(`disponivel = $${paramCount++}`);
      values.push(disponivel);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await pool.query(
      `
        UPDATE pontos_recarga
        SET ${updates.join(", ")}
        WHERE id = $${paramCount}
        RETURNING ${baseColumns}
      `,
      values
    );

    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM pontos_recarga WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};



