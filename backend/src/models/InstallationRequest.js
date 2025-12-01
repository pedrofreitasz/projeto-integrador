import { pool } from "../config/db.js";

const baseColumns = `
  id,
  usuario_id AS "usuarioId",
  tipo_instalacao AS "tipoInstalacao",
  endereco,
  cidade,
  estado,
  cep,
  distancia_quadro AS "distanciaQuadro",
  tipo_residencia AS "tipoResidencia",
  tipo_carregador AS "tipoCarregador",
  preco_total AS "precoTotal",
  custo_total AS "custoTotal",
  status,
  responsavel_id AS "responsavelId",
  latitude,
  longitude,
  observacoes,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const InstallationRequest = {
  async create(data) {
    const {
      usuarioId,
      tipoInstalacao,
      endereco,
      cidade,
      estado,
      cep,
      distanciaQuadro,
      tipoResidencia,
      tipoCarregador,
      precoTotal,
      custoTotal,
      latitude,
      longitude,
      observacoes
    } = data;

    const { rows } = await pool.query(
      `
        INSERT INTO solicitacoes_instalacao (
          usuario_id, tipo_instalacao, endereco, cidade, estado, cep,
          distancia_quadro, tipo_residencia, tipo_carregador, preco_total,
          custo_total, latitude, longitude, observacoes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING ${baseColumns}
      `,
      [
        usuarioId, tipoInstalacao, endereco, cidade, estado, cep,
        distanciaQuadro, tipoResidencia, tipoCarregador, precoTotal,
        custoTotal, latitude, longitude, observacoes
      ]
    );

    return rows[0];
  },

  async findAll(filters = {}) {
    let query = `SELECT ${baseColumns} FROM solicitacoes_instalacao WHERE 1=1`;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND status = $${paramCount++}`;
      values.push(filters.status);
    }

    if (filters.responsavelId) {
      query += ` AND responsavel_id = $${paramCount++}`;
      values.push(filters.responsavelId);
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, values);
    return rows;
  },

  async findForInstalador(instaladorId) {
    const { rows } = await pool.query(
      `
        SELECT ${baseColumns} 
        FROM solicitacoes_instalacao 
        WHERE (status = 'pendente' AND responsavel_id IS NULL)
           OR responsavel_id = $1
        ORDER BY created_at DESC
      `,
      [instaladorId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      `SELECT ${baseColumns} FROM solicitacoes_instalacao WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  async update(id, updates) {
    const fieldMap = {
      status: 'status',
      responsavelId: 'responsavel_id'
    };

    const updateFields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = fieldMap[key] || key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbKey} = $${paramCount++}`);
        values.push(value);
      }
    });

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const { rows } = await pool.query(
      `
        UPDATE solicitacoes_instalacao
        SET ${updateFields.join(", ")}
        WHERE id = $${paramCount}
        RETURNING ${baseColumns}
      `,
      values
    );

    return rows[0];
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM solicitacoes_instalacao WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

