import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Employee } from "../models/Employee.js";
import { normalizeEmail, sanitizeString } from "../utils/sanitize.js";
import { cleanCpf, isValidCpfFormat } from "../utils/cpf.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const VALID_POSITIONS = ["pedreiro", "eletrecista", "responsável por instalação", "CEO"];

const buildEmployeePayload = (employee) => {
  if (!employee) return null;

  return {
    id: employee.id,
    name: employee.name,
    cpf: employee.cpf,
    email: employee.email,
    position: employee.position || null,
    imagemUrl: employee.imagemUrl || null,
    createdAt: employee.createdAt
  };
};

const createToken = (employeeId) =>
  jwt.sign({ id: employeeId, type: "employee" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const register = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const cpf = cleanCpf(req.body.cpf);
    const email = normalizeEmail(req.body.email);
    const { password, passwordConfirm, position } = req.body;

    if (!name || !cpf || !email || !password || !passwordConfirm || !position) {
      return res.status(400).json({ 
        message: "Todos os campos são obrigatórios." 
      });
    }

    if (!isValidCpfFormat(cpf)) {
      return res
        .status(400)
        .json({ message: "CPF inválido. Informe um CPF válido." });
    }

    if (!VALID_POSITIONS.includes(position)) {
      return res
        .status(400)
        .json({ message: "Cargo inválido. Selecione um cargo válido." });
    }

    if (password !== passwordConfirm) {
      return res
        .status(400)
        .json({ message: "As senhas precisam ser iguais." });
    }
    const existingEmployeeByCpf = await Employee.findByCpf(cpf);
    if (existingEmployeeByCpf) {
      return res
        .status(409)
        .json({ message: "Já existe um funcionário cadastrado com este CPF." });
    }

    const existingEmployeeByEmail = await Employee.findByEmail(email);
    if (existingEmployeeByEmail) {
      return res
        .status(409)
        .json({ message: "Já existe um funcionário cadastrado com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const createdEmployee = await Employee.create({ 
      name, 
      cpf,
      email, 
      password: passwordHash,
      position: sanitizeString(position)
    });

    return res.status(201).json({
      message: "Funcionário registrado com sucesso.",
      employee: buildEmployeePayload(createdEmployee)
    });
  } catch (error) {
    console.error("Erro ao registrar funcionário:", error);
    const dbConstraintViolation = error?.code === "23505";
    const columnNotFound = error?.code === "42703"; // Column does not exist
    const tableNotFound = error?.code === "42P01"; // Table does not exist
    
    let message = "Não foi possível finalizar o cadastro. Tente novamente.";
    
    if (tableNotFound) {
      message = "Tabela de funcionários não encontrada. Verifique se o banco de dados foi atualizado.";
      console.error("Tabela funcionarios não existe. Execute o SQL de atualização.");
    } else if (columnNotFound) {
      message = "Estrutura da tabela incorreta. Verifique se a coluna CPF existe.";
      console.error("Coluna não encontrada:", error.message);
    } else if (dbConstraintViolation) {
      if (error.constraint?.includes("cpf")) {
        message = "Já existe um funcionário cadastrado com este CPF.";
      } else if (error.constraint?.includes("email")) {
        message = "Já existe um funcionário cadastrado com este e-mail.";
      }
      return res.status(409).json({ message });
    }

    return res.status(500).json({ message, error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};

export const login = async (req, res) => {
  const cpf = cleanCpf(req.body.cpf);
  const { password } = req.body;

  if (!isValidCpfFormat(cpf)) {
    return res.status(400).json({ message: "CPF inválido." });
  }

  try {
    const existingEmployee = await Employee.findByCpf(cpf);

    if (!existingEmployee) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, existingEmployee.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = createToken(existingEmployee.id);

    return res.status(200).json({
      token,
      employee: buildEmployeePayload(existingEmployee)
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Não foi possível realizar o login. Tente novamente." });
  }
};

export const profile = async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);

    if (!employee) {
      return res.status(404).json({ message: "Funcionário não encontrado." });
    }

    return res.status(200).json({ employee: buildEmployeePayload(employee) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Não foi possível carregar o perfil." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { name, email, password, passwordConfirm, position } = req.body;
    const imagemUrl = req.file ? `/uploads/funcionarios/${req.file.filename}` : undefined;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          message: "A senha deve conter no mínimo 6 caracteres." 
        });
      }
      if (password !== passwordConfirm) {
        return res.status(400).json({ 
          message: "As senhas precisam ser iguais." 
        });
      }
    }

    if (position && !VALID_POSITIONS.includes(position)) {
      return res.status(400).json({ 
        message: "Cargo inválido. Selecione um cargo válido." 
      });
    }

    if (email) {
      const normalizedEmail = normalizeEmail(email);
      const existingEmployee = await Employee.findByEmail(normalizedEmail);
      if (existingEmployee && existingEmployee.id !== employeeId) {
        return res.status(409).json({ 
          message: "Já existe um funcionário cadastrado com este e-mail." 
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = sanitizeString(name);
    if (email) updateData.email = normalizeEmail(email);
    if (password) {
      updateData.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }
    if (position) updateData.position = sanitizeString(position);
    if (imagemUrl) updateData.imagemUrl = imagemUrl;

    const currentEmployee = await Employee.findById(employeeId);
    if (imagemUrl && currentEmployee?.imagemUrl) {
      const oldImagePath = path.join(__dirname, "../..", currentEmployee.imagemUrl);
      
      try {
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      } catch (err) {
        console.error("Erro ao deletar imagem antiga:", err);
      }
    }

    const updatedEmployee = await Employee.update(employeeId, updateData);

    return res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      employee: buildEmployeePayload(updatedEmployee)
    });
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    return res
      .status(500)
      .json({ message: "Não foi possível atualizar o perfil." });
  }
};

