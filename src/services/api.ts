import axios from "axios";
export const apiUrl = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV 
    ? "http://localhost:3000/api" 
    : "https://api.jokko-business.com/api");

export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const isSuperAdminRequest = config.url?.includes("/super-admin");
  const token = isSuperAdminRequest
    ? localStorage.getItem("sa_user") || localStorage.getItem("token")
    : localStorage.getItem("token") || localStorage.getItem("sa_user");

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const isSuperAdminRequest = error.config?.url?.includes("/super-admin");

    if (status === 401 || (status === 403 && code === "ACCOUNT_DISABLED")) {
      if (isSuperAdminRequest) {
        localStorage.removeItem("sa_user");
        window.location.href = "/super-admin/login";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);