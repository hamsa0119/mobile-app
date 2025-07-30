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

// Define the DefectRemarkRatio interface
export interface DefectRemarkRatio {
  projectId?: number;
  defectCount: number;
  remarkCount: number;
  ratio: string;
  percentage: number;
  category: string;
  color: string;
  status?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  lastUpdated?: string;
  description?: string;
}

// Define message constants for better error handling
export const MESSAGES = {
  SUCCESS: {
    FETCH_RATIO: 'Defect to remark ratio fetched successfully',
    FETCH_ALL_RATIOS: 'All defect to remark ratios fetched successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    SERVER: 'Server error. Please try again later.',
    NOT_FOUND: 'Defect to remark ratio not found.',
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

// Get defect to remark ratio by project ID
export const getDefectRemarkRatio = async (projectId: number | string): Promise<DefectRemarkRatio> => {
  try {
    // Validate project ID
    if (!projectId) {
      throw new Error(MESSAGES.VALIDATION.PROJECT_ID_REQUIRED);
    }

    const projectIdStr = typeof projectId === 'number' ? projectId.toString() : projectId;
    
    console.log(`Fetching defect to remark ratio for project ID: ${projectIdStr}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect-remark-ratio?projectId=${projectIdStr}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect to remark ratio API response:', response.data);

    if (response.data && response.data.data) {
      const item = response.data.data;
      console.log('Defect to remark ratio integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_RATIO);
      
      // Extract percentage from ratio string (e.g., "97.79%" -> 97.79)
      const percentage = parseFloat(item.ratio?.replace('%', '') || '0');
      
      return {
        projectId: item.projectId,
        defectCount: item.defects || 0,
        remarkCount: item.remarks || 0,
        ratio: item.ratio || '0%',
        percentage: percentage,
        category: item.category || 'Fair',
        color: item.color || 'yellow',
        status: item.category?.toLowerCase() || 'fair',
        lastUpdated: new Date().toISOString(),
        description: item.description,
      };
    } else if (response.data) {
      // Handle direct response without data wrapper
      const item = response.data;
      console.log('Defect to remark ratio integration success: Direct response');
      
      // Extract percentage from ratio string (e.g., "97.79%" -> 97.79)
      const percentage = parseFloat(item.ratio?.replace('%', '') || '0');
      
      return {
        projectId: item.projectId,
        defectCount: item.defects || 0,
        remarkCount: item.remarks || 0,
        ratio: item.ratio || '0%',
        percentage: percentage,
        category: item.category || 'Fair',
        color: item.color || 'yellow',
        status: item.category?.toLowerCase() || 'fair',
        lastUpdated: new Date().toISOString(),
        description: item.description,
      };
    } else {
      throw new Error(MESSAGES.ERROR.NOT_FOUND);
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect to remark ratio integration error:', error);
    throw new Error(errorMessage);
  }
};

// Get defect to remark ratios for multiple projects
export const getDefectRemarkRatios = async (projectIds: (number | string)[]): Promise<DefectRemarkRatio[]> => {
  try {
    if (!projectIds || projectIds.length === 0) {
      return [];
    }

    console.log(`Fetching defect to remark ratios for ${projectIds.length} projects...`);
    
    const promises = projectIds.map(id => getDefectRemarkRatio(id));
    const results = await Promise.allSettled(promises);
    
    const successfulResults: DefectRemarkRatio[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.warn(`Failed to fetch ratio for project ${projectIds[index]}:`, result.reason);
        errors.push(`Project ${projectIds[index]}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some defect to remark ratios failed to fetch:', errors);
    }

    console.log(`Successfully fetched ${successfulResults.length} defect to remark ratios`);
    return successfulResults;
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect to remark ratios batch fetch error:', error);
    throw new Error(errorMessage);
  }
};

// Get all defect to remark ratios (if endpoint exists)
export const getAllDefectRemarkRatios = async (): Promise<DefectRemarkRatio[]> => {
  try {
    console.log('Fetching all defect to remark ratios...');
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect-remark-ratio`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Full defect to remark ratio API response:', response.data);

    if (response.data && Array.isArray(response.data.data)) {
      console.log('Defect to remark ratios integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_ALL_RATIOS);
      return response.data.data.map((item: any) => {
        const percentage = parseFloat(item.ratio?.replace('%', '') || '0');
        return {
          projectId: item.projectId,
          defectCount: item.defects || 0,
          remarkCount: item.remarks || 0,
          ratio: item.ratio || '0%',
          percentage: percentage,
          category: item.category || 'Fair',
          color: item.color || 'yellow',
          status: item.category?.toLowerCase() || 'fair',
          lastUpdated: new Date().toISOString(),
          description: item.description,
        };
      });
    } else if (Array.isArray(response.data)) {
      console.log('Defect to remark ratios integration success: Direct array response');
      return response.data.map((item: any) => {
        const percentage = parseFloat(item.ratio?.replace('%', '') || '0');
        return {
          projectId: item.projectId,
          defectCount: item.defects || 0,
          remarkCount: item.remarks || 0,
          ratio: item.ratio || '0%',
          percentage: percentage,
          category: item.category || 'Fair',
          color: item.color || 'yellow',
          status: item.category?.toLowerCase() || 'fair',
          lastUpdated: new Date().toISOString(),
          description: item.description,
        };
      });
    } else {
      console.warn('API response does not contain defect to remark ratios array:', response.data);
      return [];
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect to remark ratios integration error:', error);
    throw new Error(errorMessage);
  }
};

// Utility function to calculate status based on percentage
export const calculateRatioStatus = (percentage: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
  if (percentage >= 0 && percentage < 20) {
    return 'excellent';
  } else if (percentage >= 20 && percentage < 40) {
    return 'good';
  } else if (percentage >= 40 && percentage < 60) {
    return 'fair';
  } else if (percentage >= 60 && percentage < 80) {
    return 'poor';
  } else {
    return 'critical';
  }
};

// Utility function to get status color
export const getRatioStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'low':
      return '#16a34a'; // Green
    case 'medium':
      return '#f59e0b'; // Yellow
    case 'high':
      return '#dc2626'; // Red
    case 'excellent':
      return '#16a34a'; // Green
    case 'good':
      return '#059669'; // Green
    case 'fair':
      return '#f59e0b'; // Yellow
    case 'poor':
      return '#ea580c'; // Orange
    case 'critical':
      return '#dc2626'; // Red
    default:
      return '#f59e0b'; // Yellow
  }
};

// Utility function to get status background color
export const getRatioStatusBackgroundColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'low':
      return '#f0fdf4'; // Light green
    case 'medium':
      return '#fffbeb'; // Light yellow
    case 'high':
      return '#fef2f2'; // Light red
    case 'excellent':
      return '#f0fdf4'; // Light green
    case 'good':
      return '#f0fdf4'; // Light green
    case 'fair':
      return '#fffbeb'; // Light yellow
    case 'poor':
      return '#fff7ed'; // Light orange
    case 'critical':
      return '#fef2f2'; // Light red
    default:
      return '#fffbeb'; // Light yellow
  }
};

// Utility function to validate ratio
export const isValidRatio = (ratio: number): boolean => {
  return ratio >= 0 && ratio <= 100;
};

// Utility function to get default defect to remark ratio
export const getDefaultDefectRemarkRatio = (projectId: number | string): DefectRemarkRatio => {
  return {
    projectId: typeof projectId === 'number' ? projectId : parseInt(projectId),
    defectCount: 0,
    remarkCount: 0,
    ratio: '0%',
    percentage: 0,
    category: 'Fair',
    color: 'yellow',
    status: 'fair',
    lastUpdated: new Date().toISOString(),
    description: 'No defect to remark ratio data available',
  };
};

// Utility function to format ratio for display
export const formatRatio = (ratio: number): string => {
  return `${ratio.toFixed(2)}%`;
};

// Utility function to format percentage for display
export const formatPercentage = (percentage: number): string => {
  return `${percentage.toFixed(2)}%`;
};

// Utility function to get ratio status with colors
export const getRatioStatus = (percentage: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  color: string;
  backgroundColor: string;
} => {
  const status = calculateRatioStatus(percentage);
  return {
    status,
    color: getRatioStatusColor(status),
    backgroundColor: getRatioStatusBackgroundColor(status),
  };
}; 