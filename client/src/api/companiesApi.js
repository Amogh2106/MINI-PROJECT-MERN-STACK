import axiosClient from './axiosClient.js';

export const companiesApi = {
  getAll: (params) => axiosClient.get('/companies', { params }),
  getById: (id) => axiosClient.get(`/companies/${id}`),
  create: (data) => axiosClient.post('/companies', data),
  update: (id, data) => axiosClient.put(`/companies/${id}`, data),
  delete: (id) => axiosClient.delete(`/companies/${id}`),
};
