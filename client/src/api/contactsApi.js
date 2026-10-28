import axiosClient from './axiosClient.js';

export const contactsApi = {
  getAll: (params) => axiosClient.get('/contacts', { params }),
  getById: (id) => axiosClient.get(`/contacts/${id}`),
  create: (data) => axiosClient.post('/contacts', data),
  update: (id, data) => axiosClient.put(`/contacts/${id}`, data),
  delete: (id) => axiosClient.delete(`/contacts/${id}`),
};
