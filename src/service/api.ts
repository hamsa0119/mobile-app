import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://10.0.2.2:3000/api', // Use 10.0.2.2 for Android emulator to access localhost
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // You can add authentication tokens here if needed
    // const token = await AsyncStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Project API functions
export const projectAPI = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Return null to indicate API failure, let components handle fallback
      return null;
    }
  },

  // Get project by ID
  getProjectById: async (projectId: string) => {
    try {
      const response = await api.get(`/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  // Get project details with statistics
  getProjectDetails: async (projectId: string) => {
    try {
      const response = await api.get(`/project/${projectId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project details:', error);
      return null;
    }
  },

  // Get defect density for a project
  getDefectDensity: async (projectId: string) => {
    try {
      const response = await api.get(`/defects/density?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching defect density:', error);
      return null;
    }
  },

  // Get defect remark ratio for a project
  getDefectRemarkRatio: async (projectId: string) => {
    try {
      const response = await api.get(`/defects/remark-ratio?projectId=${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching defect remark ratio:', error);
      return null;
    }
  },
};

export default api;
