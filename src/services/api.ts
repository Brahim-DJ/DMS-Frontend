import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Add a request interceptor to include the auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // This will set the Authorization header for every request
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Adding auth token to ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`[API] No token available for request to ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response success from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error(`[API] Response error from ${error.config?.url}:`, {
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response && error.response.status === 401) {
      console.log('[API] Unauthorized request (401) - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;