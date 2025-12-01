
export const cleanCpf = (cpf) => {
  if (!cpf) return "";
  return cpf.replace(/[^\d]/g, "");
};

export const formatCpf = (cpf) => {
  const cleaned = cleanCpf(cpf);
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const isValidCpfFormat = (cpf) => {
  const cleaned = cleanCpf(cpf);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
};


