import axios from "axios";


// ========== production ===========

const api = axios.create({
  baseURL: "https://attendo-server-t2ox.onrender.com/api",
});

// ========== localhost ============

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
