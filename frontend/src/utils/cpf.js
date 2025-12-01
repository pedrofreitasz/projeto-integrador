
export const cleanCpf = (cpf) => {
  if (!cpf) return "";
  return cpf.replace(/[^\d]/g, "");
};

export const formatCpf = (cpf) => {
  const cleaned = cleanCpf(cpf);
  if (cleaned.length > 11) {
    return cpf.slice(0, 14);
  }
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return cleaned.replace(/(\d{3})(\d+)/, "$1.$2");
  } else if (cleaned.length <= 9) {
    return cleaned.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
  } else {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
  }
};

export const isValidCpfFormat = (cpf) => {
  const cleaned = cleanCpf(cpf);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
};


