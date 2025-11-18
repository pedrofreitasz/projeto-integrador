export const sanitizeString = (value = "") => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[<>]/g, "");
};

export const normalizeEmail = (email = "") =>
  sanitizeString(email).toLowerCase();

