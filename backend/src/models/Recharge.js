import { pool } from "../config/db.js";

export const Recharge = {
  async create({ userId, local, endereco, dataHora, duracao, energia, custo }) {
    const { rows } = await pool.query(
      `
        INSERT INTO recargas (usuario_id, local, endereco, data_hora, duracao, energia, custo)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
          id,
          usuario_id AS "userId",
          local,
          endereco,
          data_hora AS "dataHora",
          duracao,
          energia,
          custo,
          created_at AS "createdAt"
      `,
      [userId, local, endereco, dataHora, duracao, energia, custo]
    );

    return rows[0];
  },

  async findByUserId(userId, limit = 50, offset = 0, startDate = null) {
    let query = `
      SELECT 
        id,
        usuario_id AS "userId",
        local,
        endereco,
        data_hora AS "dataHora",
        duracao,
        energia,
        custo,
        created_at AS "createdAt"
      FROM recargas
      WHERE usuario_id = $1
    `;
    
    const params = [userId];
    
    if (startDate) {
      query += ` AND data_hora >= $${params.length + 1}`;
      params.push(startDate);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async countByUserId(userId, startDate = null) {
    let query = `SELECT COUNT(*) as total FROM recargas WHERE usuario_id = $1`;
    const params = [userId];
    
    if (startDate) {
      query += ` AND data_hora >= $2`;
      params.push(startDate);
    }
    
    const { rows } = await pool.query(query, params);
    return parseInt(rows[0].total);
  },

  async findById(id, userId) {
    const { rows } = await pool.query(
      `
        SELECT 
          id,
          usuario_id AS "userId",
          local,
          endereco,
          data_hora AS "dataHora",
          duracao,
          energia,
          custo,
          created_at AS "createdAt"
        FROM recargas
        WHERE id = $1 AND usuario_id = $2
      `,
      [id, userId]
    );

    return rows[0];
  },

  async delete(id, userId) {
    const { rows } = await pool.query(
      `DELETE FROM recargas WHERE id = $1 AND usuario_id = $2 RETURNING id`,
      [id, userId]
    );

    return rows[0];
  }
};

