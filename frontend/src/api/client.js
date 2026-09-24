import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: `${API_BASE}/api` });

export const Auth = {
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
  rules: () => api.get("/auth/rules").then((r) => r.data)
};

export const Inspections = {
  create: (formData) =>
    api
      .post("/inspections",formData).then((r) => r.data),
  list: (params) => api.get("/inspections", { params }).then((r) => r.data),
  get: (id) => api.get(`/inspections/${id}`).then((r) => r.data)
};

export const Complaints = {
  create: (payload) => api.post("/complaints", payload).then((r) => r.data),
  list: () => api.get("/complaints").then((r) => r.data)
};

export const Analytics = {
  summary: () => api.get("/analytics/summary").then((r) => r.data)
};

export default api;
