import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('estimatrix_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('estimatrix_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Projects
export const projectAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats'),
};

// Tasks
export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// Reports
export const reportAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  submit: (data) => api.post('/reports', data),
  review: (id, data) => api.put(`/reports/${id}/review`, data),
  getPerformance: (employeeId) => api.get(`/reports/performance/${employeeId}`),
};

// Historical
export const historicalAPI = {
  getAll: () => api.get('/historical'),
  upload: (data) => api.post('/historical', data),
  delete: (id) => api.delete(`/historical/${id}`),
};

// Users
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// GitHub
export const githubAPI = {
  getRepoInfo: (owner, repo) => api.get(`/github/repo/${owner}/${repo}`),
  getContributors: (projectId) => api.get(`/github/contributors/${projectId}`),
  getCommits: (projectId, params) => api.get(`/github/commits/${projectId}`, { params }),
  getUserActivity: (username, params) => api.get(`/github/activity/${username}`, { params }),
};

export default api;
