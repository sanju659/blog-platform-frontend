import api from "./axios";

export const getDashboardStats = () => api.get("/admin/dashboard");
export const getAllUsers = (params) => api.get("/admin/users", { params });
export const updateUserStatus = (userId, data) => api.put(`/admin/users/${userId}/status`, data);
export const getAllPostsAdmin = (params) => api.get("/admin/posts", { params });
export const softDeletePost = (postId, data) => api.delete(`/admin/posts/${postId}/soft-delete`, { data });
export const restorePost = (postId) => api.put(`/admin/posts/${postId}/restore`);