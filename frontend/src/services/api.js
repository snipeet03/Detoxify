import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('detoxify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response normalizer
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err?.response?.data?.message || err.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const feedApi = {
  generate: (payload) => api.post('/feed', payload),
};

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
};

export const creatorsApi = {
  list: (category) => api.get('/creators', { params: { category } }),
};

export const cardsApi = {
  getCards: () => api.get('/user/cards'),
  addCard: (keyword) => api.post('/user/cards', { keyword }),
};

export default api;
