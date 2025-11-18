import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "development_secret";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido." });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};
