import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth functions
export const login = (credentials) => api.post('/auth/signin', credentials);
export const register = (userData) => api.post('/auth/signup', userData);

// Profile functions
export const getProfile = () => api.get('/users/employees');
export const updateProfile = (data) => api.put('/users/profile', data); // Assuming a route, but not implemented yet

// Attendance functions
export const checkIn = (data) => api.post('/attendance/checkin', data);
export const checkOut = (data) => api.post('/attendance/checkout', data);
export const getAttendance = () => api.get('/attendance');

// Leave functions
export const applyLeave = (leaveData) => api.post('/leaves/apply', leaveData);
export const getLeaves = () => api.get('/leaves');

// Admin functions
export const adminGetEmployees = () => api.get('/users/employees');
export const adminGetAllLeaves = () => api.get('/leaves/all');
export const adminApproveLeave = (id, status) => api.post('/leaves/approve-reject', { id, status });
export const adminGetPayroll = () => api.get('/payroll'); // Assuming a route, but not implemented yet

export default api;