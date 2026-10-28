import axiosClient from './axiosClient.js';

export const notesApi = {
  getByEntity: (entityType, entityId) => axiosClient.get(`/notes/${entityType}/${entityId}`),
  create: (data) => axiosClient.post('/notes', data),
  delete: (id) => axiosClient.delete(`/notes/${id}`),
};
