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

// Define the DefectType interface
export interface DefectType {
  defectType: string;
  defectCount: number;
  percentage: number;
}

// Define the DefectTypeDistribution interface
export interface DefectTypeDistribution {
  projectId: number;
  totalDefectCount: number;
  defectTypes: DefectType[];
  mostCommonDefectType: string;
  mostCommonDefectCount: number;
}

// Default defect type distribution for fallback
export const getDefaultDefectTypeDistribution = (projectId: number): DefectTypeDistribution => {
  return {
    projectId,
    totalDefectCount: 0,
    defectTypes: [
      { defectType: 'Functionality', defectCount: 0, percentage: 0 },
      { defectType: 'UI', defectCount: 0, percentage: 0 },
      { defectType: 'Usability', defectCount: 0, percentage: 0 },
      { defectType: 'Validation', defectCount: 0, percentage: 0 },
    ],
    mostCommonDefectType: 'No Data',
    mostCommonDefectCount: 0,
  };
};

// Get defect type distribution for a specific project
export const getDefectTypeDistribution = async (projectId: number): Promise<DefectTypeDistribution> => {
  try {
    console.log(`Fetching defect type distribution for project ID: ${projectId}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect-type/${projectId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect type distribution API response:', response.data);

    if (response.data && response.data.status === 'success') {
      const data = response.data.data;
      
      // Parse the API response
      const defectTypes: DefectType[] = data.defectTypes || [];
      const totalDefectCount = data.totalDefectCount || 0;
      const mostCommonDefectType = data.mostCommonDefectType || 'No Data';
      const mostCommonDefectCount = data.mostCommonDefectCount || 0;

      const result: DefectTypeDistribution = {
        projectId,
        totalDefectCount,
        defectTypes,
        mostCommonDefectType,
        mostCommonDefectCount,
      };

      console.log('Defect type distribution parsed successfully:', result);
      return result;
    } else {
      console.warn('Defect type distribution API response indicates failure:', response.data);
      return getDefaultDefectTypeDistribution(projectId);
    }
  } catch (error) {
    console.error('Error fetching defect type distribution:', error);
    return getDefaultDefectTypeDistribution(projectId);
  }
}; 