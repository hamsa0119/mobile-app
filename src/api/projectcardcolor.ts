import axios from 'axios';

// Environment variable with fallback
let VITE_BASE_URL: string;
try {
  const envModule = require('@env');
  VITE_BASE_URL = envModule.VITE_BASE_URL || 'http://34.56.162.48:8087/api/v1/';
} catch (error) {
  // Fallback if @env module is not available
  VITE_BASE_URL = 'http://34.56.162.48:8087/api/v1/';
  console.warn('Environment variables not loaded, using fallback URL:', VITE_BASE_URL);
}

// Define the ProjectCardColor interface
export interface ProjectCardColor {
  projectId: number;
  projectName?: string;
  availableRiskLevels?: string[];
  projectCardColor: string;
  color?: string; // For backward compatibility
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  lastUpdated?: string;
  status?: string;
  description?: string;
}

// Define message constants for better error handling
export const MESSAGES = {
  SUCCESS: {
    FETCH_COLOR: 'Project card color fetched successfully',
    FETCH_ALL_COLORS: 'All project card colors fetched successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    SERVER: 'Server error. Please try again later.',
    NOT_FOUND: 'Project card color not found.',
    UNAUTHORIZED: 'Unauthorized access.',
    FORBIDDEN: 'Access forbidden.',
    VALIDATION: 'Invalid project ID.',
    UNKNOWN: 'An unexpected error occurred.',
  },
  VALIDATION: {
    PROJECT_ID_REQUIRED: 'Project ID is required',
    INVALID_PROJECT_ID: 'Invalid project ID format',
  },
};

// Utility function to get HTTP status message
const getStatusMessage = (status: number): string => {
  switch (status) {
    case 400:
      return MESSAGES.ERROR.VALIDATION;
    case 401:
      return MESSAGES.ERROR.UNAUTHORIZED;
    case 403:
      return MESSAGES.ERROR.FORBIDDEN;
    case 404:
      return MESSAGES.ERROR.NOT_FOUND;
    case 500:
      return MESSAGES.ERROR.SERVER;
    default:
      return MESSAGES.ERROR.UNKNOWN;
  }
};

// Utility function to handle axios errors
const handleAxiosError = (error: any): string => {
  if (error.code === 'ECONNABORTED') {
    return MESSAGES.ERROR.TIMEOUT;
  }
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return MESSAGES.ERROR.NETWORK;
  }
  return getStatusMessage(error.response?.status || 500);
};

// Get project card color by project ID
export const getProjectCardColor = async (projectId: number | string): Promise<ProjectCardColor> => {
  try {
    // Validate project ID
    if (!projectId) {
      throw new Error(MESSAGES.VALIDATION.PROJECT_ID_REQUIRED);
    }

    const projectIdStr = typeof projectId === 'number' ? projectId.toString() : projectId;
    
    console.log(`Fetching project card color for project ID: ${projectIdStr}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/project-card-color/${projectIdStr}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Project card color API response:', response.data);

    if (response.data && response.data.data) {
      const item = response.data.data;
      console.log('Project card color integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_COLOR);
      return {
        projectId: item.projectId || parseInt(projectIdStr),
        projectName: item.projectName,
        availableRiskLevels: item.availableRiskLevels,
        projectCardColor: item.projectCardColor || 'bg-gradient-to-r from-gray-400 to-gray-500',
        color: item.projectCardColor || '#6b7280', // For backward compatibility
        backgroundColor: item.backgroundColor,
        borderColor: item.borderColor,
        textColor: item.textColor,
        lastUpdated: new Date().toISOString(),
        status: item.status || 'success',
        description: `Project card color: ${item.projectCardColor}`,
      };
    } else if (response.data) {
      // Handle direct response without data wrapper
      const item = response.data;
      console.log('Project card color integration success: Direct response');
      return {
        projectId: item.projectId || parseInt(projectIdStr),
        projectName: item.projectName,
        availableRiskLevels: item.availableRiskLevels,
        projectCardColor: item.projectCardColor || 'bg-gradient-to-r from-gray-400 to-gray-500',
        color: item.projectCardColor || '#6b7280', // For backward compatibility
        backgroundColor: item.backgroundColor,
        borderColor: item.borderColor,
        textColor: item.textColor,
        lastUpdated: new Date().toISOString(),
        status: item.status || 'success',
        description: `Project card color: ${item.projectCardColor}`,
      };
    } else {
      throw new Error(MESSAGES.ERROR.NOT_FOUND);
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Project card color integration error:', error);
    throw new Error(errorMessage);
  }
};

// Get project card colors for multiple projects
export const getProjectCardColors = async (projectIds: (number | string)[]): Promise<ProjectCardColor[]> => {
  try {
    if (!projectIds || projectIds.length === 0) {
      return [];
    }

    console.log(`Fetching project card colors for ${projectIds.length} projects...`);
    
    const promises = projectIds.map(id => getProjectCardColor(id));
    const results = await Promise.allSettled(promises);
    
    const successfulResults: ProjectCardColor[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.warn(`Failed to fetch project card color for project ${projectIds[index]}:`, result.reason);
        errors.push(`Project ${projectIds[index]}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some project card colors failed to fetch:', errors);
    }

    console.log(`Successfully fetched ${successfulResults.length} project card colors`);
    return successfulResults;
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Project card colors batch fetch error:', error);
    throw new Error(errorMessage);
  }
};

