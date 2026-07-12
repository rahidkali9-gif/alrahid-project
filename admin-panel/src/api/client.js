import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const TOKEN_KEY = 'alrahid_admin_token';

export function getToken() {
  return Cookies.get('alrahid_admin_token') || localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) {
    Cookies.set('alrahid_admin_token', token, { expires: 7, sameSite: 'lax' });
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    Cookies.remove('alrahid_admin_token');
    localStorage.removeItem(TOKEN_KEY);
  }
}

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track logout handling to avoid loops
let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Response interceptor — unwrap data + handle 401
api.interceptors.response.use(
  (response) => {
    // Backend returns envelope { success, message, data, meta }
    const payload = response.data;
    if (payload && typeof payload === 'object' && 'success' in payload) {
      return {
        success: payload.success,
        message: payload.message,
        data: payload.data,
        meta: payload.meta,
        raw: payload,
        status: response.status,
      };
    }
    return payload;
  },
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
      error.message ||
      'Request failed';

    if (status === 401) {
      if (typeof onUnauthorized === 'function') {
        onUnauthorized();
      }
    }
    return Promise.reject({ status, message, response: error?.response, original: error });
  }
);

export default api;
