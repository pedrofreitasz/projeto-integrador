import { pool } from "../config/db.js";

export const InstallationProfessional = {
  async create({ solicitacaoId, funcionarioId, cargo }) {
    const { rows } = await pool.query(
      `
        INSERT INTO profissionais_instalacao (solicitacao_id, funcionario_id, cargo)
        VALUES ($1, $2, $3)
        RETURNING id, solicitacao_id AS "solicitacaoId", funcionario_id AS "funcionarioId", cargo, created_at AS "createdAt"
      `,
      [solicitacaoId, funcionarioId, cargo]
    );

    return rows[0];
  },

  async findBySolicitacao(solicitacaoId) {
    const { rows } = await pool.query(
      `
        SELECT 
          pi.id,
          pi.solicitacao_id AS "solicitacaoId",
          pi.funcionario_id AS "funcionarioId",
          pi.cargo,
          pi.created_at AS "createdAt",
          f.nome AS "funcionarioNome",
          f.email AS "funcionarioEmail"
        FROM profissionais_instalacao pi
        JOIN funcionarios f ON pi.funcionario_id = f.id
        WHERE pi.solicitacao_id = $1
      `,
      [solicitacaoId]
    );
    return rows;
  },

  async deleteBySolicitacao(solicitacaoId) {
    await pool.query(
      `DELETE FROM profissionais_instalacao WHERE solicitacao_id = $1`,
      [solicitacaoId]
    );
  },

  async delete(id) {
    const { rows } = await pool.query(
      `DELETE FROM profissionais_instalacao WHERE id = $1 RETURNING id`,
      [id]
    );
    return rows[0];
  }
};

