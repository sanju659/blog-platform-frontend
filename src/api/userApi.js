import api from "./axios";

export const getPublicProfile = (username) =>
  api.get(`/users/${encodeURIComponent(username)}`);

export const getUserPosts = (username, params) =>
  api.get(`/users/${encodeURIComponent(username)}/posts`, { params });

export const followUser = (username) =>
  api.post(`/users/${encodeURIComponent(username)}/follow`);

export const unfollowUser = (username) =>
  api.delete(`/users/${encodeURIComponent(username)}/follow`);

export const getFollowers = (username, params) =>
  api.get(`/users/${encodeURIComponent(username)}/followers`, { params });

export const getFollowing = (username, params) =>
  api.get(`/users/${encodeURIComponent(username)}/following`, { params });
