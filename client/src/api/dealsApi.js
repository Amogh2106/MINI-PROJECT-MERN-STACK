import axiosClient from './axiosClient.js';

export const dealsApi = {
  getAll: (params) => axiosClient.get('/deals', { params }),
  getById: (id) => axiosClient.get(`/deals/${id}`),
  create: (data) => axiosClient.post('/deals', data),
  update: (id, data) => axiosClient.put(`/deals/${id}`, data),
  updateStage: (id, stage) => axiosClient.patch(`/deals/${id}/stage`, { stage }),
  delete: (id) => axiosClient.delete(`/deals/${id}`),
};
