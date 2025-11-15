import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

const SECRET = "segredo_super_forte"; 

export const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const userExists = await User.findByEmail(email);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }

  const hashed = await bcrypt.hash(senha, 10);

  const newUser = await User.create(nome, email, hashed);

  res.json({ message: "Usuário criado", user: newUser.rows[0] });
};

export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  const result = await User.findByEmail(email);
  if (result.rows.length === 0) {
    return res.status(400).json({ error: "Email não encontrado" });
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(senha, user.senha);

  if (!match) return res.status(401).json({ error: "Senha incorreta" });

  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "1d" });

  res.json({ token });
};

export const profile = async (req, res) => {
  const { id } = req.user;

  const result = await User.findById(id);

  res.json(result.rows[0]);
};