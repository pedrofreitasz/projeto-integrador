import { Recharge } from "../models/Recharge.js";
import { sanitizeString } from "../utils/sanitize.js";

export const createRecharge = async (req, res) => {
  const userId = req.user.id;
  const { local, endereco, dataHora, duracao, energia, custo } = req.body;

  try {
    const recharge = await Recharge.create({
      userId,
      local: sanitizeString(local),
      endereco: sanitizeString(endereco),
      dataHora,
      duracao,
      energia: parseFloat(energia),
      custo: parseFloat(custo)
    });

    return res.status(201).json({
      message: "Recarga registrada com sucesso.",
      recharge
    });
  } catch (error) {
    console.error("Erro ao criar recarga:", error);
    return res.status(500).json({
      message: "Não foi possível registrar a recarga. Tente novamente."
    });
  }
};

export const getRecharges = async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  const startDate = req.query.startDate || null;

  try {
    const recharges = await Recharge.findByUserId(userId, limit, offset, startDate);
    const total = await Recharge.countByUserId(userId, startDate);

    return res.status(200).json({
      recharges,
      total,
      limit,
      offset
    });
  } catch (error) {
    console.error("Erro ao buscar recargas:", error);
    return res.status(500).json({
      message: "Não foi possível carregar as recargas. Tente novamente."
    });
  }
};

export const deleteRecharge = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const recharge = await Recharge.findById(id, userId);

    if (!recharge) {
      return res.status(404).json({
        message: "Recarga não encontrada."
      });
    }

    await Recharge.delete(id, userId);

    return res.status(200).json({
      message: "Recarga excluída com sucesso."
    });
  } catch (error) {
    console.error("Erro ao excluir recarga:", error);
    return res.status(500).json({
      message: "Não foi possível excluir a recarga. Tente novamente."
    });
  }
};

