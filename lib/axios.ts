import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn Token JWT vào header nếu có
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('skytrack_token') ?? sessionStorage.getItem('skytrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? '');

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !requestUrl.startsWith('/api/auth/')
    ) {
      localStorage.removeItem('skytrack_token');
      localStorage.removeItem('skytrack_user');
      sessionStorage.removeItem('skytrack_token');
      sessionStorage.removeItem('skytrack_user');
      sessionStorage.setItem('skytrack_auth_message', 'session-expired');

      if (window.location.pathname !== '/login') {
        window.location.assign('/login?reason=session-expired');
      }
    }

    const backendMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message;

    const message =
      status === 401
        ? 'Your session has expired. Please sign in again.'
        : !error.response || status === 0 || error.code === 'ECONNABORTED'
        ? 'Backend is unavailable. Please check the API server.'
        : backendMessage || 'Cannot connect to SkyTrack backend';

    return Promise.reject(new Error(message));
  }
);

export default api;
