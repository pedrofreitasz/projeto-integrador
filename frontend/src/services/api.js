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
  try {
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
  } catch (error) {
    if (error.message && error.message !== "Failed to fetch") {
      throw error;
    }
    
    const networkError = new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
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

export const updateProfile = async (formData) => {
  const token = localStorage.getItem("token");
  
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
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
  } catch (error) {
    if (error.message && error.message !== "Failed to fetch") {
      throw error;
    }
    
    const networkError = new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`
  };
};

export const createRecharge = (data) =>
  request("/recharges", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

export const getRecharges = (limit = 50, offset = 0, startDate = null) => {
  let url = `/recharges?limit=${limit}&offset=${offset}`;
  if (startDate) {
    url += `&startDate=${encodeURIComponent(startDate)}`;
  }
  return request(url, {
    method: "GET",
    headers: getAuthHeaders()
  });
};

export const deleteRecharge = (id) =>
  request(`/recharges/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

const getEmployeeAuthHeaders = () => {
  const token = localStorage.getItem("employeeToken");
  return {
    Authorization: `Bearer ${token}`
  };
};

export const registerEmployee = (data) =>
  request("/employees/register", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const loginEmployee = (data) =>
  request("/employees/login", {
    method: "POST",
    body: JSON.stringify(data)
  });

export const getEmployeeProfile = () =>
  request("/employees/profile", {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const updateEmployeeProfile = async (formData) => {
  const token = localStorage.getItem("employeeToken");
  
  try {
    const response = await fetch(`${API_URL}/employees/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
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
  } catch (error) {
    if (error.message && error.message !== "Failed to fetch") {
      throw error;
    }
    
    const networkError = new Error(
      "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
    );
    networkError.isNetworkError = true;
    throw networkError;
  }
};

export const getChargingPoints = () =>
  request("/charging-points", {
    method: "GET"
  });

export const createChargingPoint = (data) =>
  request("/charging-points", {
    method: "POST",
    headers: getEmployeeAuthHeaders(),
    body: JSON.stringify(data)
  });

export const updateChargingPoint = (id, data) =>
  request(`/charging-points/${id}`, {
    method: "PUT",
    headers: getEmployeeAuthHeaders(),
    body: JSON.stringify(data)
  });

export const deleteChargingPoint = (id) =>
  request(`/charging-points/${id}`, {
    method: "DELETE",
    headers: getEmployeeAuthHeaders()
  });

export const getAllEmployees = () =>
  request("/admin/employees", {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const deleteEmployee = (id) =>
  request(`/admin/employees/${id}`, {
    method: "DELETE",
    headers: getEmployeeAuthHeaders()
  });

export const getAllUsers = () =>
  request("/admin/users", {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const deleteUser = (id) =>
  request(`/admin/users/${id}`, {
    method: "DELETE",
    headers: getEmployeeAuthHeaders()
  });

export const createInstallationRequest = (data) =>
  request("/installations", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });

export const getAllInstallationRequests = () =>
  request("/installations", {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const getInstallationRequestById = (id) =>
  request(`/installations/${id}`, {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const assignProfessionals = (id, data) =>
  request(`/installations/${id}/professionals`, {
    method: "POST",
    headers: getEmployeeAuthHeaders(),
    body: JSON.stringify(data)
  });

export const completeInstallation = (id, data) =>
  request(`/installations/${id}/complete`, {
    method: "POST",
    headers: getEmployeeAuthHeaders(),
    body: JSON.stringify(data)
  });

export const getBalance = () =>
  request("/installations/admin/balance", {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });

export const getEmployeesByPosition = (position) =>
  request(`/installations/employees/position/${position}`, {
    method: "GET",
    headers: getEmployeeAuthHeaders()
  });
