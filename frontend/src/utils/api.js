// API utility functions
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat', data),
  getHistory: (courseId) => api.get(`/chat/${courseId}`),
  getCourses: () => api.get('/chat/courses/available')
};

// Homework API
export const homeworkAPI = {
  solve: (formData) => api.post('/homework/solve', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: () => api.get('/homework/history')
};

// Tutor API
export const tutorAPI = {
  ask: (data) => api.post('/tutor/ask', data)
};

// Quiz API
export const quizAPI = {
  generate: (data) => api.post('/quiz/generate', data),
  getCourseQuizzes: (courseId) => api.get(`/quiz/course/${courseId}`),
  getQuiz: (quizId) => api.get(`/quiz/${quizId}`),
  submit: (quizId, answers) => api.post(`/quiz/${quizId}/submit`, { answers }),
  getHistory: () => api.get('/quiz/student/history')
};

// Weak Area API
export const weakAreaAPI = {
  get: (studentId) => api.get(`/weakarea/${studentId || ''}`),
  getHeatmap: (studentId) => api.get(`/weakarea/${studentId || ''}/heatmap`)
};

// Upload API
export const uploadAPI = {
  document: (formData) => api.post('/upload/document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: (courseId) => api.get(`/upload/documents/${courseId}`),
  deleteDocument: (courseId, filename) => api.delete(`/upload/document/${courseId}/${filename}`)
};

// Courses API
export const coursesAPI = {
  create: (data) => api.post('/courses', data),
  getAll: () => api.get('/courses'),
  getMyCourses: () => api.get('/courses/my-courses'),
  getOne: (id) => api.get(`/courses/${id}`),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`)
};

export default api;
