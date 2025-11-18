import { sanitizeString } from "../utils/sanitize.js";

const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const shouldSanitize = (rules = {}) => rules.sanitize !== false;

export const validateFields = (schema = {}) => (req, res, next) => {
  const errors = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const rawValue = req.body[field];
    let value = rawValue;

    if (typeof rawValue === "string" && shouldSanitize(rules)) {
      value = sanitizeString(rawValue);
    }

    if (rules.type === "boolean") {
      value = Boolean(rawValue === true || rawValue === "true");
    }

    req.body[field] = value;

    if (rules.required && (value === undefined || value === "" || value === null)) {
      errors[field] = rules.requiredMessage || "Campo obrigatório.";
      return;
    }

    if (rules.type === "email" && value && !emailRegex.test(value)) {
      errors[field] = rules.invalidMessage || "E-mail inválido.";
      return;
    }

    if (rules.min && typeof value === "string" && value.length < rules.min) {
      errors[field] =
        rules.minMessage || `Deve conter pelo menos ${rules.min} caracteres.`;
      return;
    }
  });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

