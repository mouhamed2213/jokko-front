import axios from "axios";
export const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3001/api"
    : "https://api.jokko-business.com/api");

// ── Espace boutique ───────────────────────────────────────────
// Utilise UNIQUEMENT le token boutique ("token"), jamais celui du Super Admin.
export const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Ignore login request errors to avoid redirect loops
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (
      (!isLoginRequest && status === 401) ||
      (status === 403 && code === "ACCOUNT_DISABLED")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Espace Super Admin ────────────────────────────────────────
// Utilise UNIQUEMENT le token Super Admin ("sa_user"), jamais celui d'une boutique.
export const adminApi = axios.create({
  baseURL: apiUrl,
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("sa_user");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Un mauvais mot de passe au login ne doit pas recharger la page
    const isLoginRequest = error.config?.url?.includes(
      "/auth/super-admin/login",
    );

    if (!isLoginRequest && status === 401) {
      localStorage.removeItem("sa_user");
      window.location.href = "/super-admin/login";
    }
    return Promise.reject(error);
  },
);
