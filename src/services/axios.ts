// apiClient.ts
import axios from "axios";
import { apiBaseURL } from "@/config";

const serverInstance = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically attach token from localStorage before each request
serverInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional response interceptor
serverInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized error
    const status = error?.response?.status;
    if (status === 401) {
      // Clear localStorage and redirect to login
      localStorage.clear();
      // Redirect to login without using React hooks
      window.location.replace('/login');
    }

    console.error('API error:', error);
    return Promise.reject(error);
  }
);

export { serverInstance };
