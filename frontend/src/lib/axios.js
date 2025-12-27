import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});

// Response interceptor - errors are handled by individual components
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);