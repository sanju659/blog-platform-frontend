import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// If the server rejects our token (expired, or password was reset elsewhere),
// clear the stale session and send the user to login.
// Auth forms are excluded: a 401 there means "wrong password", not "bad session".
const SKIP_LOGOUT_URLS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/change-password",
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const hadToken = !!localStorage.getItem("token");
    const skip = SKIP_LOGOUT_URLS.some((u) => url.includes(u));

    if (status === 401 && hadToken && !skip) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
