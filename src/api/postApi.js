import api from "./axios";

export const createPost = (data) => api.post("/posts/create", data);

export const getAllPosts = () => api.get("/posts/allposts");

export const getPostById = (id) => api.get(`/posts/${id}`);

export const updatePost = (id, data) => api.put(`/posts/update/${id}`, data);

export const deletePost = (id) => api.delete(`/posts/delete/${id}`);
