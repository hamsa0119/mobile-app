
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity, BackHandler, Alert, PanResponder, Dimensions } from 'react-native';
import HomeScreen from './src/screens/home';
import LoginScreen from './src/screens/login';
import ForgotPasswordScreen from './src/screens/forgotPassword';
import Dashboard from './src/screens/dashboard';
import ProjectDetails from './src/screens/projectdetails';


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentPage, setCurrentPage] = useState<'login' | 'forgotPassword' | 'dashboard' | 'home' | 'projectdetails'>('home');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedProjectRisk, setSelectedProjectRisk] = useState<'high' | 'medium' | 'low'>('low');

  // Navigation history stack
  const [navigationStack, setNavigationStack] = useState<string[]>(['home']);

  // Navigate to a new page and update stack
  const navigateToPage = (page: 'login' | 'forgotPassword' | 'dashboard' | 'home' | 'projectdetails') => {
    setCurrentPage(page);
    setNavigationStack(prev => [...prev, page]);
  };

  // Handle hardware back button
  const handleBackPress = () => {
    if (navigationStack.length > 1) {
      // Remove current page from stack
      const newStack = [...navigationStack];
      newStack.pop();
      const previousPage = newStack[newStack.length - 1];

      setNavigationStack(newStack);
      setCurrentPage(previousPage as 'login' | 'forgotPassword' | 'dashboard' | 'home' | 'projectdetails');
      return true; // Prevent default back action
    } else {
      // Show exit confirmation when no previous screen
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit the app?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => {} },
          { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() }
        ]
      );
      return true; // Prevent default back action
    }
  };

  // Set up back handler
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [navigationStack]);

  // Swipe gesture handler for left-to-right swipe
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to gestures that start near the left edge of the screen
      const { pageX } = evt.nativeEvent;
      const screenWidth = Dimensions.get('window').width;
      const edgeThreshold = screenWidth * 0.1; // 10% of screen width from left edge
      return pageX <= edgeThreshold;
    },

    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      // Only respond to horizontal swipes (more horizontal than vertical)
      return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10;
    },

    onPanResponderGrant: (evt, gestureState) => {
      // Gesture started
    },

    onPanResponderMove: (evt, gestureState) => {
      // Track the gesture movement
    },

    onPanResponderRelease: (evt, gestureState) => {
      const { dx, dy, vx } = gestureState;
      const screenWidth = Dimensions.get('window').width;

      // Check if it's a valid left-to-right swipe
      const isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
      const isLeftToRightSwipe = dx > 0;
      const hasMinimumDistance = Math.abs(dx) > screenWidth * 0.2; // 20% of screen width
      const hasMinimumVelocity = Math.abs(vx) > 0.3; // Minimum swipe velocity

      if (isHorizontalSwipe && isLeftToRightSwipe && (hasMinimumDistance || hasMinimumVelocity)) {
        // Trigger back navigation
        handleBackPress();
      }
    },

    onPanResponderTerminate: (evt, gestureState) => {
      // Gesture was terminated
    },
  });

  const handleLoginSuccess = () => {
    navigateToPage('dashboard');
  };

  const handleProjectSelect = (projectName: string, riskLevel: 'high' | 'medium' | 'low') => {
    setSelectedProject(projectName);
    setSelectedProjectRisk(riskLevel);
    navigateToPage('projectdetails');
  };

  const handleLogout = () => {
    // Reset navigation stack and go to login
    setNavigationStack(['login']);
    setCurrentPage('login');
  };

  const handleForgotPassword = () => {
    navigateToPage('forgotPassword');
  };

  const handleBackToLogin = () => {
    // Reset navigation stack and go to login
    setNavigationStack(['login']);
    setCurrentPage('login');
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentPage === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={handleForgotPassword}
        />
      )}
      {currentPage === 'forgotPassword' && (
        <ForgotPasswordScreen
          onResetSuccess={handleBackToLogin}
        />
      )}
      {currentPage === 'dashboard' && <Dashboard onProjectSelect={handleProjectSelect} onLogout={handleLogout} />}
      {currentPage === 'home' && <HomeScreen onGetStarted={() => navigateToPage('login')} />}
      {currentPage === 'projectdetails' && <ProjectDetails selectedProject={selectedProject} selectedProjectRisk={selectedProjectRisk} onLogout={handleLogout} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
