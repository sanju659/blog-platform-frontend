import api from "./axios";

export const createPost = (data) => api.post("/posts/create", data);

export const getAllPosts = () => api.get("/posts/allposts");

export const getPostById = (id) => api.get(`/posts/${id}`);

export const getMyPosts = () => api.get("/posts/my-posts");

export const updatePost = (id, data) => api.put(`/posts/update/${id}`, data);

export const deletePost = (id) => api.delete(`/posts/delete/${id}`);

export const getFeed = (params) => api.get("/posts/feed", { params });

export const getReactions = (postId) => api.get(`/posts/${postId}/reactions`);

export const setReaction = (postId, reaction) =>
  api.post(`/posts/${postId}/reactions`, { reaction });

export const removeReaction = (postId) =>
  api.delete(`/posts/${postId}/reactions`);

export const getComments = (postId, params) =>
  api.get(`/posts/${postId}/comments`, { params });

export const createComment = (postId, content) =>
  api.post(`/posts/${postId}/comments`, { content });

export const editComment = (commentId, content) =>
  api.patch(`/comments/${commentId}`, { content });

export const deleteComment = (commentId) =>
  api.delete(`/comments/${commentId}`);