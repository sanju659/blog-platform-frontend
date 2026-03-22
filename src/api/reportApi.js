import api from "./axios";

// User
export const reportPost = (postId, data) => api.post(`/reports/${postId}/report`, data);

// Admin
export const getAllReports = (params) => api.get("/reports/admin/all", { params });
export const getReportStats = () => api.get("/reports/admin/stats");
export const getPostReports = (postId) => api.get(`/reports/admin/post/${postId}`);
export const dismissReport = (reportId, data) => api.put(`/reports/admin/${reportId}/dismiss`, data);
export const reviewReport = (reportId, data) => api.put(`/reports/admin/${reportId}/review`, data);