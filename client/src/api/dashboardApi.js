import axiosClient from './axiosClient.js';

export const dashboardApi = {
  getMetrics: () => axiosClient.get('/dashboard'),
};
