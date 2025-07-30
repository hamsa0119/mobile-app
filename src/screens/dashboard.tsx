import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Dimensions,
  SafeAreaView,
  PanResponder,
  ImageBackground,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Header from '../components/Header';
import { getAllProjects, Project } from '../api/projectget';
import { getProjectCardColors, ProjectCardColor, getDefaultProjectCardColor } from '../api/projectcardcolor';

// Define the dashboard project type
type DashboardProject = {
  name: string;
  risk: 'high' | 'medium' | 'low';
  id?: number;
  status?: string;
  projectName?: string;
  projectStatus?: string;
};

// Dynamic status configuration - will be calculated based on project data
const getStatusConfig = (projects: DashboardProject[], getRiskLevelFromCardColor: (projectId: number | undefined) => 'high' | 'medium' | 'low') => {
  // Count projects by risk level based on card colors
  const highRiskCount = projects.filter(p => getRiskLevelFromCardColor(p.id) === 'high').length;
  const mediumRiskCount = projects.filter(p => getRiskLevelFromCardColor(p.id) === 'medium').length;
  const lowRiskCount = projects.filter(p => getRiskLevelFromCardColor(p.id) === 'low').length;

  return [
    {
      key: 'high',
      label: 'High Risk Projects',
      count: highRiskCount,
      color: '#ad0c0c',
      icon: '🛑',
      border: '#ad0c0c',
      borderDark: '#b71c1c',
      bg: '#fff5f5',
      dot: '#ad0c0c',
      tag: 'High Risk',
    },
    {
      key: 'medium',
      label: 'Medium Risk Projects ',
      count: mediumRiskCount,
      color: '#e3b707',
      icon: '⚠️',
      border: '#fbbf24',
      borderDark: '#e3b707',
      bg: '#fffbe6',
      dot: '#e3b707',
      tag: 'Medium Risk',
    },
    {
      key: 'low',
      label: 'Low\nRisk\nProject',
      count: lowRiskCount,
      color: '#0b9c40',
      icon: '✅',
      border: '#0b9c40',
      borderDark: '#166534',
      bg: '#f0fff4',
      dot: '#0b9c40',
      tag: 'Low Risk',
    },
  ];
};

const PROJECTS = [
  { name: 'Defect Tracker', risk: 'high' },
  { name: 'QA testing', risk: 'high' },
  { name: 'project 1', risk: 'low' },
  { name: 'Heart', risk: 'low' },
  { name: 'Dashbord testing', risk: 'low' },
  { name: 'JALI', risk: 'low' },
  { name: 'Hello world', risk: 'low' },
  { name: 'dashborad test', risk: 'medium' },
];

