import axios from 'axios';
import { VITE_BASE_URL } from '@env';

// Define the DefectSeverityIndex interface
export interface DefectSeverityIndex {
  projectId?: number;
  totalDefects: number;
  actualSeverityScore: number;
  maximumSeverityScore: number;
  dsiPercentage: number;
  interpretation: string;
  severityIndex?: number; // For backward compatibility
  highSeverityCount?: number;
  mediumSeverityCount?: number;
  lowSeverityCount?: number;
  criticalSeverityCount?: number;
  severityScore?: number;
  riskLevel?: 'critical' | 'high' | 'medium' | 'low';
  lastUpdated?: string;
  status?: string;
  description?: string;
  recommendations?: string[];
}

// Define message constants for better error handling
export const MESSAGES = {
  SUCCESS: {
    FETCH_DSI: 'Defect severity index fetched successfully',
    FETCH_ALL_DSI: 'All defect severity indices fetched successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    SERVER: 'Server error. Please try again later.',
    NOT_FOUND: 'Defect severity index not found.',
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

// Get defect severity index by project ID
export const getDefectSeverityIndex = async (projectId: number | string): Promise<DefectSeverityIndex> => {
  try {
    // Validate project ID
    if (!projectId) {
      throw new Error(MESSAGES.VALIDATION.PROJECT_ID_REQUIRED);
    }

    const projectIdStr = typeof projectId === 'number' ? projectId.toString() : projectId;
    
    console.log(`Fetching defect severity index for project ID: ${projectIdStr}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/dsi/${projectIdStr}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect severity index API response:', response.data);

    if (response.data && response.data.data) {
      const item = response.data.data;
      console.log('Defect severity index integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_DSI);
      return {
        projectId: item.projectId,
        totalDefects: item.totalDefects || 0,
        actualSeverityScore: item.actualSeverityScore || 0,
        maximumSeverityScore: item.maximumSeverityScore || 0,
        dsiPercentage: item.dsiPercentage || 0,
        interpretation: item.interpretation || 'Unknown',
        severityIndex: item.dsiPercentage || 0, // Use dsiPercentage as severityIndex for backward compatibility
        riskLevel: item.interpretation?.toLowerCase().includes('high') ? 'high' : 
                  item.interpretation?.toLowerCase().includes('critical') ? 'critical' :
                  item.interpretation?.toLowerCase().includes('medium') ? 'medium' : 'low',
        lastUpdated: new Date().toISOString(),
        status: item.interpretation,
        description: `DSI: ${item.dsiPercentage}% - ${item.interpretation}`,
        recommendations: [],
      };
    } else if (response.data) {
      // Handle direct response without data wrapper
      const item = response.data;
      console.log('Defect severity index integration success: Direct response');
      return {
        projectId: item.projectId,
        totalDefects: item.totalDefects || 0,
        actualSeverityScore: item.actualSeverityScore || 0,
        maximumSeverityScore: item.maximumSeverityScore || 0,
        dsiPercentage: item.dsiPercentage || 0,
        interpretation: item.interpretation || 'Unknown',
        severityIndex: item.dsiPercentage || 0, // Use dsiPercentage as severityIndex for backward compatibility
        riskLevel: item.interpretation?.toLowerCase().includes('high') ? 'high' : 
                  item.interpretation?.toLowerCase().includes('critical') ? 'critical' :
                  item.interpretation?.toLowerCase().includes('medium') ? 'medium' : 'low',
        lastUpdated: new Date().toISOString(),
        status: item.interpretation,
        description: `DSI: ${item.dsiPercentage}% - ${item.interpretation}`,
        recommendations: [],
      };
    } else {
      throw new Error(MESSAGES.ERROR.NOT_FOUND);
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect severity index integration error:', error);
    throw new Error(errorMessage);
  }
};

// Get defect severity indices for multiple projects
export const getDefectSeverityIndices = async (projectIds: (number | string)[]): Promise<DefectSeverityIndex[]> => {
  try {
    if (!projectIds || projectIds.length === 0) {
      return [];
    }

    console.log(`Fetching defect severity indices for ${projectIds.length} projects...`);
    
    const promises = projectIds.map(id => getDefectSeverityIndex(id));
    const results = await Promise.allSettled(promises);
    
    const successfulResults: DefectSeverityIndex[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.warn(`Failed to fetch DSI for project ${projectIds[index]}:`, result.reason);
        errors.push(`Project ${projectIds[index]}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some defect severity indices failed to fetch:', errors);
    }

    console.log(`Successfully fetched ${successfulResults.length} defect severity indices`);
    return successfulResults;
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect severity indices batch fetch error:', error);
    throw new Error(errorMessage);
  }
};

// Get all defect severity indices (if endpoint exists)
export const getAllDefectSeverityIndices = async (): Promise<DefectSeverityIndex[]> => {
  try {
    console.log('Fetching all defect severity indices...');
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/dsi`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Full defect severity index API response:', response.data);

    if (response.data && Array.isArray(response.data.data)) {
      console.log('Defect severity indices integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_ALL_DSI);
      return response.data.data.map((item: any) => ({
        projectId: item.projectId,
        totalDefects: item.totalDefects || 0,
        actualSeverityScore: item.actualSeverityScore || 0,
        maximumSeverityScore: item.maximumSeverityScore || 0,
        dsiPercentage: item.dsiPercentage || 0,
        interpretation: item.interpretation || 'Unknown',
        severityIndex: item.dsiPercentage || 0, // Use dsiPercentage as severityIndex for backward compatibility
        riskLevel: item.interpretation?.toLowerCase().includes('high') ? 'high' : 
                  item.interpretation?.toLowerCase().includes('critical') ? 'critical' :
                  item.interpretation?.toLowerCase().includes('medium') ? 'medium' : 'low',
        lastUpdated: new Date().toISOString(),
        status: item.interpretation,
        description: `DSI: ${item.dsiPercentage}% - ${item.interpretation}`,
        recommendations: [],
      }));
    } else if (Array.isArray(response.data)) {
      console.log('Defect severity indices integration success: Direct array response');
      return response.data.map((item: any) => ({
        projectId: item.projectId,
        totalDefects: item.totalDefects || 0,
        actualSeverityScore: item.actualSeverityScore || 0,
        maximumSeverityScore: item.maximumSeverityScore || 0,
        dsiPercentage: item.dsiPercentage || 0,
        interpretation: item.interpretation || 'Unknown',
        severityIndex: item.dsiPercentage || 0, // Use dsiPercentage as severityIndex for backward compatibility
        riskLevel: item.interpretation?.toLowerCase().includes('high') ? 'high' : 
                  item.interpretation?.toLowerCase().includes('critical') ? 'critical' :
                  item.interpretation?.toLowerCase().includes('medium') ? 'medium' : 'low',
        lastUpdated: new Date().toISOString(),
        status: item.interpretation,
        description: `DSI: ${item.dsiPercentage}% - ${item.interpretation}`,
        recommendations: [],
      }));
    } else {
      console.warn('API response does not contain defect severity indices array:', response.data);
      return [];
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect severity indices integration error:', error);
    throw new Error(errorMessage);
  }
};

// Utility function to calculate risk level based on severity index
export const calculateRiskLevel = (severityIndex: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (severityIndex >= 80) {
    return 'critical';
  } else if (severityIndex >= 60) {
    return 'high';
  } else if (severityIndex >= 40) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Utility function to get risk level color
export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return '#dc2626'; // Red
    case 'high':
      return '#ea580c'; // Orange
    case 'medium':
      return '#f59e0b'; // Yellow
    case 'low':
      return '#16a34a'; // Green
    default:
      return '#f59e0b'; // Yellow
  }
};

// Utility function to get risk level background color
export const getRiskLevelBackgroundColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'critical':
      return '#fef2f2'; // Light red
    case 'high':
      return '#fff7ed'; // Light orange
    case 'medium':
      return '#fffbeb'; // Light yellow
    case 'low':
      return '#f0fdf4'; // Light green
    default:
      return '#fffbeb'; // Light yellow
  }
};

// Utility function to validate severity index
export const isValidSeverityIndex = (severityIndex: number): boolean => {
  return severityIndex >= 0 && severityIndex <= 100;
};

// Utility function to get default defect severity index
export const getDefaultDefectSeverityIndex = (projectId: number | string): DefectSeverityIndex => {
  return {
    projectId: typeof projectId === 'number' ? projectId : parseInt(projectId),
    totalDefects: 0,
    actualSeverityScore: 0,
    maximumSeverityScore: 0,
    dsiPercentage: 0,
    interpretation: 'No data available',
    severityIndex: 0, // For backward compatibility
    riskLevel: 'low',
    lastUpdated: new Date().toISOString(),
    status: 'No data available',
    description: 'No defect severity index data available',
    recommendations: [],
  };
};

// Utility function to format severity index for display
export const formatSeverityIndex = (severityIndex: number): string => {
  return severityIndex.toFixed(1);
};

// Utility function to get severity index status with colors
export const getSeverityIndexStatus = (severityIndex: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  color: string;
  backgroundColor: string;
} => {
  const riskLevel = calculateRiskLevel(severityIndex);
  
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  switch (riskLevel) {
    case 'critical':
      status = 'critical';
      break;
    case 'high':
      status = 'poor';
      break;
    case 'medium':
      status = 'fair';
      break;
    case 'low':
      status = severityIndex >= 20 ? 'good' : 'excellent';
      break;
    default:
      status = 'fair';
  }
  
  return {
    status,
    color: getRiskLevelColor(riskLevel),
    backgroundColor: getRiskLevelBackgroundColor(riskLevel),
  };
}; 