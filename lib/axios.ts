import axios from 'axios';

const api = axios.create({
  // Browser requests stay on the Next.js origin and are proxied server-to-server
  // by app/api/[...path]. This avoids exposing Railway URLs and removes CORS.
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('skytrack_token') ?? sessionStorage.getItem('skytrack_token');
    const isAllowedMockToken =
      process.env.NEXT_PUBLIC_NO_BACKEND === 'true' && token?.startsWith('mock-token-');
    if (token && (!token.startsWith('mock-token-') || isAllowedMockToken)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function responseMessage(data: unknown) {
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (!data || typeof data !== 'object') return '';

  const payload = data as Record<string, unknown>;
  for (const key of ['error', 'message', 'detail']) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? '');
    const isAuthRequest = requestUrl.startsWith('/api/auth/');

    if (
      status === 401 &&
      typeof window !== 'undefined' &&
      !isAuthRequest
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

    const backendMessage = responseMessage(error.response?.data);

    const message =
      status === 401 && !isAuthRequest
        ? 'Your session has expired. Please sign in again.'
        : status === 403
        ? backendMessage || 'You do not have permission to perform this action.'
        : !error.response || status === 0 || error.code === 'ECONNABORTED'
        ? error.code === 'ECONNABORTED'
          ? 'The backend request timed out. Please try again.'
          : 'Backend is unavailable. Please check the API server.'
        : backendMessage || 'Cannot connect to SkyTrack backend';

    return Promise.reject(Object.assign(new Error(message), {
      status,
      code: error.code,
    }));
  }
);

export default api;
