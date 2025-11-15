export const API = "http://localhost:5000/users";

export async function register(data) {
  const response = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Erro ao registrar");
  }

  return result;
}

export async function login(data) {
  const response = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Erro ao fazer login");
  }

  return result;
}

export async function getProfile(token) {
  const response = await fetch(`${API}/profile`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Erro ao buscar perfil");
  }

  return result;
}
