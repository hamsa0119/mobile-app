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

// Define the DefectDensity interface
export interface DefectDensity {
  projectId?: number;
  defects: number;
  defectDensity: number;
  color: string;
  meaning: string;
  range: string;
  projectName?: string;
  clientName?: string;
  kloc: number;
  totalDefects?: number; // For backward compatibility
  totalLinesOfCode?: number; // For backward compatibility
  densityUnit?: string; // For backward compatibility
  riskLevel?: 'critical' | 'high' | 'medium' | 'low'; // For backward compatibility
  interpretation?: string; // For backward compatibility
  lastUpdated?: string;
  status?: string;
  description?: string;
  recommendations?: string[];
  // Change indicator fields
  previousValue?: number;
  changePercentage?: number;
  changeDirection?: 'up' | 'down' | 'stable';
  isImprovement?: boolean;
}

// Define message constants for better error handling
export const MESSAGES = {
  SUCCESS: {
    FETCH_DENSITY: 'Defect density fetched successfully',
    FETCH_ALL_DENSITIES: 'All defect densities fetched successfully',
  },
  ERROR: {
    NETWORK: 'Network error. Please check your connection.',
    TIMEOUT: 'Request timeout. Please try again.',
    SERVER: 'Server error. Please try again later.',
    NOT_FOUND: 'Defect density not found.',
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

// Get defect density by project ID
export const getDefectDensity = async (projectId: number | string): Promise<DefectDensity> => {
  try {
    // Validate project ID
    if (!projectId) {
      throw new Error(MESSAGES.VALIDATION.PROJECT_ID_REQUIRED);
    }

    const projectIdStr = typeof projectId === 'number' ? projectId.toString() : projectId;
    
    console.log(`Fetching defect density for project ID: ${projectIdStr}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect-density/${projectIdStr}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect density API response:', response.data);

    if (response.data && response.data.data) {
      const item = response.data.data;
      console.log('Defect density integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_DENSITY);

      // Mock previous value for demonstration (in real implementation, this would come from API or local storage)
      // Generate a realistic previous value that shows meaningful change
      const currentValue = item.defectDensity || 0;
      let mockPreviousValue: number | undefined;

      if (currentValue > 0) {
        // Create different scenarios based on project ID for demonstration
        const projectId = item.projectId || 1;
        const scenarios = [
          currentValue * 1.15, // 15% worse (improvement when current is lower)
          currentValue * 0.85, // 15% better (deterioration when current is higher)
          currentValue * 1.08, // 8% worse
          currentValue * 0.92, // 8% better
        ];
        // mockPreviousValue = scenarios[projectId % scenarios.length];
      }

      const changeData = calculateDefectDensityChange(currentValue, mockPreviousValue);

      return {
        projectId: item.projectId,
        defects: item.defects || 0,
        defectDensity: item.defectDensity || 0,
        color: item.color || 'Yellow',
        meaning: item.meaning || 'Unknown',
        range: item.range || '0.0 - 0.0',
        projectName: item.projectName,
        clientName: item.clientName,
        kloc: item.kloc || 0,
        totalDefects: item.defects || 0, // For backward compatibility
        totalLinesOfCode: item.kloc || 0, // For backward compatibility
        densityUnit: 'defects/KLOC', // For backward compatibility
        riskLevel: item.color?.toLowerCase().includes('red') ? 'critical' :
                  item.color?.toLowerCase().includes('orange') ? 'high' :
                  item.color?.toLowerCase().includes('yellow') ? 'medium' : 'low',
        interpretation: item.meaning || 'Unknown',
        lastUpdated: new Date().toISOString(),
        status: item.meaning,
        description: `Defect Density: ${item.defectDensity} defects/KLOC - ${item.meaning}`,
        recommendations: [],
        // Change indicator data
        previousValue: mockPreviousValue,
        changePercentage: changeData.changePercentage,
        changeDirection: changeData.changeDirection,
        isImprovement: changeData.isImprovement,
      };
    } else if (response.data) {
      // Handle direct response without data wrapper
      const item = response.data;
      console.log('Defect density integration success: Direct response');

      // Mock previous value for demonstration (in real implementation, this would come from API or local storage)
      // Generate a realistic previous value that shows meaningful change
      const currentValue = item.defectDensity || 0;
      let mockPreviousValue: number | undefined;

      if (currentValue > 0) {
        // Create different scenarios based on project ID for demonstration
        const projectId = item.projectId || 1;
        const scenarios = [
          currentValue * 1.15, // 15% worse (improvement when current is lower)
          currentValue * 0.85, // 15% better (deterioration when current is higher)
          currentValue * 1.08, // 8% worse
          currentValue * 0.92, // 8% better
        ];
        mockPreviousValue = scenarios[projectId % scenarios.length];
      }

      const changeData = calculateDefectDensityChange(currentValue, mockPreviousValue);

      return {
        projectId: item.projectId,
        defects: item.defects || 0,
        defectDensity: item.defectDensity || 0,
        color: item.color || 'Yellow',
        meaning: item.meaning || 'Unknown',
        range: item.range || '0.0 - 0.0',
        projectName: item.projectName,
        clientName: item.clientName,
        kloc: item.kloc || 0,
        totalDefects: item.defects || 0, // For backward compatibility
        totalLinesOfCode: item.kloc || 0, // For backward compatibility
        densityUnit: 'defects/KLOC', // For backward compatibility
        riskLevel: item.color?.toLowerCase().includes('red') ? 'critical' :
                  item.color?.toLowerCase().includes('orange') ? 'high' :
                  item.color?.toLowerCase().includes('yellow') ? 'medium' : 'low',
        interpretation: item.meaning || 'Unknown',
        lastUpdated: new Date().toISOString(),
        status: item.meaning,
        description: `Defect Density: ${item.defectDensity} defects/KLOC - ${item.meaning}`,
        recommendations: [],
        // Change indicator data
        previousValue: mockPreviousValue,
        changePercentage: changeData.changePercentage,
        changeDirection: changeData.changeDirection,
        isImprovement: changeData.isImprovement,
      };
    } else {
      throw new Error(MESSAGES.ERROR.NOT_FOUND);
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect density integration error:', error);
    throw new Error(errorMessage);
  }
};

// Get defect densities for multiple projects
export const getDefectDensities = async (projectIds: (number | string)[]): Promise<DefectDensity[]> => {
  try {
    if (!projectIds || projectIds.length === 0) {
      return [];
    }

    console.log(`Fetching defect densities for ${projectIds.length} projects...`);
    
    const promises = projectIds.map(id => getDefectDensity(id));
    const results = await Promise.allSettled(promises);
    
    const successfulResults: DefectDensity[] = [];
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResults.push(result.value);
      } else {
        console.warn(`Failed to fetch defect density for project ${projectIds[index]}:`, result.reason);
        errors.push(`Project ${projectIds[index]}: ${result.reason}`);
      }
    });

    if (errors.length > 0) {
      console.warn('Some defect densities failed to fetch:', errors);
    }

    console.log(`Successfully fetched ${successfulResults.length} defect densities`);
    return successfulResults;
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect densities batch fetch error:', error);
    throw new Error(errorMessage);
  }
};

// Get all defect densities (if endpoint exists)
export const getAllDefectDensities = async (): Promise<DefectDensity[]> => {
  try {
    console.log('Fetching all defect densities...');
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect-density`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Full defect density API response:', response.data);

    if (response.data && Array.isArray(response.data.data)) {
      console.log('Defect densities integration success:', response.data.message || MESSAGES.SUCCESS.FETCH_ALL_DENSITIES);
      return response.data.data.map((item: any) => ({
        projectId: item.projectId,
        defects: item.defects || 0,
        defectDensity: item.defectDensity || 0,
        color: item.color || 'Yellow',
        meaning: item.meaning || 'Unknown',
        range: item.range || '0.0 - 0.0',
        projectName: item.projectName,
        clientName: item.clientName,
        kloc: item.kloc || 0,
        totalDefects: item.defects || 0, // For backward compatibility
        totalLinesOfCode: item.kloc || 0, // For backward compatibility
        densityUnit: 'defects/KLOC', // For backward compatibility
        riskLevel: item.color?.toLowerCase().includes('red') ? 'critical' : 
                  item.color?.toLowerCase().includes('orange') ? 'high' :
                  item.color?.toLowerCase().includes('yellow') ? 'medium' : 'low',
        interpretation: item.meaning || 'Unknown',
        lastUpdated: new Date().toISOString(),
        status: item.meaning,
        description: `Defect Density: ${item.defectDensity} defects/KLOC - ${item.meaning}`,
        recommendations: [],
      }));
    } else if (Array.isArray(response.data)) {
      console.log('Defect densities integration success: Direct array response');
      return response.data.map((item: any) => ({
        projectId: item.projectId,
        defects: item.defects || 0,
        defectDensity: item.defectDensity || 0,
        color: item.color || 'Yellow',
        meaning: item.meaning || 'Unknown',
        range: item.range || '0.0 - 0.0',
        projectName: item.projectName,
        clientName: item.clientName,
        kloc: item.kloc || 0,
        totalDefects: item.defects || 0, // For backward compatibility
        totalLinesOfCode: item.kloc || 0, // For backward compatibility
        densityUnit: 'defects/KLOC', // For backward compatibility
        riskLevel: item.color?.toLowerCase().includes('red') ? 'critical' : 
                  item.color?.toLowerCase().includes('orange') ? 'high' :
                  item.color?.toLowerCase().includes('yellow') ? 'medium' : 'low',
        interpretation: item.meaning || 'Unknown',
        lastUpdated: new Date().toISOString(),
        status: item.meaning,
        description: `Defect Density: ${item.defectDensity} defects/KLOC - ${item.meaning}`,
        recommendations: [],
      }));
    } else {
      console.warn('API response does not contain defect densities array:', response.data);
      return [];
    }
  } catch (error) {
    const errorMessage = handleAxiosError(error);
    console.error('Defect densities integration error:', error);
    throw new Error(errorMessage);
  }
};

// Utility function to calculate risk level based on defect density
export const calculateDensityRiskLevel = (defectDensity: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (defectDensity >= 10) {
    return 'critical';
  } else if (defectDensity >= 7) {
    return 'high';
  } else if (defectDensity >= 4) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Utility function to get risk level color
export const getDensityRiskLevelColor = (riskLevel: string): string => {
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
export const getDensityRiskLevelBackgroundColor = (riskLevel: string): string => {
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

// Utility function to validate defect density
export const isValidDefectDensity = (defectDensity: number): boolean => {
  return defectDensity >= 0;
};

// Utility function to get default defect density
export const getDefaultDefectDensity = (projectId: number | string): DefectDensity => {
  return {
    projectId: typeof projectId === 'number' ? projectId : parseInt(projectId),
    defects: 0,
    defectDensity: 0,
    color: 'Yellow',
    meaning: 'No data available',
    range: '0.0 - 0.0',
    kloc: 0,
    totalDefects: 0, // For backward compatibility
    totalLinesOfCode: 0, // For backward compatibility
    densityUnit: 'defects/KLOC', // For backward compatibility
    riskLevel: 'low', // For backward compatibility
    interpretation: 'No data available', // For backward compatibility
    lastUpdated: new Date().toISOString(),
    status: 'No data available',
    description: 'No defect density data available',
    recommendations: [],
    // Change indicator data
    previousValue: undefined,
    changePercentage: 0,
    changeDirection: 'stable',
    isImprovement: false,
  };
};

// Utility function to format defect density for display
export const formatDefectDensity = (defectDensity: number): string => {
  return defectDensity.toFixed(2);
};

// Utility function to get defect density status with colors
export const getDefectDensityStatus = (defectDensity: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  color: string;
  backgroundColor: string;
} => {
  const riskLevel = calculateDensityRiskLevel(defectDensity);

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
      status = defectDensity >= 2 ? 'good' : 'excellent';
      break;
    default:
      status = 'fair';
  }

  return {
    status,
    color: getDensityRiskLevelColor(riskLevel),
    backgroundColor: getDensityRiskLevelBackgroundColor(riskLevel),
  };
};

// Utility function to calculate change indicators
export const calculateDefectDensityChange = (currentValue: number, previousValue?: number): {
  changePercentage: number;
  changeDirection: 'up' | 'down' | 'stable';
  isImprovement: boolean;
} => {
  if (!previousValue || previousValue === 0) {
    return {
      changePercentage: 0,
      changeDirection: 'stable',
      isImprovement: false,
    };
  }

  const changePercentage = ((currentValue - previousValue) / previousValue) * 100;
  const absChange = Math.abs(changePercentage);

  // Consider changes less than 1% as stable
  if (absChange < 1) {
    return {
      changePercentage: 0,
      changeDirection: 'stable',
      isImprovement: false,
    };
  }

  const changeDirection = changePercentage > 0 ? 'up' : 'down';
  // For defect density, lower values are better (improvement)
  const isImprovement = changeDirection === 'down';

  return {
    changePercentage: Math.abs(changePercentage),
    changeDirection,
    isImprovement,
  };
};

// Utility function to get change indicator color
export const getChangeIndicatorColor = (isImprovement: boolean, changeDirection: 'up' | 'down' | 'stable'): string => {
  if (changeDirection === 'stable') {
    return '#6b7280'; // Gray for stable
  }
  return isImprovement ? '#16a34a' : '#dc2626'; // Green for improvement, red for deterioration
};