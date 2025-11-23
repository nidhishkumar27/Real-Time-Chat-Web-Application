import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('auth-storage');
      if (stored) {
        const authData = JSON.parse(stored);
        // Check for direct token or nested state.token
        const authToken = authData?.token || authData?.state?.token;
        if (authToken) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }
      }
    } catch (error) {
      console.error('[API] Error parsing auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: async (username, email, password) => {
    try {
      const response = await api.post('/auth/signup', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Better error handling for network issues
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        throw {
          error: 'Cannot connect to server. Please make sure the backend server is running on port 5000.',
          code: 'ERR_NETWORK',
          message: error.message,
        };
      }
      throw error.response?.data || { error: error.message || 'Signup failed' };
    }
  },
  
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Better error handling for network issues
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        throw {
          error: 'Cannot connect to server. Please make sure the backend server is running on port 5000.',
          code: 'ERR_NETWORK',
          message: error.message,
        };
      }
      throw error.response?.data || { error: error.message || 'Login failed' };
    }
  },
  
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get user' };
    }
  },
  
  getUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get users' };
    }
  },
};

export const messagesAPI = {
  getConversation: async (recipientId) => {
    try {
      const response = await api.get(`/messages/${recipientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to get conversation' };
    }
  },
};

export default api;

