import axios from 'axios';
import { DefectNotification } from '../components/NotificationModal';

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

// Sample defect notifications for demonstration
const sampleDefectNotifications: DefectNotification[] = [
  {
    id: '1',
    title: 'Login page not responding to user input',
    severity: 'high',
    status: 'open',
    module: 'Authentication',
    assignedTo: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Dashboard charts not loading properly',
    severity: 'medium',
    status: 'fixed',
    module: 'Dashboard',
    assignedTo: 'Jane Smith',
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: '3',
    title: 'User profile update fails silently',
    severity: 'low',
    status: 'reopened',
    module: 'User Management',
    assignedTo: 'Mike Johnson',
    createdAt: '2024-01-13T09:15:00Z',
  },
  {
    id: '4',
    title: 'Email notifications not being sent',
    severity: 'high',
    status: 'open',
    module: 'Notifications',
    assignedTo: 'Sarah Wilson',
    createdAt: '2024-01-12T16:45:00Z',
  },
  {
    id: '5',
    title: 'Mobile app crashes on startup',
    severity: 'high',
    status: 'closed',
    module: 'Mobile App',
    assignedTo: 'Alex Brown',
    createdAt: '2024-01-11T11:30:00Z',
  },
];

// Main API function to get defect notifications
export const getDefectNotifications = async (projectId?: number): Promise<DefectNotification[]> => {
  try {
    console.log(`Fetching defect notifications for project ID: ${projectId}`);
    
    // For now, return sample data. In a real implementation, this would call the backend API
    // const response = await axios.get(`${VITE_BASE_URL}notifications/defects?projectId=${projectId}`, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   timeout: 10000,
    // });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Defect notifications fetched successfully:', sampleDefectNotifications.length, 'notifications found');
    
    return sampleDefectNotifications;
  } catch (error) {
    console.error('Error fetching defect notifications:', error);
    
    // Return empty array on error
    return [];
  }
};

// Function to get unread notifications count
export const getUnreadNotificationsCount = async (projectId?: number): Promise<number> => {
  try {
    const notifications = await getDefectNotifications(projectId);
    // Count notifications with 'open' or 'reopened' status as unread
    return notifications.filter(notification => 
      notification.status === 'open' || notification.status === 'reopened'
    ).length;
  } catch (error) {
    console.error('Error getting unread notifications count:', error);
    return 0;
  }
}; 