const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const defaultHeaders = {
  "Content-Type": "application/json"
};

const extractFieldErrors = (errors) => {
  if (!errors) return undefined;

  const parsed = {};
  Object.entries(errors).forEach(([field, message]) => {
    parsed[field] = message;
  });
  return parsed;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = null;
  }

  if (!response.ok) {
    const error = new Error(
      body?.message || Object.values(body?.errors || {})[0] || "Algo deu errado."
    );
    error.fieldErrors = extractFieldErrors(body?.errors);
    throw error;
  }

  return body;
};

export const register = (data) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const login = (data) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getProfile = (token) =>
  request("/auth/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
