import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: adjuntar token ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: manejar 401 globalmente ─────────────────────────────────────
let redirecting = false; // evita múltiples redirects simultáneos

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !redirecting) {
      redirecting = true;
      localStorage.removeItem('token');
      // Notifica a DashboardLayout para que haga logout via React Router
      window.dispatchEvent(new Event('auth:expired'));
      // Reset flag después de que la navegación se complete
      setTimeout(() => { redirecting = false; }, 3000);
    }
    return Promise.reject(error);
  }
);

export default api;
