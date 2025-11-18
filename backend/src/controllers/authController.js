import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { normalizeEmail, sanitizeString } from "../utils/sanitize.js";

const JWT_SECRET = process.env.JWT_SECRET || "development_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const buildUserPayload = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
};

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

export const register = async (req, res) => {
  const name = sanitizeString(req.body.name);
  const email = normalizeEmail(req.body.email);
  const { password, passwordConfirm } = req.body;

  if (password !== passwordConfirm) {
    return res
      .status(400)
      .json({ message: "As senhas precisam ser iguais." });
  }

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Já existe um usuário cadastrado com este e-mail." });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const createdUser = await User.create({ name, email, password: passwordHash });

    return res.status(201).json({
      message: "Usuário registrado com sucesso.",
      user: buildUserPayload(createdUser)
    });
  } catch (error) {
    const dbConstraintViolation = error?.code === "23505";
    const message = dbConstraintViolation
      ? "Já existe um usuário cadastrado com este e-mail."
      : "Não foi possível finalizar o cadastro. Tente novamente.";

    if (dbConstraintViolation) {
      return res.status(409).json({ message });
    }

    return res.status(500).json({ message });
  }
};

export const login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;

  try {
    const existingUser = await User.findByEmail(email);

    if (!existingUser) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = createToken(existingUser.id);

    return res.status(200).json({
      token,
      user: buildUserPayload(existingUser)
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Não foi possível realizar o login. Tente novamente." });
  }
};

export const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    return res.status(200).json({ user: buildUserPayload(user) });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Não foi possível carregar o perfil." });
  }
};