const FILTERS = [
  { key: 'all', label: 'All Projects' },
  { key: 'high', label: 'High Risk' },
  { key: 'medium', label: 'Medium Risk' },
  { key: 'low', label: 'Low Risk' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 500;

const DARK_BLUE = '#03084a';
const GOLD = '#bfa14a';

const ProjectCard = ({ color, icon, name, tag, onPress }: { color: string; icon: string; name: string; tag: string; onPress: () => void }) => {
  const [scale] = useState(new Animated.Value(1));
  const [translate] = useState(new Animated.ValueXY({ x: 0, y: 0 }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      // Calculate offset toward the press location (relative to card center)
      const { locationX, locationY } = evt.nativeEvent;
      const offsetX = (locationX - 65) * 0.12; // 65 = card center (width/2)
      const offsetY = (locationY - 65) * 0.12;
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.12,
          useNativeDriver: true,
          speed: 35,
          bounciness: 8,
        }),
        Animated.spring(translate, {
          toValue: { x: offsetX, y: offsetY },
          useNativeDriver: true,
          speed: 35,
          bounciness: 8,
        }),
      ]).start();
    },
    onPanResponderRelease: () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 10,
        }),
        Animated.spring(translate, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          speed: 40,
          bounciness: 10,
        }),
      ]).start(() => {
        // Call onPress after animation completes
        onPress();
      });
    },
    onPanResponderTerminate: () => {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 40,
          bounciness: 10,
        }),
        Animated.spring(translate, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          speed: 40,
          bounciness: 10,
        }),
      ]).start();
    },
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.projectCircle,
        {
          backgroundColor: color,
          transform: [
            { scale },
            { translateX: translate.x },
            { translateY: translate.y },
          ],
          shadowOpacity: 0.22,
          shadowRadius: 18,
          elevation: 8,
          borderColor: '#fff',
          borderWidth: 4,
        },
      ]}
    >
      <Text style={[styles.projectIcon, isSmallScreen && styles.projectIconMobile]}>
        {icon}
      </Text>
      <Text
        style={[styles.projectName, isSmallScreen && styles.projectNameMobile]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {name}
      </Text>
      <View style={[styles.projectTag, isSmallScreen && styles.projectTagMobile, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
        <Text style={[styles.projectTagText, isSmallScreen && styles.projectTagTextMobile]}>
          {tag}
        </Text>
      </View>
    </Animated.View>
  );
};

interface DashboardProps {
  onProjectSelect?: (projectName: string, riskLevel: 'high' | 'medium' | 'low') => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onProjectSelect, onLogout }) => {
  // API State
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectColors, setProjectColors] = useState<ProjectCardColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [filter, setFilter] = useState('all');
  const [showChart, setShowChart] = useState(false);

  // Fetch projects on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

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
      } else {
        console.warn('No projects returned from API');
        setProjects([]);
        setProjectColors([]);
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

  // Map API projects to dashboard format with risk levels
  const mapProjectsToDashboard = (apiProjects: Project[]) => {
    return apiProjects.map(project => {
      // Use projectStatus from API, fallback to status
      const status = project.projectStatus || project.status || '';
      
      // Map backend status to risk level
      let risk = 'low';
      if (status.toLowerCase().includes('high') || status.toLowerCase().includes('critical') || status.toLowerCase().includes('active')) {
        risk = 'high';
      } else if (status.toLowerCase().includes('medium') || status.toLowerCase().includes('moderate') || status.toLowerCase().includes('completed')) {
        risk = 'medium';
      }
      
      return {
        name: project.projectName || project.name,
        risk: risk as 'high' | 'medium' | 'low',
        id: project.id,
        status: project.status,
        projectName: project.projectName,
        projectStatus: project.projectStatus,
      };
    });
  };

  // Define the dashboard project type
  type DashboardProject = {
    name: string;
    risk: 'high' | 'medium' | 'low';
    id?: number;
    status?: string;
    projectName?: string;
    projectStatus?: string;
  };

  // Function to get risk level based on card color from API
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

  // Use API data with fallback to static data
  const dashboardProjects: DashboardProject[] = projects.length > 0 ? mapProjectsToDashboard(projects) : PROJECTS.map(p => ({ name: p.name, risk: p.risk as 'high' | 'medium' | 'low' }));
  
  // Get dynamic status configuration based on project data
  const statusConfig = getStatusConfig(dashboardProjects, getRiskLevelFromCardColor);
  
  // Filter projects based on card color risk level
  const filteredProjects = filter === 'all' 
    ? dashboardProjects 
    : dashboardProjects.filter(p => getRiskLevelFromCardColor(p.id) === filter);
  
  // Sort: high (red) first, then medium (yellow), then low (green)
  const riskOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const sortedProjects = [...filteredProjects].sort((a, b) => (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f8fa' }}>
      <Header onLogout={onLogout} />
      <ImageBackground
        source={require('../../assert/foto8.jpg')}
        style={{ flex: 1, width: '100%', height: '100%' }}
        resizeMode="cover"
      >
        <ScrollView 
          style={styles.bg} 
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

          {/* Header */}
          <Text style={[styles.header, { color: 'hsla(35, 23.10%, 66.90%, 0.95)' }]}>Dashboard Overview</Text>
          <Text style={[styles.subtitle, { color: 'rgba(163, 142, 117, 0.95)' }]}>Gain insights into your projects with real-time health metrics and status summaries</Text>
          <View style={[styles.underline, { backgroundColor: 'rgba(237, 222, 201, 0.95)' }]} />
          {/* Project Status Insights */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: 'rgba(237, 222, 201, 0.95)' }]}>Project Status Insights</Text>
            <View style={styles.statusCardGroup}>
              <View style={styles.statusRowFixed}>
                {statusConfig.filter(s => typeof s.count === 'number').map((s, idx) => (
                  <View
                    key={s.key}
                    style={[
                      styles.statusCard,
                      {
                        borderColor: s.borderDark,
                        backgroundColor: '#fff',
                        marginHorizontal: 2,
                        marginVertical: 0,
                        marginLeft: idx === 0 ? 0 : 2, // No extra left margin for the first card
                      },
                    ]}
                  >
                    <View style={styles.statusDotCornerWrap}>
                      <View style={[styles.statusDotCorner, { backgroundColor: s.dot }]} />
                    </View>
                    <View style={styles.statusCardContent}>
                      <View style={styles.statusIconWrap}>
                        <Text style={[styles.statusIcon, { backgroundColor: s.color + '22' }]}>{s.icon}</Text>
                      </View>
                      <Text style={styles.statusLabel}>{s.label.split('\n').map((line, idx) => <Text key={idx}>{line}{'\n'}</Text>)}</Text>
                      <Text
                        style={[
                          styles.statusCount,
                          { color: s.color },
                          (s.count === 3 || s.count === 19) ? styles.statusCountLower : null
                        ]}
                      >
                        {s.count}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Chart Modal */}
          {showChart && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Status Breakdown for High</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowChart(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Pie Chart */}
                <View style={styles.chartContainer}>
                  <Svg width={200} height={200} viewBox="0 0 200 200">
                    {/* NEW - Blue slice (~40%) */}
                    <Path
                      d="M 100 100 L 100 20 A 80 80 0 0 1 156.4 56.4 Z"
                      fill="#4F46E5"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* CLOSED - Dark Green slice (~30%) */}
                    <Path
                      d="M 100 100 L 156.4 56.4 A 80 80 0 0 1 156.4 143.6 Z"
                      fill="#166534"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* FIXED - Light Green slice (~15%) */}
                    <Path
                      d="M 100 100 L 156.4 143.6 A 80 80 0 0 1 120 180 Z"
                      fill="#22C55E"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* OPEN - Yellow slice (~10%) */}
                    <Path
                      d="M 100 100 L 120 180 A 80 80 0 0 1 80 180 Z"
                      fill="#EAB308"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* REOPEN - Red slice (~3%) */}
                    <Path
                      d="M 100 100 L 80 180 A 80 80 0 0 1 72 176 Z"
                      fill="#DC2626"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    {/* REJECTED - Dark Red slice (~2%) */}
                    <Path
                      d="M 100 100 L 72 176 A 80 80 0 0 1 100 20 Z"
                      fill="#7F1D1D"
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  </Svg>
                </View>

                {/* Legend */}
                <View style={styles.chartLegend}>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                      <Text style={styles.legendText}>REOPEN</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#4F46E5' }]} />
                      <Text style={styles.legendText}>NEW</Text>
                    </View>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#EAB308' }]} />
                      <Text style={styles.legendText}>OPEN</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                      <Text style={styles.legendText}>FIXED</Text>
                    </View>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#166534' }]} />
                      <Text style={styles.legendText}>CLOSED</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#7F1D1D' }]} />
                      <Text style={styles.legendText}>REJECTED</Text>
                    </View>
                  </View>
                  <View style={styles.legendRow}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
                      <Text style={styles.legendText}>DUPLICATE</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* All Projects */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: 'rgba(237, 222, 201, 0.95)' }]}>All Projects</Text>
            
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
              <>
            <View style={[styles.filterRow, isSmallScreen && styles.filterRowMobile]}>
              <View style={[styles.filterBar, isSmallScreen && styles.filterBarMobile]}>
                {/* Always show "All Projects" filter */}
                    <TouchableOpacity
                  key="all"
                      style={[
                        styles.filterBtn,
                    filter === 'all' && { backgroundColor: '#03084a', shadowColor: '#03084a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6, elevation: 2 },
                        isSmallScreen && styles.filterBtnMobile
                      ]}
                  onPress={() => setFilter('all')}
                    >
                      <Text style={[
                        styles.filterBtnText,
                    filter === 'all' && { color: '#fff' },
                        isSmallScreen && styles.filterBtnTextMobile
                  ]}>All Projects</Text>
                    </TouchableOpacity>

                {/* Always show all risk filters */}
                {(() => {
                  const availableRisks = new Set(dashboardProjects.map(p => getRiskLevelFromCardColor(p.id)));
                  console.log('Available risks from card colors:', Array.from(availableRisks));
                  
                  const riskFilters = [
                    { key: 'high', label: 'High Risk', bg: '#ad0c0c', text: '#fff' },
                    { key: 'medium', label: 'Medium Risk', bg: '#e3b707', text: '#fff' },
                    { key: 'low', label: 'Low Risk', bg: '#0b9c40', text: '#fff' }
                  ];

                  return riskFilters
                    .map(riskFilter => (
                      <TouchableOpacity
                        key={riskFilter.key}
                        style={[
                          styles.filterBtn,
                          filter === riskFilter.key && { 
                            backgroundColor: riskFilter.bg, 
                            shadowColor: riskFilter.bg, 
                            shadowOffset: { width: 0, height: 2 }, 
                            shadowOpacity: 0.10, 
                            shadowRadius: 6, 
                            elevation: 2 
                          },
                          isSmallScreen && styles.filterBtnMobile
                        ]}
                        onPress={() => setFilter(riskFilter.key)}
                      >
                        <Text style={[
                          styles.filterBtnText,
                          filter === riskFilter.key && { color: riskFilter.text },
                          isSmallScreen && styles.filterBtnTextMobile
                        ]}>{riskFilter.label}</Text>
                      </TouchableOpacity>
                    ));
                })()}
              </View>
            </View>
                
                {sortedProjects.length > 0 ? (
            <View style={styles.projectGridFixed}>
              {sortedProjects.map((p, i) => {
                  // Find custom color for this project
                  const customColor = projectColors.find(color => color.projectId === p.id);
                  
                  // Convert gradient to solid color for project cards
                  let cardColor = '#6b7280'; // Default gray color
                  let riskLevel = 'low'; // Default risk level
                  
                  if (customColor && customColor.projectCardColor) {
                    // Extract color from gradient string like "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    const gradientMatch = customColor.projectCardColor.match(/from-(\w+)-(\d+)/);
                    if (gradientMatch) {
                      const colorName = gradientMatch[1];
                      const intensity = gradientMatch[2];
                      
                      // Map Tailwind color names to hex values
                      const colorMap: { [key: string]: { [key: string]: string } } = {
                        yellow: {
                          '400': '#fbbf24',
                          '500': '#f59e0b',
                          '600': '#d97706',
                        },
                        red: {
                          '400': '#f87171',
                          '500': '#ef4444',
                          '600': '#dc2626',
                        },
                        green: {
                          '400': '#4ade80',
                          '500': '#22c55e',
                          '600': '#16a34a',
                        },
                        blue: {
                          '400': '#60a5fa',
                          '500': '#3b82f6',
                          '600': '#2563eb',
                        },
                        gray: {
                          '400': '#9ca3af',
                          '500': '#6b7280',
                          '600': '#4b5563',
                        },
                      };
                      
                      cardColor = colorMap[colorName]?.[intensity] || '#6b7280';
                      
                      // Determine risk level based on color
                      if (colorName === 'yellow') {
                        riskLevel = 'medium';
                      } else if (colorName === 'red') {
                        riskLevel = 'high';
                      } else if (colorName === 'green') {
                        riskLevel = 'low';
                      }
                    }
                  } else {
                    // Fallback to original risk-based color
                    const statusObj = statusConfig.find(s => s.key === p.risk) || statusConfig[2];
                    cardColor = statusObj.color;
                    riskLevel = p.risk;
                  }
                  
                  // Get status object based on determined risk level
                  const statusObj = statusConfig.find(s => s.key === riskLevel) || statusConfig[2];
                  
                                  return (
                    <ProjectCard
                      key={p.id || p.name + i}
                      color={cardColor}
                    icon={"✔️"}
                    name={p.name}
                    tag={statusObj.tag}
                    onPress={() => onProjectSelect && onProjectSelect(p.name, getRiskLevelFromCardColor(p.id))}
                  />
                );
              })}
            </View>
                ) : (
                  <View style={styles.noProjectsContainer}>
                    <Text style={styles.noProjectsText}>No projects available</Text>
                    <Text style={styles.noProjectsSubtext}>Try refreshing or check your connection</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#03084a',
    marginTop: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 2,

  },
  headerMobile: {
    fontSize: 26,
    marginTop: 18,
  },
  subtitle: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
  },
  subtitleMobile: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  underline: {
    width: 120,
    height: 5,
    backgroundColor: '#a78bfa',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 18,
  },
  section: {
    width: '96%',
    marginTop: 18,
    marginBottom: 8,
    alignSelf: 'center',
  },
  sectionMobile: {
    width: '99%',
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181c32',
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
  },
  sectionTitleMobile: {
    fontSize: 17,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 16,
    marginHorizontal: 0,
    padding: 18,
    minWidth: 120,
    maxWidth: 220,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  statusCardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    paddingVertical: 12,
  },
  statusIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    width: 56,
    marginBottom: 12,
    display: 'flex',
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  statusIcon: {
    fontSize: 32,
    width: 60,
    height: 60,
    borderRadius: 24,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'transparent',
    marginRight: 0,
    marginLeft: 0,
    marginBottom: 0,
    lineHeight: 48,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIconMobile: {
    fontSize: 26,
    width: 34,
    height: 34,
    borderRadius: 17,
    lineHeight: 34,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
    marginTop: 2,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    textAlign: 'center',
    lineHeight: 22,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  statusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 2,
  },
  statusCount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 4,
    textAlign: 'center',
    height: 38,
    lineHeight: 28,
    minHeight: 38,
  },
  statusCountMobile: {
    fontSize: 22,
  },
  statusDesc: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  statusDescMobile: {
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  filterRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  filterLabel: {
    fontSize: 15,
    color: '#181c32',
    marginRight: 10,
    fontWeight: '500',
  },
  filterLabelMobile: {
    marginRight: 0,
    marginBottom: 6,
    textAlign: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(237, 222, 201, 0.95)',
    borderRadius: 24,
    padding: 4,
    elevation: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBarMobile: {
    width: '100%',
    justifyContent: 'center',
    padding: 2,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  filterBtnMobile: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginHorizontal: 1,
  },
  filterBtnActive: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  filterBtnText: {
    color: '#181c32',
    fontWeight: 'bold',
    fontSize: 15,
  },
  filterBtnTextActive: {
    color: '#fff',
  },
  filterBtnTextMobile: {
    fontSize: 13,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 8,
  },
  projectGridMobile: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'center',
    marginTop: 4,
  },
  projectCircle: {
    width: '45%',
    maxWidth: 180,
    aspectRatio: 1,
    borderRadius: 90,
    margin: '2.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#fff',
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    // Add outer white border effect
    backgroundColor: 'transparent',
  },
  projectCircleMobile: {
    width: 90,
    height: 90,
    borderRadius: 45,
    margin: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderColor: '#fff',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  projectIcon: {
    fontSize: 36,
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  projectIconMobile: {
    fontSize: 28,
    marginBottom: 4,
    lineHeight: 32,
  },
  projectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    marginHorizontal: 8,
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif-medium',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  projectNameMobile: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 16,
    marginHorizontal: 6,
  },
  projectTag: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'center',
    minWidth: 60,
    maxWidth: 100,
  },
  projectTagMobile: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginTop: 2,
    minWidth: 50,
    maxWidth: 80,
  },
  projectTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  projectTagTextMobile: {
    fontSize: 10,
  },
  statusRowFixed: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    width: '100%',
    gap: 4,
  },
  projectGridFixed: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: 8,
    rowGap: 20,
    columnGap: 0,
  },
  statusDotCornerWrap: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  statusDotCorner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e53935',
    borderWidth: 2,
    borderColor: '#fff',
  },
  statusCountsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 4,
    marginBottom: 8,
  },
  statusCountWrap: {
    flex: 1,
    alignItems: 'center',
  },
  statusCountLower: {
    marginTop: 0,
    marginBottom: 10,
  },

  statusCardGroup: {
    backgroundColor: 'rgba(237, 222, 201, 0.95)',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 12,
    marginHorizontal: 8,
    borderWidth: 4,
    borderColor: '#bfa14a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 850,
    alignSelf: 'center',
    width: '100%',
  },
  viewChartButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewChartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
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
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartLegend: {
    width: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  // Loading and Error States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  noProjectsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noProjectsText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noProjectsSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default Dashboard;
