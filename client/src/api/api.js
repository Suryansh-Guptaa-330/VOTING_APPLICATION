import axios from 'axios';

// Backend server URL: Uses environment variable for Vercel/Render deployment,
// falling back to local port 3000 for local development.
const rawBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:3000';

// Strip any trailing slash to prevent malformed endpoint paths (e.g. //user/login)
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Custom Axios instance for VoteChain application
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60s timeout to handle Render free-tier spinning up from cold starts
});

/**
 * Axios Request Interceptor:
 * Attaches JWT Bearer token from localStorage to every outgoing request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Axios Response Interceptor:
 * Handles global HTTP response errors (e.g. 401 Unauthorized token expiry)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or unauthorized request. Clearing token.');
      // Optional: automatically clear expired token if desired
      // localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

/* ============================================================
   Backend API Endpoints (Mapped 1:1 to VOTING_APP routes)
   ============================================================ */

export const authApi = {
  // POST /user/signup -> { name, age, mobile, aadharCardNumber, address, password, role? }
  signup: async (userData) => {
    const response = await api.post('/user/signup', userData);
    return response.data;
  },

  // POST /user/login -> { aadharCardNumber, password }
  login: async (credentials) => {
    const response = await api.post('/user/login', credentials);
    return response.data;
  },

  // GET /user/profile (Protected by JWT)
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // PUT /user/profile/password (Protected by JWT) -> { currentPassword, newPassword }
  updatePassword: async (passwords) => {
    const response = await api.put('/user/profile/password', passwords);
    return response.data;
  },
};

export const candidateApi = {
  // GET /candidate -> List of all candidates
  getAll: async () => {
    const response = await api.get('/candidate');
    return response.data;
  },

  // GET /candidate/vote/count -> Live vote counts sorted descending
  getVoteCounts: async () => {
    const response = await api.get('/candidate/vote/count');
    return response.data;
  },

  // POST /candidate/vote/:candidateID (Protected by JWT) -> Cast a vote
  castVote: async (candidateId) => {
    const response = await api.post(`/candidate/vote/${candidateId}`);
    return response.data;
  },

  // Admin Only Endpoints:
  create: async (candidateData) => {
    const response = await api.post('/candidate', candidateData);
    return response.data;
  },

  update: async (candidateId, updatedData) => {
    const response = await api.put(`/candidate/${candidateId}`, updatedData);
    return response.data;
  },

  delete: async (candidateId) => {
    const response = await api.delete(`/candidate/${candidateId}`);
    return response.data;
  },
};

/* ============================================================
   Local Storage Auth Token Helpers
   ============================================================ */
export const tokenStorage = {
  set: (token) => {
    if (token) localStorage.setItem('token', token);
  },
  get: () => {
    return localStorage.getItem('token');
  },
  remove: () => {
    localStorage.removeItem('token');
  },
  hasToken: () => {
    return Boolean(localStorage.getItem('token'));
  },
};

export default api;
