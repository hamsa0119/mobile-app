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
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import Header from '../components/Header';
import { getDefectNotifications, getUnreadNotificationsCount } from '../api/notifications';
import { getAllProjects, Project } from '../api/projectget';
import { getProjectCardColors, ProjectCardColor, getDefaultProjectCardColor } from '../api/projectcardcolor';
import { getDefectRemarkRatio, DefectRemarkRatio, getDefaultDefectRemarkRatio, formatPercentage, getRatioStatus, getRatioStatusColor } from '../api/defectremarkratio';
import { getDefectSeverityIndex, DefectSeverityIndex, getDefaultDefectSeverityIndex, formatSeverityIndex, getSeverityIndexStatus } from '../api/defectseverityindex';
import { getDefectDensity, DefectDensity, getDefaultDefectDensity, formatDefectDensity, getDefectDensityStatus, getChangeIndicatorColor } from '../api/defectdensity';
import { getDefectTypeDistribution, DefectTypeDistribution, getDefaultDefectTypeDistribution } from '../api/defecttype';
import { getDefectByModule, DefectByModule, getDefaultDefectByModule, getModuleStatus, getModuleStatusColor } from '../api/defectbymodule';
import { getDefectSeverityBreakdown, DefectSeverityBreakdown, getDefaultDefectSeverityBreakdown, getSeverityColor, getSeverityStatus } from '../api/defectseveritybreakdown';


