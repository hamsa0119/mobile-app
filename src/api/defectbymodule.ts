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

// Define the DefectByModule interface based on actual API response
export interface DefectByModule {
  moduleId: number;
  name: string;
  value: number;
  percentage: number;
}

// Default defect by module data
export const getDefaultDefectByModule = (): DefectByModule[] => {
  return [
    {
      moduleId: 1,
      name: 'Dashboard',
      value: 19,
      percentage: 3.63,
    },
    {
      moduleId: 2,
      name: 'Employee',
      value: 74,
      percentage: 14.15,
    },
    {
      moduleId: 3,
      name: 'Bench',
      value: 59,
      percentage: 11.28,
    },
    {
      moduleId: 4,
      name: 'Configurations',
      value: 80,
      percentage: 15.3,
    },
    {
      moduleId: 5,
      name: 'Project Management',
      value: 68,
      percentage: 13.0,
    },
  ];
};

// Helper function to format module data
export const formatModuleData = (data: any): DefectByModule[] => {
  if (!Array.isArray(data)) {
    console.warn('Module data is not an array:', data);
    return getDefaultDefectByModule();
  }

  return data.map((item: any) => ({
    moduleId: item.moduleId || item.id || 0,
    name: item.name || 'Unknown Module',
    value: item.value || 0,
    percentage: item.percentage || 0,
  }));
};

// Helper function to get module status based on value
export const getModuleStatus = (value: number): 'high' | 'medium' | 'low' => {
  if (value >= 50) return 'high';
  if (value >= 20) return 'medium';
  return 'low';
};

// Helper function to get module status color
export const getModuleStatusColor = (status: 'high' | 'medium' | 'low'): string => {
  switch (status) {
    case 'high':
      return '#e53935';
    case 'medium':
      return '#fbbf24';
    case 'low':
      return '#22c55e';
    default:
      return '#6b7280';
  }
};

// Main API function to get defect by module data
export const getDefectByModule = async (projectId: number): Promise<DefectByModule[]> => {
  try {
    console.log(`Fetching defect by module data for project ID: ${projectId}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/module?projectId=${projectId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect by module API response:', response.data);

    // Handle different response structures
    let moduleData;
    if (response.data && response.data.data) {
      moduleData = response.data.data;
    } else if (Array.isArray(response.data)) {
      moduleData = response.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      return getDefaultDefectByModule();
    }

    const formattedData = formatModuleData(moduleData);
    console.log('Defect by module integration success:', formattedData.length, 'modules found');
    
    return formattedData;
  } catch (error) {
    console.error('Defect by module integration error:', error);
    
    // Return default data on error
    return getDefaultDefectByModule();
  }
}; 