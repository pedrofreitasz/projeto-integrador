import { InstallationRequest } from "../models/InstallationRequest.js";
import { InstallationProfessional } from "../models/InstallationProfessional.js";
import { ChargingPoint } from "../models/ChargingPoint.js";
import { Employee } from "../models/Employee.js";
import { sanitizeString } from "../utils/sanitize.js";

export const createInstallationRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      tipoInstalacao,
      endereco,
      cidade,
      estado,
      cep,
      distanciaQuadro,
      tipoResidencia,
      tipoCarregador,
      precoTotal,
      latitude,
      longitude,
      observacoes
    } = req.body;

    if (!tipoInstalacao || !endereco || !cidade || !precoTotal) {
      return res.status(400).json({
        message: "Campos obrigatórios não preenchidos."
      });
    }

    const custoTotal = precoTotal * 0.6;
    const request = await InstallationRequest.create({
      usuarioId: userId,
      tipoInstalacao: sanitizeString(tipoInstalacao),
      endereco: sanitizeString(endereco),
      cidade: sanitizeString(cidade),
      estado: estado ? sanitizeString(estado) : null,
      cep: cep ? sanitizeString(cep) : null,
      distanciaQuadro: distanciaQuadro ? parseFloat(distanciaQuadro) : null,
      tipoResidencia: tipoResidencia ? sanitizeString(tipoResidencia) : null,
      tipoCarregador: tipoCarregador ? sanitizeString(tipoCarregador) : null,
      precoTotal: parseFloat(precoTotal),
      custoTotal: custoTotal,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      observacoes: observacoes ? sanitizeString(observacoes) : null
    });

    return res.status(201).json({
      message: "Solicitação de instalação criada com sucesso.",
      request
    });
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return res.status(500).json({
      message: "Não foi possível criar a solicitação de instalação."
    });
  }
};

export const getAllInstallationRequests = async (req, res) => {
  try {
    let requests;
    
    if (req.employee?.position === "responsável por instalação") {
      requests = await InstallationRequest.findForInstalador(req.employee.id);
    } else {
      const filters = {};
      requests = await InstallationRequest.findAll(filters);
    }
    
    const requestsWithProfessionals = await Promise.all(
      requests.map(async (request) => {
        const professionals = await InstallationProfessional.findBySolicitacao(request.id);
        return { ...request, professionals };
      })
    );

    return res.status(200).json({ requests: requestsWithProfessionals });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return res.status(500).json({
      message: "Não foi possível buscar as solicitações."
    });
  }
};

export const getInstallationRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await InstallationRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        message: "Solicitação não encontrada."
      });
    }

    const professionals = await InstallationProfessional.findBySolicitacao(id);

    return res.status(200).json({
      request: { ...request, professionals }
    });
  } catch (error) {
    console.error("Erro ao buscar solicitação:", error);
    return res.status(500).json({
      message: "Não foi possível buscar a solicitação."
    });
  }
};

export const assignProfessionals = async (req, res) => {
  try {
    const { id } = req.params;
    const { profissionais } = req.body;

    if (!profissionais || !Array.isArray(profissionais)) {
      return res.status(400).json({
        message: "Lista de profissionais é obrigatória."
      });
    }

    const cargos = profissionais.map(p => p.cargo);
    const hasPedreiro = cargos.includes("pedreiro");
    const hasEletrecista = cargos.includes("eletrecista");
    const hasResponsavel = cargos.includes("responsável por instalação");

    if (!hasPedreiro || !hasEletrecista || !hasResponsavel) {
      return res.status(400).json({
        message: "A instalação deve ter pelo menos 1 pedreiro, 1 eletrecista e 1 responsável por instalação."
      });
    }

    await InstallationProfessional.deleteBySolicitacao(id);

    const createdProfessionals = [];
    for (const prof of profissionais) {
      const created = await InstallationProfessional.create({
        solicitacaoId: parseInt(id),
        funcionarioId: prof.funcionarioId,
        cargo: prof.cargo
      });
      createdProfessionals.push(created);
    }

    const responsavel = profissionais.find(p => p.cargo === "responsável por instalação");
    await InstallationRequest.update(id, {
      status: "em_andamento",
      responsavelId: responsavel.funcionarioId
    });

    return res.status(200).json({
      message: "Profissionais atribuídos com sucesso.",
      professionals: createdProfessionals
    });
  } catch (error) {
    console.error("Erro ao atribuir profissionais:", error);
    return res.status(500).json({
      message: "Não foi possível atribuir os profissionais."
    });
  }
};

export const completeInstallation = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      tipoConector,
      velocidade,
      potencia,
      latitude,
      longitude,
      disponivel
    } = req.body;

    const request = await InstallationRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        message: "Solicitação não encontrada."
      });
    }

    if (request.status !== "em_andamento") {
      return res.status(400).json({
        message: "Apenas instalações em andamento podem ser concluídas."
      });
    }

    // Criar ponto de recarga
    const ponto = await ChargingPoint.create({
      nome: nome || `Ponto de Recarga - ${request.endereco}`,
      endereco: request.endereco,
      cidade: request.cidade,
      latitude: latitude || request.latitude || -27.0953,
      longitude: longitude || request.longitude || -52.6167,
      tipoConector: tipoConector || "Tipo 2",
      velocidade: velocidade || "Normal",
      potencia: potencia || "7.4kW",
      disponivel: disponivel !== undefined ? disponivel : true,
      funcionarioId: req.employee.id
    });

    await InstallationRequest.update(id, {
      status: "concluida"
    });

    return res.status(200).json({
      message: "Instalação concluída e ponto de recarga criado com sucesso.",
      ponto
    });
  } catch (error) {
    console.error("Erro ao concluir instalação:", error);
    return res.status(500).json({
      message: "Não foi possível concluir a instalação."
    });
  }
};

export const getEmployeesByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const employees = await Employee.findByPosition(position);
    return res.status(200).json({ employees });
  } catch (error) {
    console.error("Erro ao buscar funcionários:", error);
    return res.status(500).json({
      message: "Não foi possível buscar os funcionários."
    });
  }
};

export const getBalance = async (req, res) => {
  try {
    const requests = await InstallationRequest.findAll({});
    
    const totalReceitas = requests
      .filter(r => r.status === "concluida")
      .reduce((sum, r) => sum + parseFloat(r.precoTotal || 0), 0);
    
    const totalCustos = requests
      .filter(r => r.status === "concluida")
      .reduce((sum, r) => sum + parseFloat(r.custoTotal || 0), 0);
    
    const lucro = totalReceitas - totalCustos;
    
    const pendentes = requests.filter(r => r.status === "pendente").length;
    const emAndamento = requests.filter(r => r.status === "em_andamento").length;
    const concluidas = requests.filter(r => r.status === "concluida").length;

    return res.status(200).json({
      totalReceitas,
      totalCustos,
      lucro,
      estatisticas: {
        pendentes,
        emAndamento,
        concluidas,
        total: requests.length
      },
      solicitacoes: requests
    });
  } catch (error) {
    console.error("Erro ao buscar balanço:", error);
    return res.status(500).json({
      message: "Não foi possível buscar o balanço."
    });
  }
};

