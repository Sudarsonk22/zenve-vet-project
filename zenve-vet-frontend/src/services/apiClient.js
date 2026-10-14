import axios from 'axios';
import { getToken, handleSessionExpired } from './authService';
import { appRoutes } from '../config/appRoutes';

const baseURL = import.meta.env.VITE_API_BASE_URL;
if (!baseURL) {
  console.error('VITE_API_BASE_URL is not set. Add it to .env (e.g. http://localhost:8080/api).');
}

const apiClient = axios.create({ baseURL, timeout: 30000 });

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) handleSessionExpired(appRoutes.login);
    return Promise.reject(error);
  },
);

export const isCanceled = (error) => axios.isCancel(error);

// Turns any axios error into a message that is safe and useful to show.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response) {
    const { status, data, config } = error.response;
    const serverMessage = typeof data === 'object' && data ? data.message || data.error : null;
    if (status === 401) return 'Your session has expired. Please sign in again.';
    if (status === 403) return serverMessage || 'You do not have permission to do that.';
    if (status === 404 || status === 405) {
      return `This feature is not available on the server yet (${config?.method?.toUpperCase()} ${config?.url}).`;
    }
    if (status === 413) return 'The file is too large for the server.';
    return serverMessage || `${fallback} (server responded ${status})`;
  }
  if (error.request) return 'Cannot reach the server. Check your connection and that the backend is running.';
  return error.message || fallback;
}

export const isNotSupported = (error) => [404, 405, 501].includes(error?.response?.status);

// Media URLs may be relative ("/uploads/a.mp4"); resolve against the backend origin.
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (/^(https?:|blob:|data:)/i.test(url)) return url;
  try {
    const origin = new URL(baseURL, window.location.origin).origin;
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
  } catch {
    return url;
  }
}

// Accepts a plain array or a Spring Data Page and returns one shape.
export function normalizePage(data, size = 10) {
  if (Array.isArray(data)) {
    return { items: data, page: 0, totalPages: 1, total: data.length, hasMore: false };
  }
  const items = data?.content ?? data?.items ?? data?.results ?? data?.data ?? [];
  const page = data?.number ?? data?.page ?? 0;
  const totalPages = data?.totalPages ?? null;
  const total = data?.totalElements ?? data?.total ?? null;
  let hasMore;
  if (typeof data?.last === 'boolean') hasMore = !data.last;
  else if (totalPages !== null) hasMore = page + 1 < totalPages;
  else hasMore = items.length >= size;
  return { items, page, totalPages, total, hasMore };
}

export default apiClient;
