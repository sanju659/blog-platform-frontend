import axios from "axios";

const api = axios.create({
  // The url from backend(app.js), connecting to the backend api
  baseURL: "http://127.0.0.1:3000/api",
});

api.interceptors.request.use((config) => {
  //Automatically checks for an authentication token in localStorage
  const token = localStorage.getItem("token");

  //If a token exists, adds it to the request headers as Authorization: Bearer <token>
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
