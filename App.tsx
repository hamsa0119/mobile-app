
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, TouchableOpacity } from 'react-native';
import HomeScreen from './src/screens/home';
import LoginScreen from './src/screens/login';
import ForgotPasswordScreen from './src/screens/forgotPassword';
import Dashboard from './src/screens/dashboard';
import ProjectDetails from './src/screens/projectdetails';


function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [currentPage, setCurrentPage] = useState<'login' | 'forgotPassword' | 'dashboard' | 'home' | 'projectdetails'>('home');
  const [selectedProject, setSelectedProject] = useState<string>('');

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleProjectSelect = (projectName: string) => {
    setSelectedProject(projectName);
    setCurrentPage('projectdetails');
  };

  const handleLogout = () => {
    setCurrentPage('login');
  };

  const handleForgotPassword = () => {
    setCurrentPage('forgotPassword');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentPage === 'login' && (
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onBack={() => setCurrentPage('home')} 
          onForgotPassword={handleForgotPassword}
        />
      )}
      {currentPage === 'forgotPassword' && (
        <ForgotPasswordScreen 
          onBack={handleBackToLogin}
          onResetSuccess={handleBackToLogin}
        />
      )}
      {currentPage === 'dashboard' && <Dashboard onProjectSelect={handleProjectSelect} onBack={() => setCurrentPage('login')} onLogout={handleLogout} />}
      {currentPage === 'home' && <HomeScreen onGetStarted={() => setCurrentPage('login')} />}
      {currentPage === 'projectdetails' && <ProjectDetails onBack={() => setCurrentPage('dashboard')} selectedProject={selectedProject} onLogout={handleLogout} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
