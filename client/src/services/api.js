import axios from 'axios';

const API = axios.create({
  // Use relative path so Vite's proxy (/api → localhost:5000) works on all devices.
  // This works on localhost AND on phone (any IP) without hardcoding anything.
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser   = (data)  => API.post('/auth/register', data);
export const loginUser      = (data)  => API.post('/auth/login', data);
export const getMe          = ()      => API.get('/auth/me');

// Contacts
export const getContacts    = (params) => API.get('/contacts', { params });
export const createContact  = (data)   => API.post('/contacts', data);
export const updateContact  = (id, data) => API.put(`/contacts/${id}`, data);
export const deleteContact  = (id)     => API.delete(`/contacts/${id}`);

// Tracking
export const createTracking       = (data)   => API.post('/tracking/create', data);
export const getTrackingByToken   = (token)  => API.get(`/tracking/${token}`);
export const updateLocation       = (data)   => API.post('/tracking/update-location', data);
export const getUserTrackings     = (params) => API.get('/tracking', { params });
export const deleteTracking       = (id)     => API.delete(`/tracking/${id}`);

export default API;
