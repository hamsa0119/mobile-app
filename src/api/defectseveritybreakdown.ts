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

// Define the DefectSeverityBreakdown interface
export interface DefectSeverityBreakdown {
  severityId: number;
  severityName: string;
  totalDefects: number;
  openDefects: number;
  closedDefects: number;
  fixedDefects: number;
  reopenedDefects: number;
  newDefects: number;
  rejectedDefects: number;
  duplicateDefects: number;
  percentage: number;
}

// Default defect severity breakdown data
export const getDefaultDefectSeverityBreakdown = (): DefectSeverityBreakdown[] => {
  return [
    {
      severityId: 1,
      severityName: 'High',
      totalDefects: 124,
      openDefects: 10,
      closedDefects: 37,
      fixedDefects: 16,
      reopenedDefects: 10,
      newDefects: 53,
      rejectedDefects: 0,
      duplicateDefects: 3,
      percentage: 25.8,
    },
    {
      severityId: 2,
      severityName: 'Medium',
      totalDefects: 238,
      openDefects: 9,
      closedDefects: 61,
      fixedDefects: 31,
      reopenedDefects: 5,
      newDefects: 129,
      rejectedDefects: 2,
      duplicateDefects: 1,
      percentage: 49.6,
    },
    {
      severityId: 3,
      severityName: 'Low',
      totalDefects: 97,
      openDefects: 0,
      closedDefects: 23,
      fixedDefects: 10,
      reopenedDefects: 1,
      newDefects: 59,
      rejectedDefects: 1,
      duplicateDefects: 3,
      percentage: 20.2,
    },
  ];
};

// Helper function to format severity breakdown data
export const formatSeverityBreakdownData = (data: any): DefectSeverityBreakdown[] => {
  // Handle the case where data is the full response object with defectSummary array
  if (data && data.defectSummary && Array.isArray(data.defectSummary)) {
    console.log('Found defectSummary array in response:', data.defectSummary);
    return data.defectSummary.map((item: any, index: number) => {
      // Extract status counts from the nested statuses object
      const statuses = item.statuses || {};
      const reopenCount = statuses.REOPEN?.count || 0;
      const newCount = statuses.NEW?.count || 0;
      const openCount = statuses.OPEN?.count || 0;
      const fixedCount = statuses.FIXED?.count || 0;
      const closedCount = statuses.CLOSED?.count || 0;
      const rejectedCount = statuses.REJECTED?.count || 0;
      const duplicateCount = statuses.DUPLICATE?.count || 0;
      
      return {
        severityId: index + 1, // Use index as ID since it's not provided
        severityName: item.severity || 'Unknown Severity',
        totalDefects: item.total || 0,
        openDefects: openCount,
        closedDefects: closedCount,
        fixedDefects: fixedCount,
        reopenedDefects: reopenCount,
        newDefects: newCount,
        rejectedDefects: rejectedCount,
        duplicateDefects: duplicateCount,
        percentage: item.total ? ((item.total / data.totalDefects) * 100) : 0,
      };
    });
  }

  // Handle the case where data is directly an array
  if (Array.isArray(data)) {
    // Calculate total defects for percentage calculation
    const totalDefects = data.reduce((sum: number, d: any) => sum + (d.total || 0), 0);
    
    return data.map((item: any, index: number) => {
      // Extract status counts from the nested statuses object
      const statuses = item.statuses || {};
      const reopenCount = statuses.REOPEN?.count || 0;
      const newCount = statuses.NEW?.count || 0;
      const openCount = statuses.OPEN?.count || 0;
      const fixedCount = statuses.FIXED?.count || 0;
      const closedCount = statuses.CLOSED?.count || 0;
      const rejectedCount = statuses.REJECTED?.count || 0;
      const duplicateCount = statuses.DUPLICATE?.count || 0;
      
      return {
        severityId: index + 1, // Use index as ID since it's not provided
        severityName: item.severity || 'Unknown Severity',
        totalDefects: item.total || 0,
        openDefects: openCount,
        closedDefects: closedCount,
        fixedDefects: fixedCount,
        reopenedDefects: reopenCount,
        newDefects: newCount,
        rejectedDefects: rejectedCount,
        duplicateDefects: duplicateCount,
        percentage: item.total ? ((item.total / totalDefects) * 100) : 0,
      };
    });
  }

  console.warn('Unexpected data structure for severity breakdown:', data);
  return getDefaultDefectSeverityBreakdown();
};

// Helper function to get severity color
export const getSeverityColor = (severityName: string): string => {
  switch (severityName.toLowerCase()) {
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

// Helper function to get severity status
export const getSeverityStatus = (totalDefects: number): 'high' | 'medium' | 'low' => {
  if (totalDefects >= 100) return 'high';
  if (totalDefects >= 50) return 'medium';
  return 'low';
};

// Main API function to get defect severity breakdown data
export const getDefectSeverityBreakdown = async (projectId: number): Promise<DefectSeverityBreakdown[]> => {
  try {
    console.log(`Fetching defect severity breakdown data for project ID: ${projectId}`);
    
    const response = await axios.get(`${VITE_BASE_URL}dashboard/defect_severity_summary/${projectId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('Defect severity breakdown API response:', response.data);

    // Handle different response structures
    let severityData;
    if (response.data && response.data.data) {
      // Handle nested data structure: response.data.data
      severityData = response.data.data;
    } else if (response.data && response.data.defectSummary) {
      // Handle the case where data is in defectSummary property
      severityData = response.data;
    } else if (Array.isArray(response.data)) {
      severityData = response.data;
    } else {
      console.warn('Unexpected API response structure:', response.data);
      return getDefaultDefectSeverityBreakdown();
    }

    const formattedData = formatSeverityBreakdownData(severityData);
    console.log('Defect severity breakdown integration success:', formattedData.length, 'severity levels found');
    
    return formattedData;
  } catch (error) {
    console.error('Defect severity breakdown integration error:', error);
    
    // Return default data on error
    return getDefaultDefectSeverityBreakdown();
  }
}; 