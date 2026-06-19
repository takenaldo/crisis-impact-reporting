import axios from 'axios';

// Create a custom axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Request Interceptor: Automatically attach the JWT to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401s and refresh the token
api.interceptors.response.use(
  (response) => response, // If request succeeds, just pass it through
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark it so we don't loop forever

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        // Call DRF refresh endpoint
        const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken,
        });

        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Update the failed request header with the fresh token and retry it
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Refresh token expired too. User must log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirect to login page here if needed
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api