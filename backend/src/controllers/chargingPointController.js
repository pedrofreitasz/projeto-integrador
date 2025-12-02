import { ChargingPoint } from "../models/ChargingPoint.js";
import { sanitizeString } from "../utils/sanitize.js";

export const createChargingPoint = async (req, res) => {
  try {
    const { nome, endereco, cidade, latitude, longitude, tipoConector, velocidade, potencia, disponivel } = req.body;
    const funcionarioId = req.employee.id;

    if (!nome || !endereco || !cidade || latitude === undefined || longitude === undefined || !tipoConector || !velocidade || !potencia) {
      return res.status(400).json({
        message: "Todos os campos obrigatórios devem ser preenchidos."
      });
    }

    const ponto = await ChargingPoint.create({
      nome: sanitizeString(nome),
      endereco: sanitizeString(endereco),
      cidade: sanitizeString(cidade),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      tipoConector: sanitizeString(tipoConector),
      velocidade: sanitizeString(velocidade),
      potencia: sanitizeString(potencia),
      disponivel: disponivel !== undefined ? Boolean(disponivel) : true,
      funcionarioId
    });

    return res.status(201).json({
      message: "Ponto de recarga cadastrado com sucesso.",
      ponto
    });
  } catch (error) {
    console.error("Erro ao criar ponto de recarga:", error);
    return res.status(500).json({
      message: "Não foi possível cadastrar o ponto de recarga."
    });
  }
};

export const getAllChargingPoints = async (req, res) => {
  try {
    const pontos = await ChargingPoint.findAll();
    return res.status(200).json({ pontos });
  } catch (error) {
    console.error("Erro ao buscar pontos de recarga:", error);
    return res.status(500).json({
      message: "Não foi possível buscar os pontos de recarga."
    });
  }
};

export const getChargingPointById = async (req, res) => {
  try {
    const { id } = req.params;
    const ponto = await ChargingPoint.findById(id);

    if (!ponto) {
      return res.status(404).json({
        message: "Ponto de recarga não encontrado."
      });
    }

    return res.status(200).json({ ponto });
  } catch (error) {
    console.error("Erro ao buscar ponto de recarga:", error);
    return res.status(500).json({
      message: "Não foi possível buscar o ponto de recarga."
    });
  }
};

export const updateChargingPoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, endereco, cidade, latitude, longitude, tipoConector, velocidade, potencia, disponivel } = req.body;

    const pontoExistente = await ChargingPoint.findById(id);
    if (!pontoExistente) {
      return res.status(404).json({
        message: "Ponto de recarga não encontrado."
      });
    }

    const updateData = {};
    if (nome !== undefined) updateData.nome = sanitizeString(nome);
    if (endereco !== undefined) updateData.endereco = sanitizeString(endereco);
    if (cidade !== undefined) updateData.cidade = sanitizeString(cidade);
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (tipoConector !== undefined) updateData.tipoConector = sanitizeString(tipoConector);
    if (velocidade !== undefined) updateData.velocidade = sanitizeString(velocidade);
    if (potencia !== undefined) updateData.potencia = sanitizeString(potencia);
    if (disponivel !== undefined) updateData.disponivel = Boolean(disponivel);

    const ponto = await ChargingPoint.update(id, updateData);

    return res.status(200).json({
      message: "Ponto de recarga atualizado com sucesso.",
      ponto
    });
  } catch (error) {
    console.error("Erro ao atualizar ponto de recarga:", error);
    return res.status(500).json({
      message: "Não foi possível atualizar o ponto de recarga."
    });
  }
};

export const deleteChargingPoint = async (req, res) => {
  try {
    const { id } = req.params;

    const ponto = await ChargingPoint.findById(id);
    if (!ponto) {
      return res.status(404).json({
        message: "Ponto de recarga não encontrado."
      });
    }

    await ChargingPoint.delete(id);

    return res.status(200).json({
      message: "Ponto de recarga removido com sucesso."
    });
  } catch (error) {
    console.error("Erro ao deletar ponto de recarga:", error);
    return res.status(500).json({
      message: "Não foi possível remover o ponto de recarga."
    });
  }
};




