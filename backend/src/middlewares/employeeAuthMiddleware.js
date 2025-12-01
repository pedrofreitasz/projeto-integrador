import jwt from "jsonwebtoken";
import { Employee } from "../models/Employee.js";

const SECRET = process.env.JWT_SECRET || "development_secret";

export const employeeAuthMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    
    if (decoded.type !== "employee") {
      return res.status(403).json({ message: "Acesso negado. Token inválido para funcionário." });
    }

    const employee = await Employee.findById(decoded.id);
    if (!employee) {
      return res.status(401).json({ message: "Funcionário não encontrado." });
    }

    req.user = decoded;
    req.employee = employee;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};

export const requireCEO = (req, res, next) => {
  if (req.employee?.position !== "CEO") {
    return res.status(403).json({ message: "Acesso negado. Apenas CEO pode realizar esta ação." });
  }
  return next();
};

export const requireCEOOrInstalador = (req, res, next) => {
  const position = req.employee?.position;
  if (position !== "CEO" && position !== "responsável por instalação") {
    return res.status(403).json({ 
      message: "Acesso negado. Apenas CEO ou Responsável por Instalação pode realizar esta ação." 
    });
  }
  return next();
};


