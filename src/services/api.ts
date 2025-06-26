import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  register: (userData: any) =>
    apiClient.post('/auth/register', userData),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
};

export const studentsAPI = {
  getAll: (params?: any) =>
    apiClient.get('/students', { params }),
  getById: (id: string) =>
    apiClient.get(`/students/${id}`),
  create: (data: any) =>
    apiClient.post('/students', data),
  update: (id: string, data: any) =>
    apiClient.put(`/students/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/students/${id}`),
};

export const attendanceAPI = {
  markAttendance: (data: any) =>
    apiClient.post('/attendance/mark', data),
  getByDate: (date: string, className?: string) =>
    apiClient.get(`/attendance/date/${date}`, { params: { class: className } }),
  getHistory: (params?: any) =>
    apiClient.get('/attendance/history', { params }),
  getDashboardStats: () =>
    apiClient.get('/attendance/stats/dashboard'),
};

export const settingsAPI = {
  get: () =>
    apiClient.get('/settings'),
  update: (data: any) =>
    apiClient.put('/settings', data),
};

export const notificationAPI = {
  test: (data: any) =>
    apiClient.post('/notifications/test', data),
};