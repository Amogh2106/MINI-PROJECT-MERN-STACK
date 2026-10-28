import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'Something went wrong',
      errors: error.response?.data?.errors || null,
      status: error.response?.status,
    };

    if (error.response?.status === 401) {
      window.dispatchEvent(
        new CustomEvent('crm:unauthorized', {
          detail: {
            message: customError.message,
          },
        })
      );
    }

    return Promise.reject(customError);
  }
);

export default axiosClient;
