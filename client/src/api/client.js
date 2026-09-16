import axios from 'axios';

let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
if (rawApiUrl.endsWith('/')) {
  rawApiUrl = rawApiUrl.slice(0, -1);
}
if (rawApiUrl.startsWith('http') && !rawApiUrl.includes('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}

const api = axios.create({
  baseURL: rawApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gurjeet_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling and session expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Detect expired or invalid token
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('gurjeet_token');
        window.dispatchEvent(new CustomEvent('gurjeet_auth_expired'));
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;
