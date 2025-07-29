
import axios from 'axios';
import { VITE_BASE_URL } from '@env';

// Define the Project interface
export interface Project {
  id: number;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Backend specific fields
  projectId?: string;
  projectName?: string;
  projectStatus?: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
  country?: string;
  state?: string;
  email?: string;
  phoneNo?: string;
  userId?: number;
  userFirstName?: string;
  userLastName?: string;
  kloc?: number;
}


export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await axios.get(`${VITE_BASE_URL}projects`, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    console.log('Full API response:', response.data);
    // Handle array in response.data.data
    if (response.data && Array.isArray(response.data.data)) {
      console.log('Projects integration success:', response.data.message || 'Success');
      // Map API fields to expected frontend fields
      return response.data.data.map((item: any) => ({
        id: item.id,
        name: item.projectName, // adjust if your API uses a different field
        risk: item.riskLevel ? item.riskLevel.toLowerCase() : 'low', // normalize risk
        // ...add other fields as needed
      }));
    } else {
      console.warn('API response does not contain a projects array:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Projects integration error:', error);
    return [];
  }
};