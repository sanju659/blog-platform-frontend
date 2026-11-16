import api from "./axios";

export const getPublicProfile = (username) =>
  api.get(`/users/${encodeURIComponent(username)}`);

export const getUserPosts = (username, params) =>
  api.get(`/users/${encodeURIComponent(username)}/posts`, { params });
