import axios from 'axios';

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // Si estamos en desarrollo local
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3000/api';
  }
  
  // Si estamos en producción (Vercel), apuntar directamente a Railway
  return 'https://vaultscore-system-production.up.railway.app/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;