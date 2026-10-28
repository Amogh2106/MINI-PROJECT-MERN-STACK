import axiosClient from './axiosClient.js';

export const tasksApi = {
  getAll: (params) => axiosClient.get('/tasks', { params }),
  getById: (id) => axiosClient.get(`/tasks/${id}`),
  create: (data) => axiosClient.post('/tasks', data),
  update: (id, data) => axiosClient.put(`/tasks/${id}`, data),
  delete: (id) => axiosClient.delete(`/tasks/${id}`),
};