// Get all project card colors (if endpoint exists)
export const getAllProjectCardColors = async (): Promise<ProjectCardColor[]> => {
  try {
    console.log('Fetching all project card colors...');
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/project-card-color`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Full project card color API response:', response.data);

    if (response.data && Array.isArray(response.data.data)) {
      console.log('Project card colors integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_ALL_COLORS);
      return response.data.data.map((item: any) => ({
        projectId: item.projectId,
        projectName: item.projectName,
        availableRiskLevels: item.availableRiskLevels,
        projectCardColor: item.projectCardColor || 'bg-gradient-to-r from-gray-400 to-gray-500',
        color: item.projectCardColor || '#6b7280', // For backward compatibility
        backgroundColor: item.backgroundColor,
        borderColor: item.borderColor,
        textColor: item.textColor,
        lastUpdated: new Date().toISOString(),
        status: item.status || 'success',
        description: `Project card color: ${item.projectCardColor}`,
      }));
    } else if (Array.isArray(response.data)) {
      console.log('Project card colors integration success: Direct array response');
      return response.data.map((item: any) => ({
        projectId: item.projectId,
        projectName: item.projectName,
        availableRiskLevels: item.availableRiskLevels,
        projectCardColor: item.projectCardColor || 'bg-gradient-to-r from-gray-400 to-gray-500',
        color: item.projectCardColor || '#6b7280', // For backward compatibility
        backgroundColor: item.backgroundColor,
        borderColor: item.borderColor,
        textColor: item.textColor,
        lastUpdated: new Date().toISOString(),
        status: item.status || 'success',
        description: `Project card color: ${item.projectCardColor}`,
      }));
    } else {
      console.warn('API response does not contain project card colors array:', response.data);
      return [];
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Project card colors integration error:', error);
    throw new Error(errorMessage);
  }
};

// Utility function to get default project card color
export const getDefaultProjectCardColor = (projectId: number | string): ProjectCardColor => {
  return {
    projectId: typeof projectId === 'number' ? projectId : parseInt(projectId),
    projectCardColor: 'bg-gradient-to-r from-gray-400 to-gray-500', // Default gradient
    color: '#6b7280', // For backward compatibility
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    textColor: '#374151',
    lastUpdated: new Date().toISOString(),
    status: 'default',
    description: 'Default project card color',
  };
};

// Utility function to validate project card color
export const isValidProjectCardColor = (color: ProjectCardColor): boolean => {
  return Boolean(color && color.projectId && color.color);
};

// Utility function to get color by risk level (fallback)
export const getColorByRiskLevel = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'high':
    case 'critical':
      return '#ad0c0c'; // Red
    case 'medium':
      return '#e3b707'; // Yellow
    case 'low':
      return '#0b9c40'; // Green
    default:
      return '#6b7280'; // Gray
  }
}; 