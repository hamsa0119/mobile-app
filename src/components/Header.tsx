import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

const defaultAvatar = require('../../assert/photo.jpeg');

const Header: React.FC<HeaderProps> = ({ userName = 'Zayal', onLogout }) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.row}>
        <Image source={defaultAvatar} style={styles.profileImage} />
        <View style={styles.textSection}>
          <Text style={styles.greeting}>Hello Zayal</Text>
          <Text style={styles.subtitle}>Track Your Next Defect</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M16 17l5-5-5-5"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M21 12H9"
              stroke="#03084a"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'hsla(147, 33%, 95%, 0.78)',
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    // No borderRadius, no shadow, no elevation
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#03084a',
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 18,
    color: '#03084a',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    textAlign: 'left',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#03084a',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Avenir Next' : 'sans-serif',
    textAlign: 'left',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#03084a',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Header;
