import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  ImageBackground,
  Alert
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import Header from '../components/Header';
import { projectAPI } from '../service/api';

// Interface for project data based on actual API response
interface Project {
  id: string;
  client_name: string;
  country: string;
  description: string;
  email: string;
  end_date: string;
  kloc: number;
  phone_no: string;
  project_id: string;
  project_name: string;
  project_status: string;
  start_date: string;
  state: string;
  user_id: string;
  // Derived risk level based on project characteristics
  risk?: 'high' | 'medium' | 'low';
}

// Interface for project details
interface ProjectDetails {
  id: string;
  project_name: string;
  risk: 'high' | 'medium' | 'low';
  defectDensity: number;
  defectSeverityIndex: number;
  defectToRemarkRatio: number;
  defectsBySeverity: {
    high: any[];
    medium: any[];
    low: any[];
  };
  reopenedDefects: any[];
  defectsByType: any[];
  defectsByModule: any[];
  timeToFind: any[];
  timeToFix: any[];
}

// Function to determine risk level based on project data
  const calculateRiskLevel = (project: Project): 'high' | 'medium' | 'low' => {
    // Simple risk calculation based on KLOC and project status
    if (project.kloc > 100 || project.project_status === 'HIGH_RISK') {
      return 'high';
    } else if (project.kloc > 50 || project.project_status === 'MEDIUM_RISK') {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const getDefectDensityColor = (density: number, apiColor?: string): string => {
    // Use API color if available, otherwise calculate based on density
    if (apiColor) {
      switch (apiColor.toLowerCase()) {
        case 'green': return '#22c55e';
        case 'yellow': return '#fbbf24';
        case 'red': return '#dc2626';
        default: break;
      }
    }
    
    // Fallback to density-based calculation
    if (density <= 7) return '#22c55e'; // Green for low density
    if (density <= 10) return '#fbbf24'; // Yellow for medium density
    return '#dc2626'; // Red for high density
  };

// Default projects (fallback data)
const DEFAULT_PROJECTS: Project[] = [
  { 
    id: '1', 
    client_name: 'Acme Corp',
    country: 'USA',
    description: 'Hello',
    email: 'alpha@acme.com',
    end_date: '2024-02-20T02:20:00.000Z',
    kloc: 120.5,
    phone_no: '1112223333',
    project_id: 'P-2024-001',
    project_name: 'Alpha Platform',
    project_status: 'ACTIVE',
    start_date: '2024-01-20T00:00:00.000Z',
    state: 'CA',
    user_id: '1',
    risk: 'high'
  },
  { 
    id: '2', 
    client_name: 'Globex',
    country: 'UK',
    description: 'HII',
    email: 'beta@globex.com',
    end_date: '2024-03-10T03:30:00.000Z',
    kloc: 80,
    phone_no: '2223334444',
    project_id: 'P-2024-002',
    project_name: 'Beta Mobile App',
    project_status: 'ACTIVE',
    start_date: '2024-02-10T00:00:00.000Z',
    state: 'London',
    user_id: '2',
    risk: 'medium'
  },
];

const STATUS: Record<'high' | 'medium' | 'low', { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'High Risk', color: '#e53935', bg: '#fff5f5', border: '#b71c1c' },
  medium: { label: 'Medium Risk', color: '#fbbf24', bg: '#fffbe6', border: '#b45309' },
  low: { label: 'Low Risk', color: '#22c55e', bg: '#f0fff4', border: '#166534' },
};

const DEFECT_CARDS = [
  {
    key: 'high',
    title: 'Defects on High',
    total: 124,
    color: STATUS.high.color,
    border: STATUS.high.border,
    items: [
      { label: 'REOPEN', color: '#e53935', value: 10 },
      { label: 'NEW', color: '#2563eb', value: 53 },
      { label: 'OPEN', color: '#eab308', value: 5 },
      { label: 'FIXED', color: '#22c55e', value: 16 },
      { label: 'CLOSED', color: '#166534', value: 37 },
      { label: 'REJECTED', color: '#b91c1c', value: 0 },
      { label: 'DUPLICATE', color: '#6b7280', value: 3 },
    ],
  },
  {
    key: 'medium',
    title: 'Defects on Medium',
    total: 238,
    color: STATUS.medium.color,
    border: STATUS.medium.border,
    items: [
      { label: 'REOPEN', color: '#e53935', value: 5 },
      { label: 'NEW', color: '#2563eb', value: 129 },
      { label: 'OPEN', color: '#eab308', value: 9 },
      { label: 'FIXED', color: '#22c55e', value: 31 },
      { label: 'CLOSED', color: '#166534', value: 61 },
      { label: 'REJECTED', color: '#b91c1c', value: 2 },
      { label: 'DUPLICATE', color: '#6b7280', value: 1 },
    ],
  },
  {
    key: 'low',
    title: 'Defects on Low',
    total: 97,
    color: STATUS.low.color,
    border: STATUS.low.border,
    items: [
      { label: 'REOPEN', color: '#e53935', value: 1 },
      { label: 'NEW', color: '#2563eb', value: 59 },
      { label: 'OPEN', color: '#eab308', value: 0 },
      { label: 'FIXED', color: '#22c55e', value: 10 },
      { label: 'CLOSED', color: '#166534', value: 23 },
      { label: 'REJECTED', color: '#b91c1c', value: 1 },
      { label: 'DUPLICATE', color: '#6b7280', value: 3 },
    ],
  },
];

const METRIC_CARDS = [
  {
    key: 'density',
    title: 'Defect Density',
    value: '0.00',
    label: 'Defect Density:',
    color: '#22c55e',
    type: 'gauge',
  },
  {
    key: 'severity',
    title: 'Defect Severity Index',
    value: '45',
    label: 'Weighted severity score (higher = more severe defects)',
    color: '#fbbf24',
    type: 'score',
  },
  {
    key: 'ratio',
    title: 'Defect to Remark Ratio',
    value: '97.82%',
    label: 'Defect to Remark Ratio (%)',
    color: '#fbbf24',
    type: 'ratio',
    badge: 'Medium',
  },
];

const PIE_CARDS = [
  {
    key: 'reopened',
    title: 'Defects Reopened Multiple Times',
    chartColors: ['#3b82f6', '#fbbf24', '#ef4444', '#8b5cf6'],
    chartData: [5, 1, 1, 1],
    legend: [
      { color: '#3b82f6', label: '2 times: 5 (62.5%)' },
      { color: '#fbbf24', label: '4 times: 1 (12.5%)' },
      { color: '#ef4444', label: '5 times: 1 (12.5%)' },
      { color: '#8b5cf6', label: '>5 times: 1 (12.5%)' },
    ],
  },
  {
    key: 'type',
    title: 'Defect Distribution by Type',
    chartColors: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444'],
    chartData: [245, 81, 30, 103],
    legend: [
      { color: '#3b82f6', label: 'Functionality: 245 (53.4%)' },
      { color: '#10b981', label: 'UI: 81 (17.6%)' },
      { color: '#fbbf24', label: 'Usability: 30 (6.5%)' },
      { color: '#ef4444', label: 'Validation: 103 (22.4%)' },
    ],
    total: 459,
    mostCommon: { value: 245, label: 'Functionality' },
  },
  {
    key: 'module',
    title: 'Defects by Module',
    chartColors: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'],
    chartData: [89, 76, 54, 43, 32, 25],
    legend: [
      { color: '#3b82f6', label: 'Authentication: 89 (27.9%)' },
      { color: '#10b981', label: 'User Management: 76 (23.8%)' },
      { color: '#fbbf24', label: 'Reporting: 54 (16.9%)' },
      { color: '#ef4444', label: 'Dashboard: 43 (13.5%)' },
      { color: '#8b5cf6', label: 'Settings: 32 (10.0%)' },
      { color: '#f59e0b', label: 'API: 25 (7.8%)' },
    ],
    total: 319,
    mostCommon: { value: 89, label: 'Authentication' },
  },
];

const CHART_CARDS = [
  {
    key: 'reopened',
    title: 'Defects Reopened Multiple Times',
    type: 'pie',
    legend: [
      { color: '#3b82f6', label: '2 times: 5 (62.5%)' },
      { color: '#fbbf24', label: '4 times: 1 (12.5%)' },
      { color: '#ef4444', label: '5 times: 1 (12.5%)' },
      { color: '#8b5cf6', label: '>5 times: 1 (12.5%)' },
    ],
  },
  {
    key: 'type',
    title: 'Defect Distribution by Type',
    type: 'pie',
    legend: [
      { color: '#3b82f6', label: 'Functionality: 245 (53.4%)' },
      { color: '#10b981', label: 'UI: 81 (17.6%)' },
      { color: '#fbbf24', label: 'Usability: 30 (6.5%)' },
      { color: '#ef4444', label: 'Validation: 103 (22.4%)' },
    ],
    total: 459,
    mostCommon: { value: 245, label: 'Functionality' },
  },
  {
    key: 'find',
    title: 'Time to Find Defects',
    type: 'line',
  },
  {
    key: 'fix',
    title: 'Time to Fix Defects',
    type: 'line',
  },
  {
    key: 'module',
    title: 'Defects by Module',
    type: 'pie',
    legend: [
      { color: '#3b82f6', label: 'Authentication: 89 (27.9%)' },
      { color: '#10b981', label: 'User Management: 76 (23.8%)' },
      { color: '#fbbf24', label: 'Reporting: 54 (16.9%)' },
      { color: '#ef4444', label: 'Dashboard: 43 (13.5%)' },
      { color: '#8b5cf6', label: 'Settings: 32 (10.0%)' },
      { color: '#f59e0b', label: 'API: 25 (7.8%)' },
    ],
    total: 319,
    mostCommon: { value: 89, label: 'Authentication' },
  },
];

// Line chart data matching the screenshot
const timeToFindDefectsData = [
  { value: 2, label: 'Day 1' },
  { value: 3, label: 'Day 2' },
  { value: 1, label: 'Day 3' },
  { value: 4, label: 'Day 4' },
  { value: 2, label: 'Day 5' },
  { value: 3, label: 'Day 6' },
  { value: 2, label: 'Day 7' },
  { value: 1, label: 'Day 8' },
  { value: 1, label: 'Day 10' },
];

const timeToFixDefectsData = [
  { value: 1, label: 'Day 1' },
  { value: 2, label: 'Day 2' },
  { value: 3, label: 'Day 3' },
  { value: 2, label: 'Day 4' },
  { value: 4, label: 'Day 5' },
  { value: 3, label: 'Day 6' },
  { value: 2, label: 'Day 7' },
  { value: 1, label: 'Day 8' },
  { value: 2, label: 'Day 10' },
];

// Sample data for reopened defects - each category shows only its specific defects
const REOPENED_DEFECTS_DATA = {
  2: [
    {
      id: 'D-101',
      assignedTo: 'Alice',
      reporter: 'Bob',
      releaseNumber: 'R1.2'
    },
    {
      id: 'D-102',
      assignedTo: 'Charlie',
      reporter: 'Dave',
      releaseNumber: 'R1.2'
    },
    {
      id: 'D-103',
      assignedTo: 'Eve',
      reporter: 'Frank',
      releaseNumber: 'R1.3'
    },
    {
      id: 'D-104',
      assignedTo: 'Grace',
      reporter: 'Heidi',
      releaseNumber: 'R1.3'
    },
    {
      id: 'D-105',
      assignedTo: 'Ivan',
      reporter: 'Judy',
      releaseNumber: 'R1.4'
    }
  ],
  4: [
    {
      id: 'D-201',
      assignedTo: 'Kevin',
      reporter: 'Linda',
      releaseNumber: 'R1.5'
    }
  ],
  5: [
    {
      id: 'D-301',
      assignedTo: 'Mike',
      reporter: 'Nancy',
      releaseNumber: 'R1.6'
    }
  ],
  6: [
    {
      id: 'D-401',
      assignedTo: 'Oscar',
      reporter: 'Paula',
      releaseNumber: 'R1.7'
    }
  ]
};

const { width } = Dimensions.get('window');
const isSmallScreen = width < 500;

// Custom LineChart Component
const CustomLineChart = ({ data, color, width: chartWidth, height }: any) => {
  const maxValue = Math.max(...data.map((item: any) => item.value));
  const chartHeight = height - 40; // Leave space for labels
  const chartWidthInner = chartWidth - 60; // Leave space for Y-axis labels

  return (
    <View style={{ width: chartWidth, height }}>
      {/* Chart Area */}
      <View style={{ flexDirection: 'row', height: chartHeight + 20 }}>
        {/* Y-Axis */}
        <View style={{ width: 30, height: chartHeight, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 5 }}>
          {[5, 4, 3, 2, 1, 0].map(value => (
            <Text key={value} style={{ fontSize: 10, color: '#6b7280' }}>{value}</Text>
          ))}
        </View>

        {/* Chart Container */}
        <View style={{ flex: 1, height: chartHeight, position: 'relative', backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e7eb' }}>
          {/* Horizontal Grid Lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: (i / 5) * chartHeight,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: '#d1d5db',
                borderStyle: 'dotted',
              }}
            />
          ))}

          {/* Vertical Grid Lines */}
          {data.map((_: any, index: number) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: (index / (data.length - 1)) * chartWidthInner,
                top: 0,
                bottom: 0,
                width: 1,
                backgroundColor: '#d1d5db',
                borderStyle: 'dotted',
              }}
            />
          ))}

          {/* Data Points and Lines */}
          {data.map((point: any, index: number) => {
            const x = (index / (data.length - 1)) * chartWidthInner;
            const y = chartHeight - (point.value / 5) * chartHeight;

            return (
              <View key={index}>
                {/* Data Point */}
                <View
                  style={{
                    position: 'absolute',
                    left: x - 4,
                    top: y - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: color,
                    borderWidth: 2,
                    borderColor: '#fff',
                  }}
                />

                {/* Line to next point */}
                {index < data.length - 1 && (
                  <View
                    style={{
                      position: 'absolute',
                      left: x,
                      top: y,
                      width: Math.sqrt(
                        Math.pow((chartWidthInner / (data.length - 1)), 2) +
                        Math.pow(((data[index + 1].value / 5) * chartHeight) - (point.value / 5) * chartHeight, 2)
                      ),
                      height: 2,
                      backgroundColor: color,
                      transformOrigin: '0 50%',
                      transform: [
                        {
                          rotate: `${Math.atan2(
                            ((data[index + 1].value / 5) * chartHeight) - (point.value / 5) * chartHeight,
                            chartWidthInner / (data.length - 1)
                          )}rad`
                        }
                      ],
                    }}
                  />
                )}
              </View>

            );
          })}
        </View>
      </View>

      {/* X-Axis Labels */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 35, paddingRight: 5, marginTop: 5 }}>
        {data.map((point: any, index: number) => (
          <Text key={index} style={{ fontSize: 10, color: '#6b7280', textAlign: 'center' }}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

interface ProjectDetailsProps {
  onBack?: () => void;
  selectedProject?: string;
  onLogout?: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ onBack, selectedProject, onLogout }) => {
  // State for defect severity index
  const [defectSeverityIndex, setDefectSeverityIndex] = useState<any>(null);
  const [defectSeverityIndexLoading, setDefectSeverityIndexLoading] = useState(false);
  const [defectSeverityIndexError, setDefectSeverityIndexError] = useState<string | null>(null);

  // Defect Severity Summary state/hooks
  const [severitySummary, setSeveritySummary] = useState<any>(null);
  const [severitySummaryLoading, setSeveritySummaryLoading] = useState(false);
  const [severitySummaryError, setSeveritySummaryError] = useState<string | null>(null);

  // Fetch defect severity index when current project changes
  useEffect(() => {
    const fetchDefectSeverityIndex = async () => {
      if (!currentProject?.id) return;
      setDefectSeverityIndexLoading(true);
      setDefectSeverityIndexError(null);
      try {
        const data = await projectAPI.getDefectSeverityIndex(currentProject.id);
        setDefectSeverityIndex(data);
        console.log('Defect Severity Index:', data);
      } catch (err) {
        setDefectSeverityIndexError('Failed to load defect severity index');
        setDefectSeverityIndex(null);
      } finally {
        setDefectSeverityIndexLoading(false);
      }
    };
    fetchDefectSeverityIndex();
  }, [currentProject]);

  // Fetch defect severity summary when current project changes
  useEffect(() => {
    if (!currentProject?.id) return;
    setSeveritySummaryLoading(true);
    setSeveritySummaryError(null);
    projectAPI.getDefectSeveritySummary(currentProject.id)
      .then(res => setSeveritySummary(res?.data || null))
      .catch(() => setSeveritySummaryError('Failed to load defect severity summary'))
      .finally(() => setSeveritySummaryLoading(false));
  }, [currentProject]);

  // Find the index of the selected project, default to 0 if not found
  const initialSelectedIndex = selectedProject ? DEFAULT_PROJECTS.findIndex(p => p.project_name === selectedProject) : 0;
  const [selected, setSelected] = useState(initialSelectedIndex >= 0 ? initialSelectedIndex : 0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [reopenedModalVisible, setReopenedModalVisible] = useState(false);
  const [selectedReopenedData, setSelectedReopenedData] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [defectDensity, setDefectDensity] = useState<number | null>(null);
  const [defectDensityData, setDefectDensityData] = useState<any>(null);
  const [defectDensityLoading, setDefectDensityLoading] = useState(false);
  const [defectRemarkRatio, setDefectRemarkRatio] = useState<number | null>(null);
  const [defectRemarkRatioData, setDefectRemarkRatioData] = useState<any>(null);
  const [defectRemarkRatioLoading, setDefectRemarkRatioLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentProject = projects[selected];
  // Fetch defect severity index when current project changes
  useEffect(() => {
    const fetchDefectSeverityIndex = async () => {
      if (!currentProject?.id) return;
      setDefectSeverityIndexLoading(true);
      setDefectSeverityIndexError(null);
      try {
        const data = await projectAPI.getDefectSeverityIndex(currentProject.id);
        setDefectSeverityIndex(data);
        console.log('Defect Severity Index:', data);
      } catch (err) {
        setDefectSeverityIndexError('Failed to load defect severity index');
        setDefectSeverityIndex(null);
      } finally {
        setDefectSeverityIndexLoading(false);
      }
    };
    fetchDefectSeverityIndex();
  }, [currentProject]);
  const statusKey = currentProject?.risk as 'high' | 'medium' | 'low';
  const statusObj = STATUS[statusKey];

  // Fetch projects and details from API
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (currentProject?.id) {
  // fetchProjectDetails(currentProject.id); // Disabled to ignore 404 error
      fetchDefectDensity(currentProject.id);
      fetchDefectRemarkRatio(currentProject.id);
    }
  }, [currentProject]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectAPI.getAllProjects();
      if (data && Array.isArray(data)) {
        // Add risk calculation to each project
        const projectsWithRisk = data.map(project => ({
          ...project,
          risk: calculateRiskLevel(project)
        }));
        setProjects(projectsWithRisk);
      } else {
        console.warn('API not available, using default data');
        setProjects(DEFAULT_PROJECTS);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects');
      setProjects(DEFAULT_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const data = await projectAPI.getProjectDetails(projectId);
      if (data) {
        setProjectDetails(data);
      }
    } catch (err) {
      console.error('Failed to fetch project details:', err);
      // Don't show alert for details failure, just log it
    }
  };

  const fetchDefectDensity = async (projectId: string) => {
    setDefectDensityLoading(true);
    try {
      const response = await projectAPI.getDefectDensity(projectId);
      if (response && response.status === 'success' && response.data) {
        const { defectDensity, color, meaning, range, defects, kloc } = response.data;
        setDefectDensity(defectDensity);
        setDefectDensityData(response.data);
        console.log('Defect density data:', { defectDensity, color, meaning, range, defects, kloc });
      } else {
        console.warn('Invalid defect density response:', response);
        setDefectDensity(null);
        setDefectDensityData(null);
      }
    } catch (err) {
      console.error('Failed to fetch defect density:', err);
      setDefectDensity(null);
      setDefectDensityData(null);
    } finally {
      setDefectDensityLoading(false);
    }
  };

  const fetchDefectRemarkRatio = async (projectId: string) => {
    setDefectRemarkRatioLoading(true);
    try {
      const response = await projectAPI.getDefectRemarkRatio(projectId);
      if (response && response.status === 'success' && response.data) {
        const { ratioPct, color, meaning, range, totalDefects, validDefects } = response.data;
        setDefectRemarkRatio(ratioPct);
        setDefectRemarkRatioData(response.data);
        console.log('Defect remark ratio data:', { ratioPct, color, meaning, range, totalDefects, validDefects });
      } else {
        console.warn('Invalid defect remark ratio response:', response);
        // Use fallback data when API is not available
        setDefectRemarkRatio(100);
        setDefectRemarkRatioData({
          ratioPct: 100,
          color: 'Green',
          meaning: 'Low',
          range: '98%–100%',
          totalDefects: 2,
          validDefects: 2
        });
      }
    } catch (err) {
      console.error('Failed to fetch defect remark ratio:', err);
      // Use fallback data when API fails
      setDefectRemarkRatio(100);
      setDefectRemarkRatioData({
        ratioPct: 100,
        color: 'Green',
        meaning: 'Low',
        range: '98%–100%',
        totalDefects: 2,
        validDefects: 2
      });
    } finally {
      setDefectRemarkRatioLoading(false);
    }
  };

  const openModal = (card: any) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  const openReopenedModal = (timesReopened: number) => {
    setSelectedReopenedData({
      timesReopened,
      defects: REOPENED_DEFECTS_DATA[timesReopened as keyof typeof REOPENED_DEFECTS_DATA] || []
    });
    setReopenedModalVisible(true);
  };

  const closeReopenedModal = () => {
    setReopenedModalVisible(false);
    setSelectedReopenedData(null);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <Header onLogout={onLogout} />
      <ImageBackground
        source={require('../../assert/foto8.jpg')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity style={styles.customBackButton} onPress={onBack}>
            <Svg width={44} height={44} viewBox="0 0 48 48">
              <Path
                d="M36 24H12M12 24l8-8M12 24l8 8"
                fill="none"
                stroke="rgba(237, 222, 201, 0.95)"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 24c8 0 16 0 16 0"
                fill="none"
                stroke="rgba(237, 222, 201, 0.95)"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
        {/* Project Selection */}
        <View style={styles.selectionWrap}>
          <Text style={[styles.selectionLabel, { color: '#03084a' }]}>Project Selection</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectionScroll}
            contentContainerStyle={styles.selectionScrollContent}
          >
            {projects.map((p, i) => (
              <TouchableOpacity
                key={p.id || p.project_name + i}
                style={[styles.projectBtn, selected === i && styles.projectBtnActive]}
                onPress={() => setSelected(i)}
              >
                <Text style={[styles.projectBtnText, selected === i && styles.projectBtnTextActive]}>{p.project_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Project Name and Status */}
        {loading ? (
          <View style={[styles.projectHeader, { backgroundColor: 'rgba(237, 222, 201, 0.95)' }]}>
            <Text style={[styles.projectName, { color: '#03084a' }]}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={[styles.projectHeader, { backgroundColor: 'rgba(237, 222, 201, 0.95)' }]}>
            <Text style={[styles.projectName, { color: '#dc2626' }]}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : currentProject ? (
          <View style={[styles.projectHeader, { backgroundColor: 'rgba(237, 222, 201, 0.95)' }]}>
            <Text style={[styles.projectName, { color: '#03084a' }]}>{currentProject.project_name}</Text>
            <View style={styles.statusWrap}>
              <Text style={[styles.statusBadge, { backgroundColor: statusObj.bg, color: statusObj.color, borderColor: statusObj.color }]}>{statusObj.label}</Text>
            </View>
          </View>
        ) : null}
        {/* Defect Severity Breakdown */}
        <Text style={[styles.sectionTitle, { color: '#fff' }]}>Defect Severity Breakdown</Text>
        <View style={styles.severityCardGroup}>
          {severitySummaryLoading ? (
            <Text style={{ color: '#374151', fontSize: 18, margin: 12 }}>Loading...</Text>
          ) : severitySummaryError ? (
            <Text style={{ color: '#dc2626', fontSize: 16, margin: 12 }}>{severitySummaryError}</Text>
          ) : severitySummary && Array.isArray(severitySummary.breakdown) ? (
            severitySummary.breakdown.map((card: any) => (
              <View
                key={card.severity}
                style={[
                  styles.severityCard,
                  {
                    borderColor: card.color || '#888',
                    backgroundColor: '#fff',
                    marginVertical: 6,
                    marginHorizontal: 8,
                    minHeight: 50,
                    maxHeight: 220,
                    width: '98%',
                    alignSelf: 'center',
                    borderWidth: 3,
                  },
                ]}
              >
                <View style={styles.severityCardHeader}>
                  <Text style={[styles.severityCardTitle, { color: card.color || '#222' }]}>Defects on {card.severity?.charAt(0).toUpperCase() + card.severity?.slice(1)}</Text>
                  <Text style={styles.severityCardTotal}>Total: <Text style={{ fontWeight: 'bold' }}>{card.total}</Text></Text>
                </View>
                <View style={styles.severityCardDefectsRow}>
                  <View style={styles.severityCardDefectsCol}>
                    {['REOPEN', 'NEW', 'OPEN', 'FIXED'].map(label => {
                      const item = card.statuses?.find((s: any) => s.label === label);
                      return item ? (
                        <View key={label} style={styles.severityCardDefectItem}>
                          <View style={[styles.severityCardDot, { backgroundColor: item.color || '#888' }]} />
                          <Text style={styles.severityCardDefectLabel}>{item.label} <Text style={styles.severityCardDefectValue}>{item.value}</Text></Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                  <View style={styles.severityCardDefectsCol}>
                    {['CLOSED', 'REJECTED', 'DUPLICATE'].map(label => {
                      const item = card.statuses?.find((s: any) => s.label === label);
                      return item ? (
                        <View key={label} style={styles.severityCardDefectItem}>
                          <View style={[styles.severityCardDot, { backgroundColor: item.color || '#888' }]} />
                          <Text style={styles.severityCardDefectLabel}>{item.label} <Text style={styles.severityCardDefectValue}>{item.value}</Text></Text>
                        </View>
                      ) : null;
                    })}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={{ color: '#374151', fontSize: 16, margin: 12 }}>No data available</Text>
          )}
        </View>
        {/* Defect Density Section */}
        
                  <View style={styles.severityCardGroup}>
            <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Density</Text>
              
            </View>
            <View style={styles.metricGaugeWrap}>
              {defectDensityLoading ? (
                <Text style={[styles.metricGaugeValue, { color: '#374151' }]}>Loading defect density...</Text>
              ) : defectDensity !== null && defectDensityData && typeof defectDensity === 'number' ? (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.metricGaugeValue, { color: '#374151' }]}>
                    Defect Density: <Text style={[styles.metricGaugeNum, { color: getDefectDensityColor(defectDensity, defectDensityData?.color) }]}>{defectDensity.toFixed(2)}</Text>
                  </Text>
                  <Text style={[styles.metricGaugeValue, { color: '#6b7280', fontSize: 14, marginTop: 4 }]}>
                    {defectDensityData.meaning} • Range: {defectDensityData.range}
                  </Text>
                  <Text style={[styles.metricGaugeValue, { color: '#6b7280', fontSize: 12, marginTop: 2 }]}>
                    Defects: {defectDensityData.defects} • KLOC: {defectDensityData.kloc}
                  </Text>
                </View>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.metricGaugeValue, { color: '#374151' }]}>Defect Density: <Text style={[styles.metricGaugeNum, { color: '#DC2626' }]}>N/A</Text></Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => currentProject?.id && fetchDefectDensity(currentProject.id)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Meter Chart */}
              <View style={styles.meterContainer}>
                <View style={styles.meterChartWrapper}>
                  <Svg width={280} height={160} viewBox="0 0 280 160" style={styles.meterSvg}>
                    {/* Green segment (0-7) - From left to top-left */}
                    <Path
                      d="M 50 140 A 90 90 0 0 1 113.64 63.64"
                      fill="none"
                      stroke="#4ADE80"
                      strokeWidth={22}
                      strokeLinecap="butt"
                    />

                    {/* Yellow/Orange segment (7-10) - From top-left to top-right */}
                    <Path
                      d="M 113.64 63.64 A 90 90 0 0 1 166.36 63.64"
                      fill="none"
                      stroke="#FBBF24"
                      strokeWidth={22}
                      strokeLinecap="butt"
                    />

                    {/* Red segment (10+) - From top-right to right */}
                    <Path
                      d="M 166.36 63.64 A 90 90 0 0 1 230 140"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={22}
                      strokeLinecap="butt"
                    />

                    {/* Needle pointing to defect density position */}
                    {defectDensity !== null && typeof defectDensity === 'number' && (() => {
                      // Green: 0-7, Yellow: 7-10, Red: 10-15
                      // Green: 0-7 (0-112.5deg), Yellow: 7-10 (112.5-150deg), Red: 10-15 (150-180deg)
                      // Map 0-7 to -90deg to 37.5deg, 7-10 to 37.5deg to 90deg, 10-15 to 90deg to 180deg
                      const minDensity = 0;
                      const greenMax = 7;
                      const yellowMax = 10;
                      const maxDensity = 15;
                      let angle;
                      if (defectDensity <= greenMax) {
                        // Green: 0-7 maps to -90deg to 37.5deg (75% of arc)
                        angle = ((defectDensity - minDensity) / (greenMax - minDensity)) * 127.5 - 90;
                      } else if (defectDensity <= yellowMax) {
                        // Yellow: 7-10 maps to 37.5deg to 90deg (20% of arc)
                        angle = ((defectDensity - greenMax) / (yellowMax - greenMax)) * 52.5 + 37.5;
                      } else {
                        // Red: 10-15 maps to 90deg to 180deg (remaining arc)
                        angle = ((defectDensity - yellowMax) / (maxDensity - yellowMax)) * 90 + 90;
                      }
                      const radius = 90;
                      const centerX = 140;
                      const centerY = 140;
                      const angleRad = angle * (Math.PI / 180);
                      const endX = centerX + radius * Math.cos(angleRad);
                      const endY = centerY + radius * Math.sin(angleRad);
                      // Arrow base (shorter radius)
                      const baseRadius = 75;
                      const baseX = centerX + baseRadius * Math.cos(angleRad);
                      const baseY = centerY + baseRadius * Math.sin(angleRad);
                      // Arrow width
                      const arrowWidth = 12;
                      // Perpendicular angle for arrow width
                      const perpAngleRad1 = angleRad + Math.PI / 2;
                      const perpAngleRad2 = angleRad - Math.PI / 2;
                      const leftX = baseX + (arrowWidth / 2) * Math.cos(perpAngleRad1);
                      const leftY = baseY + (arrowWidth / 2) * Math.sin(perpAngleRad1);
                      const rightX = baseX + (arrowWidth / 2) * Math.cos(perpAngleRad2);
                      const rightY = baseY + (arrowWidth / 2) * Math.sin(perpAngleRad2);
                      return (
                        <>
                          {/* Needle line */}
                          <Path
                            d={`M ${centerX} ${centerY} L ${endX} ${endY}`}
                            stroke="#374151"
                            strokeWidth={3}
                            strokeLinecap="round"
                          />
                          {/* Arrowhead triangle */}
                          <Path
                            d={`M ${endX} ${endY} L ${leftX} ${leftY} L ${rightX} ${rightY} Z`}
                            fill="#374151"
                          />
                        </>
                      );
                    })()}

                    {/* Needle center circle - exact match to screenshot */}
                    <Circle
                      cx="140"
                      cy="140"
                      r="8"
                      fill="#374151"
                    />
                  </Svg>

                  {/* Scale labels positioned exactly like screenshot */}
                  <Text style={[styles.meterLabel, styles.zeroLabel]}>0</Text>
                  <Text style={[styles.meterLabel, styles.sevenLabel]}>7</Text>
                  <Text style={[styles.meterLabel, styles.tenLabel]}>10</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Defect Severity Index Section */}
        <View style={{ marginVertical: 13, padding: 0, borderRadius: 14, backgroundColor: '#e7dbc7', alignSelf: 'center', width: '90%' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 10, margin: 20, paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center' }}>
            <Text style={{ color: '#181c4a', fontWeight: 'bold', fontSize: 24, textAlign: 'center', fontFamily: 'System', marginBottom: 8 }}>Defect Severity Index</Text>
            {defectSeverityIndexLoading ? (
              <Text style={{ color: '#374151', fontSize: 38, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>Loading...</Text>
            ) : defectSeverityIndexError ? (
              <Text style={{ color: '#dc2626', fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>{defectSeverityIndexError}</Text>
            ) : defectSeverityIndex ? (
              <>
                <Text style={{ color: '#fbbf24', fontSize: 56, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, fontFamily: 'System' }}>{defectSeverityIndex.severityIndexPct}</Text>
                <Text style={{ color: '#6b7280', fontSize: 20, textAlign: 'center', fontFamily: 'System', marginTop: 0 }}>
                  Weighted severity score (higher = more severe defects)
                </Text>
              </>
            ) : (
              <Text style={{ color: '#374151', fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>N/A</Text>
            )}
          </View>
        </View>

        {/* Defect to Remark Ratio Section */}
        <View style={styles.severityCardGroup}>
          <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect to Remark Ratio</Text>
              
            </View>
            <View style={[styles.metricRatioWrap, { alignItems: 'center', marginTop: 10 }]}>
              {defectRemarkRatioLoading ? (
                <Text style={[styles.metricRatioNum, { fontSize: 36, marginBottom: 8 }]}>Loading...</Text>
              ) : defectRemarkRatio !== null && defectRemarkRatioData && typeof defectRemarkRatio === 'number' ? (
                <>
                  <Text style={[styles.metricRatioNum, { fontSize: 36, marginBottom: 8 }]}>{defectRemarkRatio.toFixed(2)}%</Text>
                  <Text style={[styles.metricRatioLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 12 }]}>Defect to Remark Ratio (%)</Text>
                  <View style={[styles.metricRatioBadge, { backgroundColor: getDefectDensityColor(defectRemarkRatio, defectRemarkRatioData?.color), marginBottom: 15 }]}>
                    <Text style={styles.metricRatioBadgeText}>{defectRemarkRatioData.meaning}</Text>
                  </View>
                  <Text style={[styles.metricRatioLabel, { textAlign: 'center', fontSize: 12, color: '#6b7280', marginBottom: 8 }]}>
                    Range: {defectRemarkRatioData.range} • Total Defects: {defectRemarkRatioData.totalDefects} • Valid Defects: {defectRemarkRatioData.validDefects}
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Text style={[styles.metricRatioNum, { fontSize: 36, marginBottom: 8 }]}>N/A</Text>
                  <Text style={[styles.metricRatioLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 12 }]}>Defect to Remark Ratio (%)</Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={() => currentProject?.id && fetchDefectRemarkRatio(currentProject.id)}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Horizontal Meter */}
              {defectRemarkRatio !== null && typeof defectRemarkRatio === 'number' && (
                <View style={styles.ratioMeterContainer}>
                  <View style={styles.ratioMeterTrack}>
                    <View style={[styles.ratioMeterFill, { width: `${Math.min(defectRemarkRatio, 100)}%` }]} />
                    <View style={[styles.ratioMeterThumb, { left: `${Math.min(defectRemarkRatio, 100)}%` }]} />
                  </View>
                  <View style={styles.ratioMeterLabels}>
                    <Text style={styles.ratioMeterLabel}>0%</Text>
                    <Text style={styles.ratioMeterLabel}>50%</Text>
                    <Text style={styles.ratioMeterLabel}>100%</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

       {/* Defects Reopened Multiple Times Section */}
       <View style={styles.severityCardGroup}>
         <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
           <View style={styles.severityCardHeader}>
             <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>{CHART_CARDS[0].title}</Text>
           </View>
           <View style={{ alignItems: 'center', marginTop: 10 }}>
             {/* Pie Chart */}
             <View style={styles.smallPieChartContainer}>
               <View style={{ position: 'relative', width: 120, height: 120 }}>
                 <Svg width={120} height={120} viewBox="0 0 120 120" style={{ position: 'absolute', top: 0, left: 0 }}>
                   {(() => {
                     const reopenedData = PIE_CARDS[0];
                     const total = reopenedData.chartData.reduce((sum: number, value: number) => sum + value, 0);
                     let currentAngle = 0;
                     return reopenedData.chartData.map((value: number, index: number) => {
                       if (value === 0) return null;
                       const angle = (value / total) * 360;
                       const startAngle = currentAngle;
                       const endAngle = currentAngle + angle;
                       currentAngle += angle;
                       // Convert angles to radians
                       const startRad = (Math.PI / 180) * startAngle;
                       const endRad = (Math.PI / 180) * endAngle;
                       const x1 = 60 + 60 * Math.cos(startRad);
                       const y1 = 60 + 60 * Math.sin(startRad);
                       const x2 = 60 + 60 * Math.cos(endRad);
                       const y2 = 60 + 60 * Math.sin(endRad);
                       const largeArc = angle > 180 ? 1 : 0;
                       const pathData = `M60,60 L${x1},${y1} A60,60 0 ${largeArc} 1 ${x2},${y2} Z`;
                       return (
                         <Path
                           key={index}
                           d={pathData}
                           fill={reopenedData.chartColors[index]}
                           stroke="#fff"
                           strokeWidth={1}
                         />
                       );
                     });
                   })()}
                 </Svg>
                 {/* Overlay touchable sectors */}
                 {(() => {
                   const reopenedData = PIE_CARDS[0];
                   const total = reopenedData.chartData.reduce((sum: number, value: number) => sum + value, 0);
                   let currentAngle = 0;
                   return reopenedData.chartData.map((value: number, index: number) => {
                     if (value === 0) return null;
                     const angle = (value / total) * 360;
                     const startAngle = currentAngle;
                     const endAngle = currentAngle + angle;
                     currentAngle += angle;

                     // Calculate the center angle for the sector
                     const midAngle = (startAngle + endAngle) / 2;
                     const midRad = (Math.PI / 180) * midAngle;

                     // Position the touchable area at the center of each sector
                     const touchRadius = 35; // Distance from center
                     const touchSize = 40; // Size of touch area
                     const touchX = 60 + touchRadius * Math.cos(midRad) - touchSize/2;
                     const touchY = 60 + touchRadius * Math.sin(midRad) - touchSize/2;

                     // Get the times reopened based on index
                     const timesReopened = index === 0 ? 2 : index === 1 ? 4 : index === 2 ? 5 : 6;
                     return (
                       <TouchableOpacity
                         key={index}
                         onPress={() => {
                           console.log(`Clicked ${timesReopened} times segment`);
                           openReopenedModal(timesReopened);
                         }}
                         activeOpacity={1}
                         style={{
                           position: 'absolute',
                           left: touchX,
                           top: touchY,
                           width: touchSize,
                           height: touchSize,
                           borderRadius: touchSize/2,
                           justifyContent: 'center',
                           alignItems: 'center',
                         }}
                       />
                     );
                   });
                 })()}
               </View>
             </View>

             <View style={styles.pieLegend}>
               {(CHART_CARDS[0].legend ?? []).map(item => (
                 <View key={item.label} style={styles.pieLegendItem}>
                   <View style={[styles.pieLegendDot, { backgroundColor: item.color }]} />
                   <Text style={styles.pieLegendLabel}>{item.label}</Text>
                 </View>
               ))}
             </View>
           </View>
         </View>
       </View>

  {/* Defect Distribution by Type Section (API) */}
  <DefectDistributionByType currentProject={currentProject} />
  <DefectsByModule currentProject={currentProject} />

       {/* Time to Find Defects Section */}
       <View style={styles.severityCardGroup}>
         <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
           <View style={styles.severityCardHeader}>
             <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Time to Find Defects</Text>
           </View>
           <View style={{ alignItems: 'center', marginTop: 10 }}>
             <Svg width={320} height={213}>
               {/* Axes */}
               <Path d="M40,180 L300,180" stroke="#222" strokeWidth={2} />
               <Path d="M40,180 L40,30" stroke="#222" strokeWidth={2} />
               {/* Grid lines */}
               {[1,2,3,4].map(i => (
                 <Path key={i} d={`M40,${180-i*30} L300,${180-i*30}`} stroke="#e5e7eb" strokeWidth={1} />
               ))}
               {/* Data points and line */}
               {(() => {
                 const data = [2,3,1,4,2,3,2,1,2,1];
                 const points = data.map((v,i) => {
                   const x = 40 + (260/9)*i;
                   const y = 180 - (v-1)*37.5;
                   return { x, y };
                 });
                 const linePath = points.map((p,i) => i===0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`).join(' ');
                 return (
                   <>
                     <Path d={linePath} stroke="#2563eb" strokeWidth={3} fill="none" />
                     {points.map((p,i) => (
                       <Circle key={i} cx={p.x} cy={p.y} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                     ))}
                   </>
                 );
               })()}
               {/* Y axis labels */}
               {[1,2,3,4,5].map(i => (
                 <SvgText key={i} x={10} y={180-(i-1)*30+6} fontSize={15} fill="#64748b">{i}</SvgText>
               ))}
               {/* X axis labels */}
               {Array.from({length:10}).map((_,i) => (
                 <SvgText key={i} x={40+(260/9)*i-12} y={195} fontSize={9} fill="#64748b">{`Day ${i+1}`}</SvgText>
               ))}
               {/* Axis titles */}
               <SvgText x={-25} y={9} fontSize={10} fill="#64748b" rotation={-90} textAnchor="middle">Def Count</SvgText>
               <SvgText x={152} y={210} fontSize={11} fill="#64748b" textAnchor="middle">Time (Day)</SvgText>
             </Svg>
           </View>
         </View>
       </View>

       {/* Time to Fix Defects Section */}
       <View style={styles.severityCardGroup}>
         <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
           <View style={styles.severityCardHeader}>
             <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Time to Fix Defects</Text>
           </View>
           <View style={{ alignItems: 'center', marginTop: 10 }}>
             <Svg width={320} height={215}>
               {/* Axes */}
               <Path d="M40,180 L300,180" stroke="#222" strokeWidth={2} />
               <Path d="M40,180 L40,30" stroke="#222" strokeWidth={2} />
               {/* Grid lines */}
               {[1,2,3,4].map(i => (
                 <Path key={i} d={`M40,${180-i*30} L300,${180-i*30}`} stroke="#e5e7eb" strokeWidth={1} />
               ))}
               {/* Data points and line */}
               {(() => {
                 const data = [3,2,4,3,2,3,2,2,1,2];
                 const points = data.map((v,i) => {
                   const x = 40 + (260/9)*i;
                   const y = 180 - (v-1)*37.5;
                   return { x, y };
                 });
                 const linePath = points.map((p,i) => i===0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`).join(' ');
                 return (
                   <>
                     <Path d={linePath} stroke="#22c55e" strokeWidth={3} fill="none" />
                     {points.map((p,i) => (
                       <Circle key={i} cx={p.x} cy={p.y} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />
                     ))}
                   </>
                 );
               })()}
               {/* Y axis labels */}
               {[1,2,3,4,5].map(i => (
                 <SvgText key={i} x={10} y={180-(i-1)*30+6} fontSize={15} fill="#64748b">{i}</SvgText>
               ))}
               {/* X axis labels */}
               {Array.from({length:10}).map((_,i) => (
                 <SvgText key={i} x={40+(260/9)*i-12} y={195} fontSize={9} fill="#64748b">{`Day ${i+1}`}</SvgText>
               ))}
               {/* Axis titles */}
               <SvgText x={-45} y={9} fontSize={10} fill="#64748b" rotation={-90}>Def Count</SvgText>
               <SvgText x={122} y={210} fontSize={11} fill="#64748b">Time (Day)</SvgText>
             </Svg>
           </View>
         </View>
       </View>

       
      </ScrollView>
      </ImageBackground>
      {/* Modal for Reopened Defects */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={reopenedModalVisible}
        onRequestClose={closeReopenedModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%', width: '95%' }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedReopenedData?.timesReopened === 6 ? '>5' : selectedReopenedData?.timesReopened} times Defects
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeReopenedModal}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Table */}
            <ScrollView style={{ maxHeight: 400 }}>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]} numberOfLines={1}>Defect ID</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.8 }]} numberOfLines={1}>Assigned</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.8 }]} numberOfLines={1}>Reporter</Text>
                  <Text style={[styles.tableHeaderCell, { flex: 1.2 }]} numberOfLines={1}>Release</Text>
                </View>

                {selectedReopenedData?.defects.map((defect: any, index: number) => (
                  <View key={defect.id} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <Text style={[styles.tableCell, { flex: 1.2, fontWeight: 'bold', color: '#3b82f6' }]} numberOfLines={1}>{defect.id}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8 }]} numberOfLines={1}>{defect.assignedTo}</Text>
                    <Text style={[styles.tableCell, { flex: 1.8 }]} numberOfLines={1}>{defect.reporter}</Text>
                    <Text style={[styles.tableCell, { flex: 1.2 }]} numberOfLines={1}>{defect.releaseNumber}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal for Pie Chart */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Status Breakdown for {selectedCard?.title?.replace('Defects on ', '') || 'High'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            {/* Pie Chart */}
            <View style={styles.pieChartContainer}>
              <Svg width={200} height={200} viewBox="0 0 200 200">
                {(() => {
                  if (!selectedCard?.items) return null;
                  const total = selectedCard.items.reduce((sum: any, item: any) => sum + item.value, 0);
                  let currentAngle = 0;
                  return selectedCard.items.map((item: any, idx: any) => {
                    if (item.value === 0) return null;
                    const angle = (item.value / total) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle += angle;
                    // Convert angles to radians
                    const startRad = (Math.PI / 180) * startAngle;
                    const endRad = (Math.PI / 180) * endAngle;
                    const x1 = 100 + 100 * Math.cos(startRad);
                    const y1 = 100 + 100 * Math.sin(startRad);
                    const x2 = 100 + 100 * Math.cos(endRad);
                    const y2 = 100 + 100 * Math.sin(endRad);
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathData = `M100,100 L${x1},${y1} A100,100 0 ${largeArc} 1 ${x2},${y2} Z`;
                    return (
                      <Path
                        key={item.label}
                        d={pathData}
                        fill={item.color}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  });
                })()}
              </Svg>
              </View>
            {/* Legend */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 }}>
              {selectedCard?.items?.map((item: any) => (
                <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginVertical: 4 }}>
                  <View style={{ width: 18, height: 18, backgroundColor: item.color, marginRight: 6, borderRadius: 3 }} />
                  <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 15 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProjectDetails;

// --- Defect Distribution by Type Component ---
const DEFECT_TYPE_COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'];

interface DefectDistributionByTypeProps {
  currentProject: any;
}

function DefectDistributionByType(props: DefectDistributionByTypeProps) {
  const { currentProject } = props;
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!currentProject?.id) return;
    setLoading(true);
    setError(null);
    projectAPI.getDefectDistributionByType(currentProject.id)
      .then(res => setData(res))
      .catch(() => setError('Failed to load defect distribution'))
      .finally(() => setLoading(false));
  }, [currentProject]);

  // Adapt to actual API response structure
  const defectTypes = data?.data?.defectTypes || [];
  const totalDefectCount = data?.data?.totalDefectCount || 0;
  const mostCommonDefectType = data?.data?.mostCommonDefectType || '';
  const mostCommonDefectCount = data?.data?.mostCommonDefectCount || 0;
  
  // Transform API data to match component expectations
  const distribution = defectTypes.map((item: any) => ({
    defectType: item.defectType,
    count: item.defectCount,
    percentage: item.percentage
  }));
  
  let mostCommon = { value: 0, label: '' };
  if (distribution.length > 0) {
    if (mostCommonDefectCount > 0 && mostCommonDefectType) {
      mostCommon = { value: mostCommonDefectCount, label: mostCommonDefectType };
    } else {
      const max = distribution.reduce((a: any, b: any) => (a.count > b.count ? a : b));
      mostCommon = { value: max.count, label: max.defectType };
    }
  }

  return (
    <View style={styles.severityCardGroup}>
      <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}> 
        <View style={styles.severityCardHeader}>
          <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Distribution by Type</Text>
        </View>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          {/* Pie Chart */}
          <View style={styles.smallPieChartContainer}>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text style={{ color: '#dc2626' }}>{error}</Text>
            ) : (
              <Svg width={120} height={120} viewBox="0 0 120 120">
                {(() => {
                  let currentAngle = 0;
                  return distribution.map((item: any, index: number) => {
                    if (!item.count) return null;
                    const angle = (item.count / totalDefectCount) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle += angle;
                    const startRad = (Math.PI / 180) * startAngle;
                    const endRad = (Math.PI / 180) * endAngle;
                    const x1 = 60 + 60 * Math.cos(startRad);
                    const y1 = 60 + 60 * Math.sin(startRad);
                    const x2 = 60 + 60 * Math.cos(endRad);
                    const y2 = 60 + 60 * Math.sin(endRad);
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathData = `M60,60 L${x1},${y1} A60,60 0 ${largeArc} 1 ${x2},${y2} Z`;
                    return (
                      <Path
                        key={index}
                        d={pathData}
                        fill={DEFECT_TYPE_COLORS[index % DEFECT_TYPE_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  });
                })()}
              </Svg>
            )}
          </View>
          {/* Legend */}
          <View style={styles.pieLegend}>
            {distribution.map((item: any, idx: number) => (
              <View key={item.defectType} style={styles.pieLegendItem}>
                <View style={[styles.pieLegendDot, { backgroundColor: DEFECT_TYPE_COLORS[idx % DEFECT_TYPE_COLORS.length] }]} />
                <Text style={styles.pieLegendLabel}>{item.defectType}: {item.count} ({item.percentage}%)</Text>
              </View>
            ))}
          </View>
          <View style={styles.pieCardFooter}>
            <Text style={styles.pieCardFooterTotal}>{totalDefectCount}</Text>
            <Text style={styles.pieCardFooterLabel}>Total Valid Defects</Text>
            <Text style={styles.pieCardFooterMost}>{mostCommon.value}</Text>
            <Text style={styles.pieCardFooterMostLabel}>Most Common
              <Text style={styles.pieCardFooterMostType}> {mostCommon.label}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// --- Defects By Module Component ---
const MODULE_COLORS = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'];

function DefectsByModule({ currentProject }: { currentProject: any }) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!currentProject?.id) return;
    setLoading(true);
    setError(null);
    projectAPI.getDefectByModule(currentProject.id)
      .then(res => {
        console.log('DefectsByModule API response:', res);
        setData(res);
      })
      .catch((err) => {
        console.log('DefectsByModule API error:', err);
        setError('Failed to load defects by module');
      })
      .finally(() => {
        console.log('DefectsByModule loading finished');
        setLoading(false);
      });
  }, [currentProject]);

  const distribution = data?.data?.distribution || [];
  console.log('DefectsByModule distribution:', distribution);
  const total = data?.data?.totalValidDefects || 0;
  let mostCommon = { value: 0, label: '' };
  if (Array.isArray(distribution) && distribution.length > 0) {
    const max = distribution.reduce((a: any, b: any) => (a.count > b.count ? a : b));
    mostCommon = { value: max.count, label: max.module };
  }

  return (
    <View style={styles.severityCardGroup}>
      <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}> 
        <View style={styles.severityCardHeader}>
          <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defects by Module</Text>
        </View>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          {/* Pie Chart */}
          <View style={styles.smallPieChartContainer}>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text style={{ color: '#dc2626' }}>{error}</Text>
            ) : Array.isArray(distribution) && distribution.length === 0 ? (
              <Text>No data</Text>
            ) : (
              <Svg width={120} height={120} viewBox="0 0 120 120">
                {(() => {
                  let startAngle = 0;
                  return distribution.map((item: any, idx: number) => {
                    const angle = (item.percentage / 100) * 360;
                    const x1 = 60 + 60 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 60 + 60 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 60 + 60 * Math.cos((Math.PI * (startAngle + angle)) / 180);
                    const y2 = 60 + 60 * Math.sin((Math.PI * (startAngle + angle)) / 180);
                    const largeArc = angle > 180 ? 1 : 0;
                    const pathData = `M60,60 L${x1},${y1} A60,60 0 ${largeArc} 1 ${x2},${y2} Z`;
                    startAngle += angle;
                    return (
                      <Path
                        key={idx}
                        d={pathData}
                        fill={MODULE_COLORS[idx % MODULE_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    );
                  });
                })()}
              </Svg>
            )}
          </View>
          {/* Legend */}
          <View style={styles.pieLegend}>
            {distribution.map((item: any, idx: number) => (
              <View key={item.module} style={styles.pieLegendItem}>
                <View style={[styles.pieLegendDot, { backgroundColor: MODULE_COLORS[idx % MODULE_COLORS.length] }]} />
                <Text style={styles.pieLegendLabel}>{item.module}: {item.count} ({item.percentage}%)</Text>
              </View>
            ))}
          </View>
          <View style={styles.pieCardFooter}>
            <Text style={styles.pieCardFooterTotal}>{total}</Text>
            <Text style={styles.pieCardFooterLabel}>Total Valid Defects</Text>
            <Text style={styles.pieCardFooterMost}>{mostCommon.value}</Text>
            <Text style={styles.pieCardFooterMostLabel}>Most Common
              <Text style={styles.pieCardFooterMostType}> {mostCommon.label}</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    marginLeft: 18,
    marginBottom: 8,
    backgroundColor: '#eddec9',
    paddingVertical: 6,  
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    color: '#1e293b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionWrap: {
    width: '96%',
    marginTop: 65, // Increased from 24 for lower positioning
    marginBottom: 18,
    backgroundColor: 'rgba(237, 222, 201, 0.95)',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#181c32',
  },
  selectionScroll: {
    flexDirection: 'row',
    height: 48,
  },
  selectionScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  projectBtn: {
    backgroundColor: '#f3f6fd',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 4,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectBtnActive: {
    backgroundColor: '#03084a',
  },
  projectBtnText: {
    color: '#181c32',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  projectBtnTextActive: {
    color: '#fff',
  },
  projectHeader: {
    width: '94%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height:  2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181c32',
  },
  statusWrap: {
    alignItems: 'flex-end',
  },
  statusLabel: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 2,
  },
  statusBadge: {
    backgroundColor: '#fee2e2',
    color: '#e53935',
    fontWeight: 'bold',
    fontSize: 14,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#181c32',
    marginBottom: 14,
    marginTop: 8,
    width: '94%',
  },
  defectCardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '98%',
    marginBottom: 18,
    gap: 18,
  },
  defectCardsRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    gap: 12,
  },
  defectCard: {
    flex: 1,
    minWidth: 220,
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 8,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  defectCardMobile: {
    minWidth: '90%',
    maxWidth: '98%',
    marginHorizontal: 0,
    padding: 12,
  },
  defectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  defectCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  defectCardTotal: {
    fontSize: 16,
    color: '#374151',
    fontWeight: 'bold',
  },
  defectCardList: {
    marginBottom: 10,
  },
  defectCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  defectCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  defectCardItemLabel: {
    fontSize: 15,
    color: '#181c32',
    flex: 1,
  },
  defectCardItemValue: {
    fontSize: 15,
    color: '#181c32',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  defectCardBtn: {
    backgroundColor: '#f3f6fd',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  defectCardBtnText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '98%',
    gap: 18,
    marginBottom: 18,
  },
  metricsRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 8,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
  },
  metricCardMobile: {
    minWidth: '90%',
    maxWidth: '98%',
    marginHorizontal: 0,
    padding: 12,
  },
  metricCardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#181c32',
    marginBottom: 10,
  },
  metricGaugeWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  metricGaugeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e53935',
    marginBottom: 4,
  },
  metricGaugeNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e53935',
  },
  metricGaugeGraphic: {
    width: 100,
    height: 50,
    backgroundColor: '#f3f6fd',
    borderRadius: 25,
    marginTop: 6,
  },
  gaugeContainer: {
    width: 140,
    height: 80,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeBackground: {
    width: 120,
    height: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeArc: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  gaugeArcGreen: {
    borderTopColor: '#22c55e',
    transform: [{ rotate: '-90deg' }],
    left: 0,
    top: 0,
  },
  gaugeArcYellow: {
    borderTopColor: '#fbbf24',
    transform: [{ rotate: '-30deg' }],
    left: 0,
    top: 0,
  },
  gaugeArcRed: {
    borderTopColor: '#e53935',
    transform: [{ rotate: '30deg' }],
    left: 0,
    top: 0,
  },
  gaugeLabels: {
    position: 'absolute',
    bottom: 5,
    width: 120,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gaugeLabelLeft: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  gaugeLabelCenter: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    position: 'absolute',
    top: -25,
    left: '50%',
    marginLeft: -6,
  },
  gaugeLabelRight: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  gaugeNeedle: {
    position: 'absolute',
    bottom: 20,
    width: 2,
    height: 45,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  needleLine: {
    width: 2,
    height: 35,
    backgroundColor: '#374151',
    borderRadius: 1,
  },
  needleCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
    position: 'absolute',
    bottom: 0,
  },
  metricScoreWrap: {
    alignItems: 'center',
  },
  metricScoreNum: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 4,
  },
  metricScoreLabel: {
    fontSize: 15,
    color: '#181c32',
    textAlign: 'center',
  },
  metricRatioWrap: {
    alignItems: 'center',
  },
  metricRatioNum: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#181c32',
    marginBottom: 4,
  },
  metricRatioLabel: {
    fontSize: 15,
    color: '#181c32',
    textAlign: 'center',
    marginBottom: 6,
  },
  metricRatioBadge: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  metricRatioBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pieCardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '98%',
    marginTop: 18,
    marginBottom: 18,
    gap: 18,
  },
  pieCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 8,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
  },
  pieCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#181c32',
    textAlign: 'center',
  },
  pieChartPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f3f6fd',
    marginBottom: 12,
  },
  pieLegend: {
    marginTop: 8,
    width: '100%',
    alignItems: 'flex-start',
  },
  pieLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pieLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  pieLegendLabel: {
    fontSize: 15,
    color: '#181c32',
  },
  pieCardFooter: {
    marginTop: 12,
    alignItems: 'center',
  },
  pieCardFooterTotal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181c32',
    marginBottom: 2,
  },
  pieCardFooterLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  pieCardFooterMost: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 2,
  },
  pieCardFooterMostLabel: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
  },
  pieCardFooterMostType: {
    fontWeight: 'bold',
    color: '#181c32',
  },
  chartsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '98%',
    marginTop: 8,
    marginBottom: 8,
    gap: 18,
  },
  chartsRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  pieCardMobile: {
    minWidth: '90%',
    maxWidth: '98%',
    marginHorizontal: 0,
    padding: 12,
  },
  lineChartPlaceholder: {
    width: 180,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f3f6fd',
    marginBottom: 12,
  },
  severityCard: {
    borderWidth: 2,
    borderRadius: 14,
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 2,
    width: '97%',
    alignSelf: 'center',
  },
  severityCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  severityCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  severityCardTotal: {
    fontSize: 13,
    color: '#181c32',
    textAlign: 'right',
  },
  severityCardDefectsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 6,
    width: '100%',
    maxHeight: 120,
    overflow: 'hidden',
  },
  severityCardDefectsCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
  severityCardDefectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
    paddingVertical: 1,
  },
  severityCardDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  severityCardDefectLabel: {
    fontSize: 12,
    color: '#181c32',
    textAlign: 'left',
  },
  severityCardDefectValue: {
    fontWeight: 'bold',
    color: '#181c32',
  },
  severityCardButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 6,
  },
  severityCardButtonText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181c32',
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pieChart: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
    width: 200,
    height: 100,
    backgroundColor: '#2563eb',
    transformOrigin: '50% 100%',
    top: 0,
    left: 0,
  },
  modalLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  modalLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minWidth: '45%',
  },
  modalLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  modalLegendText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  smallPieChartContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  smallPieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  },
  smallPieSlice: {
    position: 'absolute',
    width: 120,
    height: 60,
    backgroundColor: '#2563eb',
    transformOrigin: '50% 100%',
    top: 0,
    left: 0,
  },
  largePieChartContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  largePieChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f3f4f6',
    position: 'relative',
    overflow: 'hidden',
  },
  largePieSlice: {
    position: 'absolute',
    width: 180,
    height: 90,
    backgroundColor: '#2563eb',
    transformOrigin: '50% 100%',
    top: 0,
    left: 0,
  },
  moduleLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  moduleLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '48%',
  },
  moduleLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moduleLegendLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  lineChartContainer: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    margin: 10,
  },
  customBackButton: {
    position: 'absolute',
    top: 5,
    left: 10,
    zIndex: 20,
    backgroundColor: 'transparent',
    padding: 4,
  },
  defectDensityCard: {
    backgroundColor: 'rgba(237, 222, 201, 0.95)',
    borderWidth: 0,
    shadowColor: '#000',
  },
  meterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    width: '100%',
  },
  meterChartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 160,
  },
  meterSvg: {
    alignSelf: 'center',
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 140,
    marginTop: -10,
  },
  meterLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  meterLabelCenter: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
  },
  meterLabelRight: {
    position: 'absolute',
    right: 0,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  severityCardGroup: {
    width: '90%',
    marginBottom: 18,
    backgroundColor: 'rgba(237, 222, 201, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'center',
  },

  zeroLabel: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  sevenLabel: {
    position: 'absolute',
    left: 105,
    top: 25,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  tenLabel: {
    position: 'absolute',
    right: 105,
    top: 25,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  leftLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  topLeftLabel: {
    position: 'absolute',
    left: 105,
    top: 15,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  topRightLabel: {
    position: 'absolute',
    right: 25,
    top: 35,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  centerLabel: {
    position: 'absolute',
    left: 110,
    bottom: 30,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  rightLabel: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },

  ratioMeterContainer: {
    width: '100%',
    marginTop: 10,
  },
  ratioMeterTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 8,
  },
  ratioMeterFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  ratioMeterThumb: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fbbf24',
    position: 'absolute',
    top: -4,
    left: '97.84%',
    marginLeft: -8,
  },
  ratioMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  ratioMeterLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableHeaderCell: {
    padding: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    padding: 12,
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    flexWrap: 'nowrap',
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