const PROJECTS = [
  { name: 'Defect Tracker', status: 'high' },
  { name: 'QA testing', status: 'high' },
  { name: 'project 1', status: 'low' },
  { name: 'Heart', status: 'low' },
  { name: 'Dashbord testing', status: 'low' },
  { name: 'JALI', status: 'low' },
  { name: 'Hello world', status: 'low' },
  { name: 'dashborad test', status: 'medium' },
  { name: 'Defect Tracker', status: 'high' },
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
  selectedProject?: string;
  selectedProjectRisk?: 'high' | 'medium' | 'low';
  onLogout?: () => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ selectedProject, selectedProjectRisk, onLogout }) => {
  // API State
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectColors, setProjectColors] = useState<ProjectCardColor[]>([]);
  const [defectRemarkRatio, setDefectRemarkRatio] = useState<DefectRemarkRatio | null>(null);
  const [defectSeverityIndex, setDefectSeverityIndex] = useState<DefectSeverityIndex | null>(null);
  const [defectDensity, setDefectDensity] = useState<DefectDensity | null>(null);
  const [defectTypeDistribution, setDefectTypeDistribution] = useState<DefectTypeDistribution | null>(null);
  const [defectByModule, setDefectByModule] = useState<DefectByModule[]>([]);
  const [defectSeverityBreakdown, setDefectSeverityBreakdown] = useState<DefectSeverityBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [selected, setSelected] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [reopenedModalVisible, setReopenedModalVisible] = useState(false);
  const [selectedReopenedData, setSelectedReopenedData] = useState<any>(null);
  const [defectNotifications, setDefectNotifications] = useState<any[]>([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [hasLocalSelection, setHasLocalSelection] = useState(false);
  const [selectionCounter, setSelectionCounter] = useState(0);

  // Fetch defect by module for the selected project
  const fetchDefectByModule = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect by module fetch');
        setDefectByModule([]);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect by module for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const moduleResult = await getDefectByModule(currentProject.id);
        console.log('Defect by module fetched successfully:', moduleResult);
        
        // Check if there's any data with value > 0
        const hasData = moduleResult && moduleResult.length > 0 && moduleResult.some(module => module.value > 0);
        console.log('Defect by module has data:', hasData, 'Total modules:', moduleResult?.length);
        console.log('Module details:', moduleResult?.map(module => ({ name: module.name, value: module.value })));
        
        setDefectByModule(moduleResult);
      } else {
        console.warn('No project ID available for defect by module');
        setDefectByModule([]);
      }
    } catch (moduleError) {
      console.warn('Error fetching defect by module:', moduleError);
      // Don't show error for defect by module as it's optional
      setDefectByModule([]);
    }
  };

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch defect to remark ratio, severity index, defect density, defect type distribution, defect by module, defect severity breakdown, and notifications when selected project changes
  useEffect(() => {
    if (projects.length > 0 && selected < projects.length) {
      fetchDefectRemarkRatio();
      fetchDefectSeverityIndex();
      fetchDefectDensity();
      fetchDefectTypeDistribution();
      fetchDefectByModule();
      fetchDefectSeverityBreakdown();
      fetchNotifications();
    }
  }, [selected, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllProjects();
      
      if (result && result.length > 0) {
        console.log('Projects fetched successfully:', result);
        setProjects(result);
        
        // Fetch project card colors for all projects
        await fetchProjectColors(result);
        
        // Set initial selected project if provided
        if (selectedProject) {
          const projectIndex = result.findIndex(p => p.name === selectedProject);
          if (projectIndex >= 0) {
            setSelected(projectIndex);
          }
        }
      } else {
        console.warn('No projects returned from API');
        setProjects([]);
        setProjectColors([]);
        setDefectRemarkRatio(null);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
      Alert.alert('Error', 'Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectColors = async (projectList: Project[]) => {
    try {
      if (projectList.length === 0) {
        setProjectColors([]);
        return;
      }

      const projectIds = projectList.map(p => p.id).filter(id => id !== undefined);
      
      if (projectIds.length === 0) {
        console.warn('No valid project IDs found for color fetching');
        setProjectColors([]);
        return;
      }

      console.log(`Fetching project card colors for ${projectIds.length} projects...`);
      const colors = await getProjectCardColors(projectIds);
      
      if (colors && colors.length > 0) {
        console.log('Project card colors fetched successfully:', colors);
        setProjectColors(colors);
      } else {
        console.warn('No project card colors returned from API');
        setProjectColors([]);
      }
    } catch (err) {
      console.error('Error fetching project card colors:', err);
      // Don't show error alert for colors, just log it
      setProjectColors([]);
    }
  };

  // Fetch defect to remark ratio for the selected project
  const fetchDefectRemarkRatio = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect to remark ratio fetch');
        setDefectRemarkRatio(null);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect to remark ratio for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const ratioResult = await getDefectRemarkRatio(currentProject.id);
        console.log('Defect to remark ratio fetched successfully:', ratioResult);
        setDefectRemarkRatio(ratioResult);
      } else {
        console.warn('No project ID available for defect to remark ratio');
        setDefectRemarkRatio(null);
      }
    } catch (ratioError) {
      console.warn('Error fetching defect to remark ratio:', ratioError);
      // Don't show error for ratio as it's optional
      setDefectRemarkRatio(null);
    }
  };

  // Fetch defect severity index for the selected project
  const fetchDefectSeverityIndex = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect severity index fetch');
        setDefectSeverityIndex(null);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect severity index for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const severityResult = await getDefectSeverityIndex(currentProject.id);
        console.log('Defect severity index fetched successfully:', severityResult);
        setDefectSeverityIndex(severityResult);
      } else {
        console.warn('No project ID available for defect severity index');
        setDefectSeverityIndex(null);
      }
    } catch (severityError) {
      console.warn('Error fetching defect severity index:', severityError);
      // Don't show error for severity index as it's optional
      setDefectSeverityIndex(null);
    }
  };

  // Fetch defect density for the selected project
  const fetchDefectDensity = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect density fetch');
        setDefectDensity(null);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect density for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const densityResult = await getDefectDensity(currentProject.id);
        console.log('Defect density fetched successfully:', densityResult);
        setDefectDensity(densityResult);
      } else {
        console.warn('No project ID available for defect density');
        setDefectDensity(null);
      }
    } catch (densityError) {
      console.warn('Error fetching defect density:', densityError);
      // Don't show error for defect density as it's optional
      setDefectDensity(null);
    }
  };

  // Fetch defect type distribution for the selected project
  const fetchDefectTypeDistribution = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect type distribution fetch');
        setDefectTypeDistribution(null);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect type distribution for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const typeDistributionResult = await getDefectTypeDistribution(currentProject.id);
        console.log('Defect type distribution fetched successfully:', typeDistributionResult);
        
        // Check if there's any data with defectCount > 0
        const hasData = typeDistributionResult && typeDistributionResult.defectTypes.some(dt => dt.defectCount > 0);
        console.log('Defect type distribution has data:', hasData, 'Total defect types:', typeDistributionResult?.defectTypes?.length);
        console.log('Defect type details:', typeDistributionResult?.defectTypes?.map(dt => ({ type: dt.defectType, count: dt.defectCount })));
        
        setDefectTypeDistribution(typeDistributionResult);
      } else {
        console.warn('No project ID available for defect type distribution');
        setDefectTypeDistribution(null);
      }
    } catch (typeDistributionError) {
      console.warn('Error fetching defect type distribution:', typeDistributionError);
      // Don't show error for defect type distribution as it's optional
      setDefectTypeDistribution(null);
    }
  };

  // Fetch defect severity breakdown for the selected project
  const fetchDefectSeverityBreakdown = async () => {
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping defect severity breakdown fetch');
        setDefectSeverityBreakdown([]);
        return;
      }

      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching defect severity breakdown for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const severityBreakdownResult = await getDefectSeverityBreakdown(currentProject.id);
        console.log('Defect severity breakdown fetched successfully:', severityBreakdownResult);
        setDefectSeverityBreakdown(severityBreakdownResult);
      } else {
        console.warn('No project ID available for defect severity breakdown');
        setDefectSeverityBreakdown([]);
      }
    } catch (severityBreakdownError) {
      console.warn('Error fetching defect severity breakdown:', severityBreakdownError);
      // Don't show error for defect severity breakdown as it's optional
      setDefectSeverityBreakdown([]);
    }
  };

  // Get current project data with fallback
  const currentProject = projects[selected] || PROJECTS[0] || { name: 'Unknown Project', status: 'low' };
  
  // Map API status values to risk levels
  // Function to get risk level based on card color from API (same as dashboard)
  const getRiskLevelFromCardColor = (projectId: number | undefined): 'high' | 'medium' | 'low' => {
    const customColor = projectColors.find(color => color.projectId === projectId);
    
    if (customColor && customColor.projectCardColor) {
      const gradientMatch = customColor.projectCardColor.match(/from-(\w+)-(\d+)/);
      if (gradientMatch) {
        const colorName = gradientMatch[1];
        console.log(`Project ${projectId}: Card color is ${colorName}, risk level will be ${colorName === 'yellow' ? 'medium' : colorName === 'red' ? 'high' : 'low'}`);
        
        // Determine risk level based on color
        if (colorName === 'yellow') {
          return 'medium';
        } else if (colorName === 'red') {
          return 'high';
        } else if (colorName === 'green') {
          return 'low';
        }
      }
    }
    
    // Fallback to status-based risk
    console.log(`Project ${projectId}: No card color found, using fallback risk level: low`);
    return 'low';
  };

  const getStatusKey = (status: string | undefined): 'high' | 'medium' | 'low' => {
    if (status === 'high' || status === 'medium' || status === 'low') {
      return status;
    }
    
    // Map API status values to risk levels
    if (status === 'ACTIVE') {
      return 'high';
    } else if (status === 'COMPLETED') {
      return 'medium';
    } else if (status === 'INACTIVE') {
      return 'low';
    }
    
    // Fallback mapping for other status values
    if (status?.toLowerCase().includes('high') || status?.toLowerCase().includes('critical')) {
      return 'high';
    }
    if (status?.toLowerCase().includes('medium') || status?.toLowerCase().includes('moderate')) {
      return 'medium';
    }
    
    // Default to low for any other status
    return 'low';
  };
  
  // Use card color-based risk level (same as dashboard) for consistent status display
  const cardColorRiskLevel = getRiskLevelFromCardColor(currentProject?.id);
  const statusKey = hasLocalSelection ? cardColorRiskLevel : (selectedProjectRisk || cardColorRiskLevel);
  const statusObj = STATUS[statusKey];
  
  // Force re-calculation when selection counter changes
  const forceUpdate = selectionCounter;

  const openModal = (card: any) => {
    console.log('Opening modal with card data:', card);
    setSelectedCard(card);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCard(null);
  };

  // Change Indicator Component
  const ChangeIndicator = ({ defectDensity }: { defectDensity: DefectDensity | null }) => {
    if (!defectDensity || !defectDensity.changeDirection || defectDensity.changeDirection === 'stable') {
      return null;
    }

    const color = getChangeIndicatorColor(defectDensity.isImprovement || false, defectDensity.changeDirection);
    const isUp = defectDensity.changeDirection === 'up';

    return (
      <View style={styles.changeIndicatorContainer}>
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path
            d={isUp ? "M7 14l5-5 5 5" : "M7 10l5 5 5-5"}
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Text style={[styles.changeIndicatorText, { color }]}>
          {defectDensity.changePercentage?.toFixed(1)}%
        </Text>
      </View>
    );
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

  // Handle project selection change
  const handleProjectSelection = async (index: number) => {
    setSelected(index);
    setHasLocalSelection(true);
    setSelectionCounter(prev => prev + 1);
    // Fetch defect to remark ratio and severity index for the newly selected project
    try {
      // Make sure we have projects loaded
      if (projects.length === 0) {
        console.log('No projects available yet, skipping API fetches');
        setDefectRemarkRatio(null);
        setDefectSeverityIndex(null);
        return;
      }

      const selectedProject = projects[index];
      if (selectedProject && selectedProject.id) {
        console.log(`Fetching data for new project: ${selectedProject.name} (ID: ${selectedProject.id})`);
        
        // Fetch ratio, severity index, defect density, and defect type distribution in parallel
        const [ratioResult, severityResult, densityResult, typeDistributionResult] = await Promise.allSettled([
          getDefectRemarkRatio(selectedProject.id),
          getDefectSeverityIndex(selectedProject.id),
          getDefectDensity(selectedProject.id),
          getDefectTypeDistribution(selectedProject.id)
        ]);

        if (ratioResult.status === 'fulfilled') {
          console.log('Defect to remark ratio updated for new project:', ratioResult.value);
          setDefectRemarkRatio(ratioResult.value);
        } else {
          console.warn('Error fetching defect to remark ratio for new project:', ratioResult.reason);
          setDefectRemarkRatio(null);
        }

        if (severityResult.status === 'fulfilled') {
          console.log('Defect severity index updated for new project:', severityResult.value);
          setDefectSeverityIndex(severityResult.value);
        } else {
          console.warn('Error fetching defect severity index for new project:', severityResult.reason);
          setDefectSeverityIndex(null);
        }

        if (densityResult.status === 'fulfilled') {
          console.log('Defect density updated for new project:', densityResult.value);
          setDefectDensity(densityResult.value);
        } else {
          console.warn('Error fetching defect density for new project:', densityResult.reason);
          setDefectDensity(null);
        }

        if (typeDistributionResult.status === 'fulfilled') {
          console.log('Defect type distribution updated for new project:', typeDistributionResult.value);
          setDefectTypeDistribution(typeDistributionResult.value);
        } else {
          console.warn('Error fetching defect type distribution for new project:', typeDistributionResult.reason);
          setDefectTypeDistribution(null);
        }
      } else {
        console.warn('No project ID available for API calls');
        setDefectRemarkRatio(null);
        setDefectSeverityIndex(null);
      }
    } catch (error) {
      console.warn('Error fetching data for new project:', error);
      setDefectRemarkRatio(null);
      setDefectSeverityIndex(null);
      setDefectDensity(null);
      setDefectTypeDistribution(null);
    }
  };

  const fetchNotifications = async () => {
    try {
      const currentProject = projects[selected];
      if (currentProject && currentProject.id) {
        console.log(`Fetching notifications for project: ${currentProject.name} (ID: ${currentProject.id})`);
        const notifications = await getDefectNotifications(currentProject.id);
        const unreadCount = await getUnreadNotificationsCount(currentProject.id);
        
        setDefectNotifications(notifications);
        setUnreadNotificationsCount(unreadCount);
        
        console.log('Notifications fetched successfully:', notifications.length, 'notifications,', unreadCount, 'unread');
      }
    } catch (error) {
      console.warn('Error fetching notifications:', error);
      setDefectNotifications([]);
      setUnreadNotificationsCount(0);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <Header 
        onLogout={onLogout} 
        defects={defectNotifications}
        hasNotifications={unreadNotificationsCount > 0}
      />
      <ImageBackground
        source={require('../../assert/foto8.jpg')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
      <ScrollView 
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchProjects}
            colors={['#03084a']}
            tintColor="#03084a"
          />
        }
      >

        {/* Project Selection */}
        <View style={styles.selectionWrap}>
          <Text style={[styles.selectionLabel, { color: '#03084a' }]}>Project Selection</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#03084a" />
              <Text style={styles.loadingText}>Loading projects...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectionScroll}
            contentContainerStyle={styles.selectionScrollContent}
          >
              {projects.length > 0 ? (
                projects.map((project, i) => (
              <TouchableOpacity
                    key={project.id || i}
                style={[styles.projectBtn, selected === i && styles.projectBtnActive]}
                    onPress={() => handleProjectSelection(i)}
              >
                    <Text style={[styles.projectBtnText, selected === i && styles.projectBtnTextActive]}>
                      {project.name}
                    </Text>
              </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noProjectsText}>No projects available</Text>
              )}
          </ScrollView>
          )}
        </View>
        {/* Project Name and Status */}
        <View style={[styles.projectHeader, { backgroundColor: 'rgba(237, 222, 201, 0.95)' }]}>
          <Text style={[styles.projectName, { color: '#03084a' }]}>{currentProject.name}</Text>
          <View style={styles.statusWrap}>
           
            <Text key={`status-${forceUpdate}`} style={[styles.statusBadge, { backgroundColor: statusObj.bg, color: statusObj.color, borderColor: statusObj.color }]}>{statusObj.label}</Text>
          </View>
        </View>
        {/* Defect Severity Breakdown */}
        <Text style={[styles.sectionTitle, { color: '#fff' }]}>Defect Severity Breakdown</Text>
        <View style={styles.severityCardGroup}>
        {defectSeverityBreakdown && defectSeverityBreakdown.length > 0 ? (
          defectSeverityBreakdown.map(severity => (
            <View
              key={severity.severityId}
              style={[
                styles.severityCard,
                {
                  borderColor: getSeverityColor(severity.severityName),
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
                <Text style={[styles.severityCardTitle, { color: getSeverityColor(severity.severityName) }]}>
                  Defects on {severity.severityName}
                </Text>
                <Text style={styles.severityCardTotal}>Total: <Text style={{ fontWeight: 'bold' }}>{severity.totalDefects}</Text></Text>
              </View>
              <View style={styles.severityCardDefectsRow}>
                <View style={styles.severityCardDefectsCol}>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#e53935' }]} />
                    <Text style={styles.severityCardDefectLabel}>REOPEN <Text style={styles.severityCardDefectValue}>{severity.reopenedDefects}</Text></Text>
                  </View>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#2563eb' }]} />
                    <Text style={styles.severityCardDefectLabel}>NEW <Text style={styles.severityCardDefectValue}>{severity.newDefects}</Text></Text>
                  </View>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#eab308' }]} />
                    <Text style={styles.severityCardDefectLabel}>OPEN <Text style={styles.severityCardDefectValue}>{severity.openDefects}</Text></Text>
                  </View>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#22c55e' }]} />
                    <Text style={styles.severityCardDefectLabel}>FIXED <Text style={styles.severityCardDefectValue}>{severity.fixedDefects}</Text></Text>
                  </View>
                </View>
                <View style={styles.severityCardDefectsCol}>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#166534' }]} />
                    <Text style={styles.severityCardDefectLabel}>CLOSED <Text style={styles.severityCardDefectValue}>{severity.closedDefects}</Text></Text>
                  </View>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#b91c1c' }]} />
                    <Text style={styles.severityCardDefectLabel}>REJECTED <Text style={styles.severityCardDefectValue}>{severity.rejectedDefects}</Text></Text>
                  </View>
                  <View style={styles.severityCardDefectItem}>
                    <View style={[styles.severityCardDot, { backgroundColor: '#6b7280' }]} />
                    <Text style={styles.severityCardDefectLabel}>DUPLICATE <Text style={styles.severityCardDefectValue}>{severity.duplicateDefects}</Text></Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={[styles.severityCardButton, { backgroundColor: '#03084a' }]} onPress={() => openModal({
                key: severity.severityName.toLowerCase(),
                title: `Defects on ${severity.severityName}`,
                total: severity.totalDefects,
                color: getSeverityColor(severity.severityName),
                border: getSeverityColor(severity.severityName),
                items: [
                  { label: 'REOPEN', color: '#e53935', value: severity.reopenedDefects },
                  { label: 'NEW', color: '#2563eb', value: severity.newDefects },
                  { label: 'OPEN', color: '#eab308', value: severity.openDefects },
                  { label: 'FIXED', color: '#22c55e', value: severity.fixedDefects },
                  { label: 'CLOSED', color: '#166534', value: severity.closedDefects },
                  { label: 'REJECTED', color: '#b91c1c', value: severity.rejectedDefects },
                  { label: 'DUPLICATE', color: '#6b7280', value: severity.duplicateDefects },
                ],
              })}>
                <Text style={[styles.severityCardButtonText, { color: '#fff' }]}>View Chart</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Severity Breakdown</Text>
            </View>
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={styles.noDataText}>No severity breakdown data available</Text>
            </View>
          </View>
        )}
        </View>
        {/* Defect Density Section - Single Dynamic Meter */}
                  <View style={styles.severityCardGroup}>
            <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Density</Text>
            </View>
            <View style={styles.metricGaugeWrap}>
              {defectDensity ? (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[styles.metricGaugeValue, { color: '#374151' }]}>
                      Defect Density: <Text style={[styles.metricGaugeNum, { color: getDefectDensityStatus(defectDensity.defectDensity).color }]}>
                        {formatDefectDensity(defectDensity.defectDensity)}
                      </Text>
                    </Text>
                    <ChangeIndicator defectDensity={defectDensity} />
                  </View>
                  {/* Dynamic Defect Density Meter Chart */}
              <View style={styles.meterContainer}>
                <View style={styles.meterChartWrapper}>
                  <Svg width={280} height={160} viewBox="0 0 280 160" style={styles.meterSvg}>
                    {/* Green segment (0-7) - From left to top-left */}
                    <Path
                      d="M 50 140 A 90 90 0 0 1 113.64 63.64"
                      fill="none"
                          stroke="#22C55E"
                          strokeWidth={20}
                      strokeLinecap="butt"
                    />

                        {/* Yellow segment (7-10) - From top-left to top-right */}
                    <Path
                      d="M 113.64 63.64 A 90 90 0 0 1 166.36 63.64"
                      fill="none"
                      stroke="#FBBF24"
                          strokeWidth={20}
                      strokeLinecap="butt"
                    />

                    {/* Red segment (10+) - From top-right to right */}
                    <Path
                      d="M 166.36 63.64 A 90 90 0 0 1 230 140"
                      fill="none"
                      stroke="#EF4444"
                          strokeWidth={20}
                      strokeLinecap="butt"
                    />

                        {/* Dynamic Needle based on actual defect density */}
                        {(() => {
                          const density = defectDensity.defectDensity;

                          // Calculate needle position based on value ranges:
                          // 0-7: Green zone (180° to 126°)
                          // 7-10: Yellow zone (126° to 54°)
                          // 10+: Red zone (54° to 0°)
                          let angle;
                          if (density <= 7) {
                            // Green zone: 0-7 maps to 180°-126°
                            const greenProgress = density / 7; // 0 to 1
                            angle = 180 - (greenProgress * 54); // 180° to 126°
                          } else if (density <= 10) {
                            // Yellow zone: 7-10 maps to 126°-54°
                            const yellowProgress = (density - 7) / 3; // 0 to 1
                            angle = 126 - (yellowProgress * 72); // 126° to 54°
                          } else {
                            // Red zone: 10+ maps to 54°-0°
                            const redProgress = Math.min((density - 10) / 5, 1); // 0 to 1, capped at 15
                            angle = 54 - (redProgress * 54); // 54° to 0°
                          }

                          const angleRad = angle * Math.PI / 180;
                          const needleLength = 90;
                          const endX = 140 + needleLength * Math.cos(angleRad);
                          const endY = 140 - needleLength * Math.sin(angleRad);

                          return (
                    <Path
                              d={`M 140 140 L ${endX} ${endY}`}
                      stroke="#374151"
                              strokeWidth={4}
                      strokeLinecap="round"
                    />
                          );
                        })()}

                        {/* Needle center circle */}
                    <Circle
                      cx="140"
                      cy="140"
                          r="12"
                      fill="#374151"
                    />
                  </Svg>

                      {/* Scale labels */}
                  <Text style={[styles.meterLabel, styles.zeroLabel]}>0</Text>
                  <Text style={[styles.meterLabel, styles.sevenLabel]}>7</Text>
                  <Text style={[styles.meterLabel, styles.tenLabel]}>10</Text>
                </View>
              </View>
                  {/* Defect Density Details */}
                  <View style={styles.densityDetailsContainer}>
                    <Text style={styles.densityDetailsText}>
                      Total Defects: {defectDensity.defects} | Lines of Code: {defectDensity.kloc.toLocaleString()}
                    </Text>
                    <Text style={styles.densityUnitText}>
                      Quality: {defectDensity.meaning} | Range: {defectDensity.range}
                    </Text>
            </View>
                </>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={[styles.metricGaugeValue, { color: '#374151' }]}>
                      Defect Density: <Text style={[styles.metricGaugeNum, { color: '#9ca3af' }]}>--</Text>
                    </Text>
                  </View>
                  {/* Empty Meter Chart */}
                  <View style={styles.meterContainer}>
                    <View style={styles.meterChartWrapper}>
                      <Svg width={280} height={160} viewBox="0 0 280 160" style={styles.meterSvg}>
                        {/* Green segment (0-7) - From left to top-left */}
                        <Path
                          d="M 50 140 A 90 90 0 0 1 113.64 63.64"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth={20}
                          strokeLinecap="butt"
                        />

                        {/* Yellow segment (7-10) - From top-left to top-right */}
                        <Path
                          d="M 113.64 63.64 A 90 90 0 0 1 166.36 63.64"
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth={20}
                          strokeLinecap="butt"
                        />

                        {/* Red segment (10+) - From top-right to right */}
                        <Path
                          d="M 166.36 63.64 A 90 90 0 0 1 230 140"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth={20}
                          strokeLinecap="butt"
                        />

                        {/* No needle - empty meter */}
                      </Svg>

                      {/* Scale labels */}
                      <Text style={[styles.meterLabel, styles.zeroLabel]}>0</Text>
                      <Text style={[styles.meterLabel, styles.sevenLabel]}>7</Text>
                      <Text style={[styles.meterLabel, styles.tenLabel]}>10</Text>
                    </View>
                  </View>
                  {/* Empty Details */}
                  <View style={styles.densityDetailsContainer}>
                    <Text style={styles.densityDetailsText}>
                      No Data Available
                    </Text>
                    <Text style={styles.densityUnitText}>
                      Defect Density data not loaded
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Defect Severity Index Section */}
        <View style={styles.severityCardGroup}>
          <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Severity Index</Text>
            </View>
            <View style={[styles.metricScoreWrap, { alignItems: 'center', marginTop: 10 }]}>
              {defectSeverityIndex ? (
                <>
                  <Text style={[
                    styles.metricScoreNum, 
                    { 
                      color: getSeverityIndexStatus(defectSeverityIndex.dsiPercentage).color, 
                      fontSize: 32, 
                      marginBottom: 8 
                    }
                  ]}>
                    {defectSeverityIndex.dsiPercentage.toFixed(1)}%
                  </Text>
                  <Text style={[styles.metricScoreLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 8 }]}>
                    Defect Severity Index (DSI)
                  </Text>
                  <View style={[
                    styles.metricRatioBadge, 
                    { 
                      backgroundColor: getSeverityIndexStatus(defectSeverityIndex.dsiPercentage).color, 
                      marginBottom: 8 
                    }
                  ]}>
                    <Text style={styles.metricRatioBadgeText}>
                      {defectSeverityIndex.interpretation.toUpperCase()}
                    </Text>
            </View>
                  {/* DSI Details */}
                  <View style={styles.severityBreakdownContainer}>
                    <Text style={styles.severityBreakdownTitle}>DSI Details:</Text>
                    <View style={styles.severityBreakdownRow}>
                      <Text style={[styles.severityBreakdownItem, { color: '#374151' }]}>
                        Actual Score: {defectSeverityIndex.actualSeverityScore}
                      </Text>
                      <Text style={[styles.severityBreakdownItem, { color: '#374151' }]}>
                        Max Score: {defectSeverityIndex.maximumSeverityScore}
                      </Text>
                    </View>
                    <Text style={styles.severityTotalDefects}>
                      Total Defects: {defectSeverityIndex.totalDefects}
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.metricScoreNum, { color: '#9ca3af', fontSize: 32, marginBottom: 8 }]}>
                    --
                  </Text>
                  <Text style={[styles.metricScoreLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 8 }]}>
                    Weighted severity score (higher = more severe defects)
                  </Text>
                  <View style={[styles.metricRatioBadge, { backgroundColor: '#9ca3af', marginBottom: 8 }]}>
                    <Text style={styles.metricRatioBadgeText}>NO DATA</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Defect to Remark Ratio Section */}
        <View style={styles.severityCardGroup}>
          <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
            <View style={styles.severityCardHeader}>
              <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect to Remark Ratio</Text>
            </View>
            <View style={[styles.metricRatioWrap, { alignItems: 'center', marginTop: 10 }]}>
              {defectRemarkRatio ? (
                <>
                  <Text style={[styles.metricRatioNum, { fontSize: 36, marginBottom: 8 }]}>
                    {defectRemarkRatio.ratio}
                  </Text>
                  <Text style={[styles.metricRatioLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 12 }]}>
                    Defect to Remark Ratio (%)
                  </Text>
                  <View style={[
                    styles.metricRatioBadge, 
                    { 
                      backgroundColor: getRatioStatusColor(defectRemarkRatio.category), 
                      marginBottom: 15 
                    }
                  ]}>
                    <Text style={styles.metricRatioBadgeText}>
                      {defectRemarkRatio.category.toUpperCase()}
                    </Text>
              </View>
              {/* Horizontal Meter */}
              <View style={styles.ratioMeterContainer}>
                <View style={styles.ratioMeterTrack}>
                      <View style={[
                        styles.ratioMeterFill, 
                        { 
                          width: `${defectRemarkRatio.percentage}%`,
                          backgroundColor: getRatioStatusColor(defectRemarkRatio.category)
                        }
                      ]} />
                      <View style={[
                        styles.ratioMeterThumb,
                        { 
                          left: `${defectRemarkRatio.percentage}%`,
                          borderColor: getRatioStatusColor(defectRemarkRatio.category)
                        }
                      ]} />
                </View>
                <View style={styles.ratioMeterLabels}>
                  <Text style={styles.ratioMeterLabel}>0.0</Text>
                  <Text style={styles.ratioMeterLabel}>0.5</Text>
                  <Text style={styles.ratioMeterLabel}>1.0</Text>
                </View>
              </View>
                  {/* Additional Details */}
                  <View style={styles.ratioDetailsContainer}>
                    <Text style={styles.ratioDetailsText}>
                      Defects: {defectRemarkRatio.defectCount} | Remarks: {defectRemarkRatio.remarkCount}
                    </Text>
            </View>
                </>
              ) : (
                <>
                  <Text style={[styles.metricRatioNum, { fontSize: 36, marginBottom: 8, color: '#9ca3af' }]}>
                    --%
                  </Text>
                  <Text style={[styles.metricRatioLabel, { textAlign: 'center', fontSize: 14, color: '#6b7280', marginBottom: 12 }]}>
                    Defect to Remark Ratio (%)
                  </Text>
                  <View style={[styles.metricRatioBadge, { backgroundColor: '#9ca3af', marginBottom: 15 }]}>
                    <Text style={styles.metricRatioBadgeText}>NO DATA</Text>
                  </View>
                  {/* Horizontal Meter */}
                  <View style={styles.ratioMeterContainer}>
                    <View style={styles.ratioMeterTrack}>
                      <View style={[styles.ratioMeterFill, { width: '0%', backgroundColor: '#9ca3af' }]} />
                      <View style={[styles.ratioMeterThumb, { left: '0%', borderColor: '#9ca3af' }]} />
                    </View>
                    <View style={styles.ratioMeterLabels}>
                      <Text style={styles.ratioMeterLabel}>0.0</Text>
                      <Text style={styles.ratioMeterLabel}>0.5</Text>
                      <Text style={styles.ratioMeterLabel}>1.0</Text>
                    </View>
                  </View>
                </>
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

       {/* Defect Distribution by Type Section */}
       <View style={styles.severityCardGroup}>
         <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
           <View style={styles.severityCardHeader}>
             <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defect Distribution by Type</Text>
           </View>
           <View style={{ alignItems: 'center', marginTop: 10 }}>
             {(() => {
               const hasData = defectTypeDistribution && defectTypeDistribution.defectTypes.some(dt => dt.defectCount > 0);
               console.log('Rendering defect type chart - hasData:', hasData, 'defectTypeDistribution:', defectTypeDistribution);
               return hasData;
             })() ? (
               <>
                 {/* Pie Chart */}
                 <View style={styles.smallPieChartContainer}>
                   <Svg width={120} height={120} viewBox="0 0 120 120">
                     {(() => {
                       if (!defectTypeDistribution) return null;
                       const chartColors = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'];
                       const total = defectTypeDistribution.defectTypes.reduce((sum, dt) => sum + dt.defectCount, 0);
                       
                       console.log('Pie chart data:', { total, defectTypes: defectTypeDistribution.defectTypes });
                       
                       // Handle case when total is 0
                       if (total === 0) {
                         return (
                           <Circle
                             cx="60"
                             cy="60"
                             r="60"
                             fill="#f3f4f6"
                             stroke="#d1d5db"
                             strokeWidth={2}
                           />
                         );
                       }
                       
                       // Handle case when there's only one segment with value > 0
                       const nonZeroItems = defectTypeDistribution.defectTypes.filter(dt => dt.defectCount > 0);
                       if (nonZeroItems.length === 1) {
                         return (
                           <Circle
                             cx="60"
                             cy="60"
                             r="60"
                             fill={chartColors[defectTypeDistribution.defectTypes.findIndex(dt => dt.defectCount > 0) % chartColors.length]}
                             stroke="#fff"
                             strokeWidth={2}
                           />
                         );
                       }
                       
                       let currentAngle = 0;
                       
                       return defectTypeDistribution.defectTypes.map((defectType, index) => {
                         if (defectType.defectCount === 0) return null;
                         const angle = (defectType.defectCount / total) * 360;
                         const startAngle = currentAngle;
                         const endAngle = currentAngle + angle;
                         currentAngle += angle;
                         
                         console.log(`Segment ${index}:`, { defectType: defectType.defectType, count: defectType.defectCount, angle, startAngle, endAngle });
                         
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
                             key={defectType.defectType}
                             d={pathData}
                             fill={chartColors[index % chartColors.length]}
                             stroke="#fff"
                             strokeWidth={1}
                           />
                         );
                       });
                     })()}
                   </Svg>
                 </View>

                 <View style={styles.pieLegend}>
                   {defectTypeDistribution?.defectTypes.map((defectType, index) => (
                     <View key={defectType.defectType} style={styles.pieLegendItem}>
                       <View style={[styles.pieLegendDot, { backgroundColor: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'][index % 6] }]} />
                       <Text style={styles.pieLegendLabel}>
                         {defectType.defectType}: {defectType.defectCount} ({defectType.percentage.toFixed(1)}%)
                       </Text>
                     </View>
                   ))}
                 </View>
                 <View style={styles.pieCardFooter}>
                   <Text style={styles.pieCardFooterTotal}>{defectTypeDistribution?.totalDefectCount}</Text>
                   <Text style={styles.pieCardFooterLabel}>Total Defects</Text>
                   <Text style={styles.pieCardFooterMost}>{defectTypeDistribution?.mostCommonDefectCount}</Text>
                   <Text style={styles.pieCardFooterMostLabel}>Most Common
                     <Text style={styles.pieCardFooterMostType}> {defectTypeDistribution?.mostCommonDefectType}</Text>
                   </Text>
                 </View>
               </>
             ) : (
               <>
                 {/* No data from backend - don't show pie chart */}
                 <View style={styles.pieLegend}>
                   <Text style={styles.noDataText}>No defect type data available</Text>
                 </View>
                 <View style={styles.pieCardFooter}>
                   <Text style={styles.pieCardFooterTotal}>--</Text>
                   <Text style={styles.pieCardFooterLabel}>Total Defects</Text>
                   <Text style={styles.pieCardFooterMost}>--</Text>
                   <Text style={styles.pieCardFooterMostLabel}>Most Common
                     <Text style={styles.pieCardFooterMostType}> No Data</Text>
                   </Text>
                 </View>
               </>
             )}
           </View>
         </View>
       </View>


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
 
       
       
       {/* Defect by Module Section */}
       <View style={styles.severityCardGroup}>
         <View style={[styles.severityCard, { borderColor: 'transparent', backgroundColor: '#fff' }]}>
           <View style={styles.severityCardHeader}>
             <Text style={[styles.severityCardTitle, { color: '#03084a' }]}>Defects by Module</Text>
           </View>
           <View style={{ alignItems: 'center', marginTop: 10 }}>
             {(() => {
               const hasData = defectByModule && defectByModule.length > 0 && defectByModule.some(module => module.value > 0);
               console.log('Rendering defect by module chart - hasData:', hasData, 'defectByModule:', defectByModule);
               return hasData;
             })() ? (
               <>
                 {/* Pie Chart */}
                 <View style={styles.smallPieChartContainer}>
                   <Svg width={120} height={120} viewBox="0 0 120 120">
                     {(() => {
                       const chartColors = ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'];
                       const total = defectByModule.reduce((sum, module) => sum + module.value, 0);
                       
                       console.log('Pie chart data:', { total, modules: defectByModule });
                       
                       // Handle case when total is 0
                       if (total === 0) {
                         return (
                           <Circle
                             cx="60"
                             cy="60"
                             r="60"
                             fill="#f3f4f6"
                             stroke="#d1d5db"
                             strokeWidth={2}
                           />
                         );
                       }
                       
                       // Handle case when there's only one module with value > 0
                       const nonZeroModules = defectByModule.filter(module => module.value > 0);
                       if (nonZeroModules.length === 1) {
                         return (
                           <Circle
                             cx="60"
                             cy="60"
                             r="60"
                             fill={chartColors[defectByModule.findIndex(module => module.value > 0) % chartColors.length]}
                             stroke="#fff"
                             strokeWidth={2}
                           />
                         );
                       }
                       
                       let currentAngle = 0;
                       
                       return defectByModule.map((module, index) => {
                         if (module.value === 0) return null;
                         const angle = (module.value / total) * 360;
                         const startAngle = currentAngle;
                         const endAngle = currentAngle + angle;
                         currentAngle += angle;
                         
                         console.log(`Module ${index}:`, { name: module.name, value: module.value, angle, startAngle, endAngle });
                         
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
                             key={module.moduleId}
                             d={pathData}
                             fill={chartColors[index % chartColors.length]}
                             stroke="#fff"
                             strokeWidth={1}
                           />
                         );
                       });
                     })()}
                   </Svg>
                 </View>

                 {/* Legend */}
                 <View style={styles.pieLegend}>
                   {defectByModule.map((module, index) => (
                     <View key={module.moduleId} style={styles.pieLegendItem}>
                       <View style={[styles.pieLegendDot, { backgroundColor: ['#3b82f6', '#10b981', '#fbbf24', '#ef4444', '#8b5cf6', '#f59e0b'][index % 6] }]} />
                       <Text style={styles.pieLegendLabel}>
                         {module.name}: {module.value} ({module.percentage.toFixed(1)}%)
                       </Text>
                     </View>
                   ))}
                 </View>

                 {/* Summary */}
                 <View style={styles.pieCardFooter}>
                   <Text style={styles.pieCardFooterTotal}>{defectByModule.reduce((sum, module) => sum + module.value, 0)}</Text>
                   <Text style={styles.pieCardFooterLabel}>Total Defects</Text>
                   <Text style={styles.pieCardFooterMost}>
                     {defectByModule.reduce((max, module) => module.value > max.value ? module : max, defectByModule[0]).value}
                   </Text>
                   <Text style={styles.pieCardFooterMostLabel}>Most Common
                     <Text style={styles.pieCardFooterMostType}> {defectByModule.reduce((max, module) => module.value > max.value ? module : max, defectByModule[0]).name}</Text>
                   </Text>
                 </View>
               </>
             ) : (
               <>
                 {/* No data from backend - don't show pie chart */}
                 <View style={styles.pieLegend}>
                   <Text style={styles.noDataText}>No Data</Text>
                 </View>
                 <View style={styles.pieCardFooter}>
                   <Text style={styles.pieCardFooterTotal}>--</Text>
                   <Text style={styles.pieCardFooterLabel}>Total Defects</Text>
                   <Text style={styles.pieCardFooterMost}>--</Text>
                   <Text style={styles.pieCardFooterMostLabel}>Most Common
                     <Text style={styles.pieCardFooterMostType}> No Data</Text>
                   </Text>
                 </View>
               </>
             )}
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
                  console.log('Pie chart data:', { total, items: selectedCard.items });
                  
                  // Handle case when total is 0 or very small
                  if (total === 0) {
                    return (
                      <Circle
                        cx={100}
                        cy={100}
                        r={100}
                        fill="#f3f4f6"
                        stroke="#d1d5db"
                        strokeWidth={2}
                      />
                    );
                  }
                  
                  // Handle case when total is 1 (show a simple circle with the dominant color)
                  const nonZeroItems = selectedCard.items.filter((item: any) => item.value > 0);
                  if (total === 1) {
                    // Find the item with value 1 (or the first non-zero item)
                    const dominantItem = nonZeroItems.find((item: any) => item.value === 1) || nonZeroItems[0];
                    return (
                      <Circle
                        cx={100}
                        cy={100}
                        r={100}
                        fill={dominantItem?.color || '#f3f4f6'}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    );
                  }
                  
                  let currentAngle = 0;
                  const segments = selectedCard.items
                    .filter((item: any) => item.value > 0)
                    .map((item: any, idx: any) => {
                      console.log(`Processing segment ${idx}:`, item);
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
                      
                      return {
                        key: item.label,
                        pathData,
                        color: item.color
                      };
                    });
                  
                  console.log('Generated segments:', segments);
                  
                  // If no segments are generated, show a default circle
                  if (segments.length === 0) {
                    return (
                      <Circle
                        cx={100}
                        cy={100}
                        r={100}
                        fill="#f3f4f6"
                        stroke="#d1d5db"
                        strokeWidth={2}
                      />
                    );
                  }
                  
                  return segments.map((segment: any) => (
                    <Path
                      key={segment.key}
                      d={segment.pathData}
                      fill={segment.color}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  ));
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

const styles = StyleSheet.create({

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
    shadowOffset: { width: 0, height: 2 },
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
    left: 25,
    bottom: 15,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  sevenLabel: {
    position: 'absolute',
    left: 95,
    top: 20,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  tenLabel: {
    position: 'absolute',
    right: 95,
    top: 20,
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
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#03084a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noProjectsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ratioDetailsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  ratioDetailsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  severityBreakdownContainer: {
    marginTop: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  severityBreakdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  severityBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  severityBreakdownItem: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  severityTotalDefects: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  densityDetailsContainer: {
    marginTop: 12,
    alignItems: 'center',
  },
  densityDetailsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  densityUnitText: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  changeIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  changeIndicatorText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
  },

  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
  // Module styles
  moduleListContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  moduleItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    flex: 1,
  },
  moduleTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  moduleStats: {
    marginBottom: 8,
  },
  moduleStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  moduleStatLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  severityDistribution: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  severityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  severityBars: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  severityBar: {
    height: '100%',
  },
  severityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  moduleSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
  },
  moduleSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  moduleSummaryText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  // End of StyleSheet
});

export default ProjectDetails;
