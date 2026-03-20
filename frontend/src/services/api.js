import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('detoxify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap responses, surface error messages
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const feedApi = {
  generate: (payload) => api.post('/feed', payload),
};

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login:    (payload) => api.post('/auth/login', payload),
};

export const creatorsApi = {
  list: (category) => api.get('/creators', { params: category ? { category } : {} }),
};

export default api;
