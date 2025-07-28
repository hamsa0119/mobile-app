import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  ImageBackground,
  Image,
} from 'react-native';


const { width, height } = Dimensions.get('window');
// Place your geometric background image in assets/bg.png
const backgroundImage = require('../../assert/2.jpeg');

const logoImage = require('../../assert/bug.png'); // Adjust path as needed

interface HomeScreenProps {
  onGetStarted?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onGetStarted }) => {
  return (
    <ImageBackground source={backgroundImage} style={styles.bgImage} resizeMode="cover">
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Image source={logoImage} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.appName}>Defect Tracker</Text>
          <Text style={styles.tagline}>ELITE ISSUE TRACKING</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Experience the Next Generation of Excellence</Text>
          <Text style={styles.cardDescription}>
            Seamlessly monitor, organize, and resolve issues with our advanced tracking solution.
          </Text>
          <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={onGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
            <Text style={styles.buttonArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.learnMore}>Learn More</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>© 2024 DefectTracker</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(31,41,55,0.55)', // dark overlay for readability
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#1f2937', // changed to dark blue
    borderWidth: 3,
    borderColor: '#bfa14a', // gold border
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  logoIcon: {
    fontSize: 38,
    color: '#2563eb',
  },
  logoImage: {
    width: 68,
    height: 68,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 2,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 13,
    color: '#cbd5e1',
    letterSpacing: 2.5,
    marginBottom: 2,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    // Custom font: Winky Rough must be linked in the project assets
    fontFamily: 'Winky Rough',
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(237,222,201,0.95)',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 10,
    marginBottom: 18,
    borderColor: '#bfa14a', // gold border
    borderWidth: 3, // bolder border
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#03084a', // changed to dark blue
    textAlign: 'center',
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 30,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardDescription: {
    fontSize: 15,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    // Custom font: Caveat must be linked in the project assets
    fontFamily: 'Caveat',
    letterSpacing: 0.5,
    fontWeight: '400',
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1f2937', // changed from #2563eb to dark blue
    paddingVertical: 15,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    textTransform: 'uppercase',
  },
  buttonArrow: {
    color: '#fff',
    fontSize: 22,
    marginLeft: 10,
    fontWeight: '300',
  },
  learnMore: {
    color: '#03084a', // changed to dark blue
    fontSize: 15,
    textDecorationLine: 'underline',
    marginTop: 2,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-condensed',
    letterSpacing: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  copyright: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 18 : 8,
    color: '#cbd5e1',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
    zIndex: 2,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Trebuchet MS' : 'sans-serif-condensed',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

export default HomeScreen;

