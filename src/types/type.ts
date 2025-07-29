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