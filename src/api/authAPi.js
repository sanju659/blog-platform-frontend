import api from "./axios";

export const signup = (data) => api.post("/auth/signup", data);

export const login = (data) => api.post("/auth/login", data);

export const getMe = () => api.get("/auth/me");

export const updateProfile = (data) => api.put("/auth/update-profile", data);

export const changePassword = (data) => api.put("/auth/change-password", data);

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

export const resetPassword = (token, data) =>
  api.post(`/auth/reset-password/${token}`, data);

export const checkUsername = (username) =>
  api.get(`/auth/username-available/${encodeURIComponent(username)}`);
